// =============================================================================
// src/services/email/transporter.js
// =============================================================================
// Single email transporter — uses Brevo if API key is set, Gmail otherwise.
// Switch providers by just changing environment variables.
// =============================================================================

import nodemailer from "nodemailer";

export const createTransporter = () => {
  // Use Brevo SMTP if configured
  if (process.env.BREVO_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_API_KEY,
      },
    });
  }

  // Fall back to Gmail (development)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const FROM_ADDRESS = process.env.BREVO_API_KEY
  ? process.env.BREVO_SENDER_EMAIL
  : process.env.EMAIL_USER;