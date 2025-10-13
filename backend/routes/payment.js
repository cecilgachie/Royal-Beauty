const express = require("express");
const router = express.Router();
const app = express();
const moment = require("moment");
const fs = require("fs");
const axios = require("axios");
require('dotenv').config();

// Sample API route
router.get("/home", (req, res) => {
  res.json({ message: "This is a sample API route." });
  console.log("This is a sample API route.");
});

router.get("/api/access_token", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      res.json({ message: "😀 Your access token is " + accessToken });
    })
    .catch(console.log);
});

async function generateAccessToken() {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing consumer key or secret in environment variables");
  }

  const auth = "Basic " + Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });
    
    if (!response.data || !response.data.access_token) {
      throw new Error("Invalid response from token generation");
    }
    
    return response.data.access_token;
  } catch (error) {
    console.error("Token generation error:", error.response?.data || error.message);
    throw new Error("Failed to generate access token: " + (error.response?.data?.error_description || error.message));
  }
}

router.post("/stkpush", (req, res) => {
  let phoneNumber = req.body.phone;
  const accountNumber = req.body.accountNumber;
  const amount = req.body.amount;
  const shortcode = process.env.SHORTCODE;
  const passkey = process.env.PASSKEY;

  if (!shortcode || !passkey) {
    return res.status(500).json({
      msg: "Missing shortcode or passkey in environment variables",
      success: false
    });
  }

  if (!phoneNumber || !amount) {
    return res.status(400).json({
      msg: "Phone number and amount are required",
      success: false
    });
  }

  // Format phone number to international format
  phoneNumber = phoneNumber.toString().trim();
  phoneNumber = phoneNumber.replace(/\D/g, '');
  
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '254' + phoneNumber.substring(1);
  }
  
  if (!phoneNumber.startsWith('254')) {
    phoneNumber = '254' + phoneNumber;
  }

  if (!/^254[7-9][0-9]{8}$/.test(phoneNumber)) {
    return res.status(400).json({
      msg: "Invalid phone number format. Please use a valid Kenyan phone number",
      success: false
    });
  }

  generateAccessToken()
    .then((accessToken) => {
      const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      const auth = "Bearer " + accessToken;
      const timestamp = moment().format("YYYYMMDDHHmmss");
      const password = Buffer.from(
        shortcode + passkey + timestamp
      ).toString("base64");

      return axios.post(
        url,
        {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: process.env.CALLBACK_URL || "http://localhost:5000/api/callback",
          AccountReference: accountNumber,
          TransactionDesc: "RoyalBeauty booking deposit",
        },
        {
          headers: {
            Authorization: auth,
          },
        }
      );
    })
    .then((response) => {
      console.log("STK Push Response:", response.data);
      // persist a pending transaction so frontend can poll/verify
      try {
        const daraja = response.data || {};
        const pending = {
          id: daraja.CheckoutRequestID || daraja.MerchantRequestID || `tx_${Date.now()}`,
          merchantRequestID: daraja.MerchantRequestID || null,
          checkoutRequestID: daraja.CheckoutRequestID || null,
          amount: Number(amount),
          phoneNumber: phoneNumber,
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

        // return the persisted pending transaction (server-side verification will update it)
        res.status(200).json({
          msg: "Request sent. Enter M-PESA PIN to complete the transaction",
          success: true,
          transaction: pending,
          darajaResponse: daraja,
        });
        return;
      } catch (e) {
        console.error('Error persisting pending transaction', e);
        // fall through to return daraja response minimally
      }

      // fallback: return Daraja response to frontend so it can poll using CheckoutRequestID
      res.status(200).json({
        msg: "Request sent. Enter M-PESA PIN to complete the transaction",
        success: true,
        darajaResponse: response.data,
      });
    })
    .catch((error) => {
      console.error("STK Push Error:", error.response?.data || error.message);
      res.status(500).json({
        msg: error.response?.data?.errorMessage || error.message || "Request failed",
        success: false,
      });
    });
});

router.post("/callback", (req, res) => {
  console.log("STK PUSH CALLBACK");
  try {
    const body = req.body;
    const cb = body.Body?.stkCallback;
    if (!cb) {
      console.log('No stkCallback in body');
      return res.status(400).send('No callback data');
    }

    const merchantRequestID = cb.MerchantRequestID;
    const checkoutRequestID = cb.CheckoutRequestID;
    const resultCode = cb.ResultCode;
    const resultDesc = cb.ResultDesc;
    const callbackMetadata = cb.CallbackMetadata;

    // extract metadata safely
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

    // persist transaction (update existing pending if present)
    const file = 'transactions.json';
    let all = [];
    try {
      const existing = fs.readFileSync(file, 'utf8');
      all = JSON.parse(existing || '[]');
    } catch (e) {
      all = [];
    }

    // find existing pending by checkoutRequestID or merchantRequestID
    const idx = all.findIndex((t) => t.checkoutRequestID === checkoutRequestID || t.merchantRequestID === merchantRequestID || t.id === checkoutRequestID || t.id === merchantRequestID);
    if (idx >= 0) {
      // merge and mark completed/failed
      const existingTx = all[idx];
      const updated = {
        ...existingTx,
        ...tx,
        status: resultCode === 0 ? 'COMPLETED' : 'FAILED',
        updatedAt: new Date().toISOString(),
        verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined,
      };
      all[idx] = updated;
    } else {
      // push new
      all.push({ ...tx, status: resultCode === 0 ? 'COMPLETED' : 'FAILED', verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined });
    }

    fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');

    // also write the raw callback for backward compatibility
    fs.writeFileSync('stkcallback.json', JSON.stringify(body, null, 2), 'utf8');

    console.log('Stored transaction', checkoutRequestID || merchantRequestID);
    res.status(200).send('Callback processed');
  } catch (err) {
    console.error('Callback processing error', err);
    res.status(500).send('Error processing callback');
  }
});

//Route to initailize payment
// router.post("/initiatePayment", async (req, res) => {
//   const { amount, phoneNumber } = req.body;

//   if (!amount || isNaN(amount) || isNaN(amount)) {
//     return res.status(400).json({ error: "Invalid Amount" });
//   }

//   if (!validatePhoneNumber(phoneNumber)) {
//     return res.status(400).json({ error: "Invalid phone number format" });
//   }
//   try {
//     const accessToken = await generateAccessToken();

//     res.status(200).json({ message: "Payment initiated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// REGISTER URL FOR C2B
app.get("/registerurl", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
      const auth = "Bearer " + accessToken;
      axios
        .post(
          url,
          {
            ShortCode: "174379",
            ResponseType: "Complete",
            ConfirmationURL: "http://example.com/confirmation",
            ValidationURL: "http://example.com/validation",
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          resp.status(200).json(response.data);
        })
        .catch((error) => {
          console.log(error);
          resp.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});

app.get("/confirmation", (req, res) => {
  console.log("All transaction will be sent to this URL");
  console.log(req.body);
});

app.get("/validation", (req, resp) => {
  console.log("Validating payment");
  console.log(req.body);
});

// B2C ROUTE OR AUTO WITHDRAWAL
app.get("/b2curlrequest", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      const securityCredential =
        "N3Lx/hisedzPLxhDMDx80IcioaSO7eaFuMC52Uts4ixvQ/Fhg5LFVWJ3FhamKur/bmbFDHiUJ2KwqVeOlSClDK4nCbRIfrqJ+jQZsWqrXcMd0o3B2ehRIBxExNL9rqouKUKuYyKtTEEKggWPgg81oPhxQ8qTSDMROLoDhiVCKR6y77lnHZ0NU83KRU4xNPy0hRcGsITxzRWPz3Ag+qu/j7SVQ0s3FM5KqHdN2UnqJjX7c0rHhGZGsNuqqQFnoHrshp34ac/u/bWmrApUwL3sdP7rOrb0nWasP7wRSCP6mAmWAJ43qWeeocqrz68TlPDIlkPYAT5d9QlHJbHHKsa1NA==";
      const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
      const auth = "Bearer " + accessToken;
      axios
        .post(
          url,
          {
            InitiatorName: "testapi",
            SecurityCredential: securityCredential,
            CommandID: "PromotionPayment",
            Amount: "1",
            PartyA: "600996",
            PartyB: "254768168060",
            Remarks: "Withdrawal",
            QueueTimeOutURL: "https://mydomain.com/b2c/queue",
            ResultURL: "https://mydomain.com/b2c/result",
            Occasion: "Withdrawal",
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          res.status(200).json(response.data);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});


// simulate a daraja callback (for local dev) - this will create a transaction entry and mimic the callback flow
router.post('/simulate-callback', (req, res) => {
  const { checkoutRequestID, merchantRequestID, amount, mpesaReceiptNumber, transactionDate, phoneNumber, resultCode = 0, resultDesc = 'Completed' } = req.body;
  if (!checkoutRequestID) return res.status(400).json({ success: false, msg: 'checkoutRequestID required' });

  const tx = {
    merchantRequestID: merchantRequestID || `M${Date.now()}`,
    checkoutRequestID,
    resultCode,
    resultDesc,
    amount: amount || null,
    mpesaReceiptNumber: mpesaReceiptNumber || `RCPT${Date.now()}`,
    transactionDate: transactionDate || Date.now().toString(),
    phoneNumber: phoneNumber || null,
    raw: req.body,
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
  // merge into existing pending tx if present
  const idx = all.findIndex((t) => t.checkoutRequestID === checkoutRequestID || t.merchantRequestID === merchantRequestID);
  if (idx >= 0) {
    const existingTx = all[idx];
    const updated = {
      ...existingTx,
      ...tx,
      status: resultCode === 0 ? 'COMPLETED' : 'FAILED',
      updatedAt: new Date().toISOString(),
      verifiedAt: resultCode === 0 ? new Date().toISOString() : undefined,
    };
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

// module exports
module.exports = router;

// module.exports moved to end after route definitions
