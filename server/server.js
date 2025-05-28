// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Routes
app.post('/signup', async (req, res) => {
  const { name, dob, gender, email } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ msg: 'User already exists' });

    await pool.query('INSERT INTO users (name, dob, gender, email) VALUES ($1, $2, $3, $4)', [name, dob, gender, email]);
    res.status(201).json({ msg: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

const otpStore = new Map(); // temporary store: email -> otp

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
});

app.post('/login', async (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStore.get(email);

  if (storedOtp !== otp) return res.status(401).json({ msg: 'Invalid OTP' });

  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (user.rows.length === 0) return res.status(404).json({ msg: 'User not found' });

  const payload = { id: user.rows[0].id, email: user.rows[0].email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  otpStore.delete(email);
  res.status(200).json({ token });
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await pool.query('SELECT name, dob, gender, email FROM users WHERE id = $1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch user' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// PostgreSQL Schema
// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   name TEXT NOT NULL,
//   dob DATE NOT NULL,
//   gender TEXT NOT NULL,
//   email TEXT UNIQUE NOT NULL
// );

