import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { jsPDF } from 'jspdf';

function formatKES(n: number | string | null | undefined) {
  if (n == null) return 'KES 0';
  const num = Number(n) || 0;
  return 'KES ' + num.toLocaleString('en-KE');
}

const PaymentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { booking } = useBooking();
  const [phone, setPhone] = useState(booking.phone || '');
  const [amount, setAmount] = useState(booking.price || 0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initiatePayment = async () => {
    if (!phone || !amount) {
      setMessage('Please enter phone and amount');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount, accountNumber: booking.service || 'booking' }),
      });
      const data = await res.json();
      setMessage(data.msg || 'Payment initiated. Follow the prompt on your phone.');
      // prefer the returned persisted transaction id (server returns transaction when possible)
      const txId = data?.transaction?.id || data?.darajaResponse?.CheckoutRequestID;
      if (txId) {
        // start polling by txId
        pollForConfirmation(txId);
      } else {
        // fallback: poll latest
        pollForConfirmation();
      }
    } catch (err: any) {
      setMessage(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // poll backend for stk callback result (optionally by checkoutRequestID)
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current as any);
    };
  }, []);

  const pollForConfirmation = async (checkoutRequestID?: string) => {
    setMessage('Waiting for payment confirmation...');
    const maxAttempts = 40;
    let attempts = 0;
    if (pollRef.current) {
      clearInterval(pollRef.current as any);
      pollRef.current = null;
    }

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const url = checkoutRequestID ? `/api/transactions/${checkoutRequestID}` : '/api/stkstatus';
        const r = await fetch(url);
        const json = await r.json();
        if (json && json.success && json.data) {
          const tx = json.data;
          // normalized checks: Daraja uses ResultCode (0 = success) and our wrapper sets status
          const isSuccess = tx && (tx.resultCode === 0 || tx.status === 'COMPLETED' || tx.resultDesc === 'Completed');
          const isFailure = tx && (tx.resultCode && tx.resultCode !== 0) || (tx.status === 'FAILED');
          if (isSuccess) {
            if (pollRef.current) clearInterval(pollRef.current as any);
            pollRef.current = null;
            setMessage('Payment confirmed');
            setConfirmation(tx);
            return;
          }
          if (isFailure) {
            if (pollRef.current) clearInterval(pollRef.current as any);
            pollRef.current = null;
            setMessage('Payment failed');
            setConfirmation(tx);
            return;
          }
        }
      } catch (err) {
        // ignore and retry
      }
      if (attempts >= maxAttempts) {
        if (pollRef.current) clearInterval(pollRef.current as any);
        pollRef.current = null;
        setMessage('Timed out waiting for confirmation. Please check your phone or contact support.');
      }
    }, 3000) as unknown as number;
  };

  const [confirmation, setConfirmation] = useState<any>(null);

  const exportPdf = () => {
    if (!confirmation) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // header: colored block with business name (simple inline 'logo')
    doc.setFillColor(236, 72, 153); // pink
    doc.rect(0, 0, 595, 70, 'F');
    doc.setFontSize(22);
    doc.setTextColor('#fff');
    doc.text('RoyalBeauty', 40, 44);
    doc.setFontSize(12);
    doc.text('Payment Receipt', 480, 44, { align: 'right' });

    // body start
    const startY = 100;
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(40, startY - 10, 555, startY - 10);

    const service = booking.service || '';
    // try several places for amount
    const amountVal = confirmation.amount || confirmation.amountPaid || (confirmation?.Body?.stkCallback?.CallbackMetadata?.Item?.[0]?.Value) || booking.price;
    const amountText = formatKES(amountVal);
    const receipt = confirmation.mpesaReceiptNumber || confirmation.mpesaReceipt || confirmation?.Body?.stkCallback?.CallbackMetadata?.Item?.[1]?.Value || (confirmation?.raw?.Body?.stkCallback?.CallbackMetadata?.Item?.[1]?.Value) || '';
    const phone = confirmation.phoneNumber || confirmation?.raw?.Body?.stkCallback?.CallbackMetadata?.Item?.[4]?.Value || booking.phone || '';
    const dateRaw = confirmation.transactionDate || confirmation.receivedAt || confirmation?.raw?.Body?.stkCallback?.CallbackMetadata?.Item?.[3]?.Value;
    let date = new Date().toLocaleString();
    if (dateRaw) {
      // Daraja returns timestamps as YYYYMMDDHHmmss or epoch ms depending on source; try parsing safely
      const parsed = Number(dateRaw);
      if (!Number.isNaN(parsed) && String(dateRaw).length > 10) {
        date = new Date(parsed).toLocaleString();
      } else if (!Number.isNaN(parsed)) {
        date = new Date(parsed * 1000).toLocaleString();
      } else {
        // fallback
        date = String(dateRaw).replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$3/$2/$1 $4:$5:$6') || new Date().toLocaleString();
      }
    }

    doc.setFontSize(12);
    doc.setTextColor('#222');
    doc.text(`Service: ${service}`, 40, startY + 10);
    doc.text(`Amount: ${amountText}`, 40, startY + 30);
    doc.text(`Receipt No: ${receipt}`, 40, startY + 50);
    doc.text(`Phone: ${phone}`, 40, startY + 70);
    doc.text(`Date: ${date}`, 40, startY + 90);

    // booking reference / checkout id
    if (confirmation.checkoutRequestID || confirmation.merchantRequestID || confirmation.id) {
      doc.setFontSize(10);
      doc.setTextColor('#666');
      const ref = confirmation.checkoutRequestID || confirmation.merchantRequestID || confirmation.id;
      doc.text(`Transaction ID: ${ref}`, 40, startY + 120);
    }

    // footer
    doc.setFontSize(10);
    doc.setTextColor('#666');
    doc.text('Thank you for choosing RoyalBeauty. Visit again!', 40, startY + 160);

    doc.save(`royalbeauty-receipt-${receipt || Date.now()}.pdf`);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Confirm Payment (KES)</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Phone (Kenyan)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Amount (KES)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
            <button onClick={initiatePayment} disabled={loading} className="px-4 py-2 rounded bg-pink-500 text-white">{loading ? 'Processing...' : 'Pay'}</button>
          </div>
          {message && <div className="text-sm text-gray-600">{message}</div>}
          {confirmation && (
            <div className="mt-4">
              <button onClick={exportPdf} className="px-4 py-2 rounded bg-green-600 text-white">Download Receipt (PDF)</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
