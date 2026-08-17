const crypto = require('crypto');

// Verhoeff algorithm tables - the public checksum scheme used by Aadhaar
// numbers to catch typos. This only validates *format/checksum*, it does not
// verify identity - real identity verification would require UIDAI's
// official eKYC API, which needs government licensing and is out of scope
// for this project. We deliberately never persist the raw number.
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function verhoeffIsValid(numStr) {
  let c = 0;
  const digits = numStr.split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c === 0;
}

// Basic structural validation: 12 digits, doesn't start with 0/1, passes checksum.
function isValidGovId(rawId) {
  const cleaned = String(rawId).replace(/\s|-/g, '');
  if (!/^[2-9]\d{11}$/.test(cleaned)) return false;
  return verhoeffIsValid(cleaned);
}

function maskGovId(rawId) {
  const cleaned = String(rawId).replace(/\s|-/g, '');
  return `XXXX-XXXX-${cleaned.slice(-4)}`;
}

// One-way hash for uniqueness checks - salted with a server-side pepper so
// the raw number is never recoverable from the database.
function hashGovId(rawId) {
  const cleaned = String(rawId).replace(/\s|-/g, '');
  const pepper = process.env.JWT_SECRET || 'civicalert-pepper';
  return crypto.createHmac('sha256', pepper).update(cleaned).digest('hex');
}

module.exports = { isValidGovId, maskGovId, hashGovId };
