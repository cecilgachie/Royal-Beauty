const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// helper: generate oauth token from Daraja
async function generateAccessToken() {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  if (!consumerKey || !consumerSecret) {
    throw new Error('Missing consumer key or secret in environment variables');
  }

  const auth = 'Basic ' + Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');

  const resp = await axios.get(url, { headers: { Authorization: auth } });
  if (!resp.data || !resp.data.access_token) throw new Error('Invalid token response');
  return resp.data.access_token;
}

const getAccessToken = generateAccessToken; // alias

// simple phone normalization to 2547XXXXXXXX
function normalizePhone(input) {
  if (!input) return null;
  let phone = String(input).trim().replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '254' + phone.slice(1);
  if (!phone.startsWith('254')) phone = '254' + phone;
  return phone;
}

// GET access token (dev helper)
router.get('/api/access_token', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ access_token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// initiate STK Push
router.post('/stkpush', async (req, res) => {
  try {
    let { phone, amount, accountNumber } = req.body;
    if (!phone || !amount) return res.status(400).json({ success: false, msg: 'Phone and amount are required' });
    amount = Number(amount);
    if (Number.isNaN(amount) || amount <= 0) return res.status(400).json({ success: false, msg: 'Invalid amount' });

    const phoneNumber = normalizePhone(phone);
    if (!/^254[7-9][0-9]{8}$/.test(phoneNumber)) return res.status(400).json({ success: false, msg: 'Invalid Kenyan phone number' });

    const shortcode = process.env.SHORTCODE;
    const passkey = process.env.PASSKEY;
    if (!shortcode || !passkey) return res.status(500).json({ success: false, msg: 'Missing shortcode or passkey in env' });

    const accessToken = await getAccessToken();
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.CALLBACK_URL || 'http://localhost:' + (process.env.PORT || 5000) + '/api/callback',
      AccountReference: accountNumber || 'booking',
      TransactionDesc: 'RoyalBeauty booking deposit',
    };

    const darajaResp = await axios.post(url, payload, { headers: { Authorization: 'Bearer ' + accessToken } });

    // persist a pending transaction so frontend can poll/verify
    const daraja = darajaResp.data || {};
    const pending = {
      id: daraja.CheckoutRequestID || daraja.MerchantRequestID || `tx_${Date.now()}`,
      merchantRequestID: daraja.MerchantRequestID || null,
      checkoutRequestID: daraja.CheckoutRequestID || null,
      amount: Number(amount),
      phoneNumber,
      accountNumber: accountNumber || null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      darajaResponse: daraja,
    };

    const file = 'transactions.json';
    let all = [];
    try {
      const existing = fs.readFileSync(file, 'utf8');
      all = JSON.parse(existing || '[]');
    } catch (e) {
      all = [];
    }
    all.push(pending);
    fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');

    res.status(200).json({ success: true, msg: 'Request sent. Enter M-PESA PIN to complete the transaction', transaction: pending, darajaResponse: daraja });
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({ msg: error.response?.data?.errorMessage || error.message || 'Request failed', success: false });
  }
});

// Daraja callback handler
router.post('/callback', (req, res) => {
  try {
    const body = req.body;
    const cb = body.Body?.stkCallback;
    if (!cb) return res.status(400).send('No callback data');

    const merchantRequestID = cb.MerchantRequestID;
    const checkoutRequestID = cb.CheckoutRequestID;
    const resultCode = cb.ResultCode;
    const resultDesc = cb.ResultDesc;
    const callbackMetadata = cb.CallbackMetadata;

    const items = (callbackMetadata && callbackMetadata.Item) || [];
    const amount = items[0]?.Value || null;
    const mpesaReceiptNumber = items[1]?.Value || null;
    const transactionDate = items[3]?.Value || null;
    const phoneNumber = items[4]?.Value || null;

    const tx = {
      merchantRequestID,
      checkoutRequestID,
      resultCode,
      resultDesc,
      amount,
      mpesaReceiptNumber,
      transactionDate,
      phoneNumber,
      raw: body,
      receivedAt: new Date().toISOString(),
    };

    const file = 'transactions.json';
    let all = [];
    try {
      const existing = fs.readFileSync(file, 'utf8');
      all = JSON.parse(existing || '[]');
    } catch (e) {
      all = [];
    }

    const idx = all.findIndex((t) => t.checkoutRequestID === checkoutRequestID || t.merchantRequestID === merchantRequestID || t.id === checkoutRequestID || t.id === merchantRequestID);
    if (idx >= 0) {
      const existingTx = all[idx];
      const updated = { ...existingTx, ...tx, status: resultCode === 0 ? 'COMPLETED' : 'FAILED', updatedAt: new Date().toISOString(), verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined };
      all[idx] = updated;
    } else {
      all.push({ ...tx, status: resultCode === 0 ? 'COMPLETED' : 'FAILED', verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined });
    }

    fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');
    fs.writeFileSync('stkcallback.json', JSON.stringify(body, null, 2), 'utf8');

    res.status(200).send('Callback processed');
  } catch (err) {
    console.error('Callback processing error', err);
    res.status(500).send('Error processing callback');
  }
});

// simulate a daraja callback (for local dev)
router.post('/simulate-callback', (req, res) => {
  const { checkoutRequestID, merchantRequestID, amount, mpesaReceiptNumber, transactionDate, phoneNumber, resultCode = 0, resultDesc = 'Completed' } = req.body;
  if (!checkoutRequestID) return res.status(400).json({ success: false, msg: 'checkoutRequestID required' });

  const tx = { merchantRequestID: merchantRequestID || `M${Date.now()}`, checkoutRequestID, resultCode, resultDesc, amount: amount || null, mpesaReceiptNumber: mpesaReceiptNumber || `RCPT${Date.now()}`, transactionDate: transactionDate || Date.now().toString(), phoneNumber: phoneNumber || null, raw: req.body, receivedAt: new Date().toISOString() };

  const file = 'transactions.json';
  let all = [];
  try {
    const existing = fs.readFileSync(file, 'utf8');
    all = JSON.parse(existing || '[]');
  } catch (e) {
    all = [];
  }

  const idx = all.findIndex((t) => t.checkoutRequestID === checkoutRequestID || t.merchantRequestID === merchantRequestID);
  if (idx >= 0) {
    const existingTx = all[idx];
    const updated = { ...existingTx, ...tx, status: resultCode === 0 ? 'COMPLETED' : 'FAILED', updatedAt: new Date().toISOString(), verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined };
    all[idx] = updated;
  } else {
    all.push({ ...tx, status: resultCode === 0 ? 'COMPLETED' : 'FAILED', verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined });
  }

  fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');
  fs.writeFileSync('stkcallback.json', JSON.stringify({ Body: { stkCallback: { MerchantRequestID: tx.merchantRequestID, CheckoutRequestID: tx.checkoutRequestID, ResultCode: tx.resultCode, ResultDesc: tx.resultDesc, CallbackMetadata: { Item: [ { Name: 'Amount', Value: tx.amount }, { Name: 'MpesaReceiptNumber', Value: tx.mpesaReceiptNumber }, { Name: 'Balance' }, { Name: 'TransactionDate', Value: tx.transactionDate }, { Name: 'PhoneNumber', Value: tx.phoneNumber } ] } } } }, null, 2), 'utf8');

  res.json({ success: true, tx });
});

// get all transactions
router.get('/transactions', (req, res) => {
  try {
    const file = 'transactions.json';
    const data = fs.readFileSync(file, 'utf8');
    const all = JSON.parse(data || '[]');
    res.json({ success: true, data: all });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

// get transaction by checkoutRequestID
router.get('/transactions/:id', (req, res) => {
  const id = req.params.id;
  try {
    const file = 'transactions.json';
    const data = fs.readFileSync(file, 'utf8');
    const all = JSON.parse(data || '[]');
    const found = all.find((t) => t.checkoutRequestID === id || t.id === id || t.merchantRequestID === id);
    if (!found) return res.status(404).json({ success: false, msg: 'Not found' });
    res.json({ success: true, data: found });
  } catch (e) {
    res.status(500).json({ success: false, msg: 'Error reading transactions' });
  }
});

// server-side verify / return transaction by id (checkoutRequestID or id)
router.post('/transactions/:id/verify', (req, res) => {
  const id = req.params.id;
  try {
    const file = 'transactions.json';
    const data = fs.readFileSync(file, 'utf8');
    const all = JSON.parse(data || '[]');
    const foundIndex = all.findIndex((t) => t.checkoutRequestID === id || t.id === id || t.merchantRequestID === id);
    if (foundIndex === -1) return res.status(404).json({ success: false, msg: 'Not found' });
    const tx = all[foundIndex];

    // if status is still pending, return pending but include note
    res.json({ success: true, data: tx });
  } catch (e) {
    res.status(500).json({ success: false, msg: 'Error reading transactions' });
  }
});

// convenience endpoint for frontend polling - return latest transaction
router.get('/stkstatus', (req, res) => {
  try {
    const file = 'transactions.json';
    const data = fs.readFileSync(file, 'utf8');
    const all = JSON.parse(data || '[]');
    const last = all[all.length - 1] || null;
    res.json({ success: true, data: last });
  } catch (e) {
    res.json({ success: false, data: null });
  }
});

module.exports = router;
