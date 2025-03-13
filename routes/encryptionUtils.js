const crypto = require('crypto');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
} // Load environment variables from .env file

const secretKey = process.env.SECRET_KEY;
const encryptMethod = 'AES-256-CBC';

function encrypt(text, secret) {
  const iv = crypto.randomBytes(16); // Generate a random IV for each encryption
  const cipher = crypto.createCipheriv(encryptMethod, secret, iv);

  let encrypted = cipher.update(text, 'utf-8', 'base64');
  encrypted += cipher.final('base64');

  return {
    iv: iv.toString('base64'),
    encryptedData: encrypted,
  };
}

