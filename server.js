require('dotenv').config();
const express = require('express');
const cors = require('cors');

const {
  AT_USERNAME,
  AT_API_KEY,
  AT_SENDER_ID,
  NOTIFY_PHONE,
  PORT = 3000,
  ALLOWED_ORIGIN = '*',
} = process.env;

if (!AT_USERNAME || !AT_API_KEY) {
  console.error(
    'Missing AT_USERNAME or AT_API_KEY. Copy .env.example to .env and fill in your Africa\'s Talking credentials.'
  );
  process.exit(1);
}

if (!NOTIFY_PHONE) {
  console.error(
    'Missing NOTIFY_PHONE. Copy .env.example to .env and set the phone number that should get the SMS.'
  );
  process.exit(1);
}

const africastalking = require('africastalking')({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});
const sms = africastalking.SMS;

const app = express();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN.split(',') }));

// Simple request log so you can see applications arriving in the terminal
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/apply', async (req, res) => {
  const { fullname, phone, loantype, amount, purpose } = req.body || {};

  if (!fullname || !phone || !loantype || !amount || !purpose) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  const message =
    `New loan application:\n` +
    `Name: ${fullname}\n` +
    `Phone: ${phone}\n` +
    `Product: ${loantype}\n` +
    `Amount: KES ${amount}\n` +
    `Purpose: ${purpose}`;

  try {
    const options = {
      to: [NOTIFY_PHONE],
      message,
    };
    if (AT_SENDER_ID) options.from = AT_SENDER_ID;

    const result = await sms.send(options);
    console.log('SMS sent:', JSON.stringify(result));
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send SMS:', err.message || err);
    res.status(502).json({ ok: false, error: 'Failed to send SMS notification.' });
  }
});

app.listen(PORT, () => {
  console.log(`Menovy loan-notify server running on http://localhost:${PORT}`);
  console.log(`POST loan applications to http://localhost:${PORT}/api/apply`);
});
