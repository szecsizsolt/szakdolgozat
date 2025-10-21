// backend/middleware/authMiddleware.js
import admin from 'firebase-admin';
import pool from '../db.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send('Hiányzó token');
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // hozzárendeljük a DB-s usert is
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1',
      [decodedToken.uid]
    );
    if (rows[0]) {
      req.user = { ...decodedToken, id: rows[0].id };
    } else {
      req.user = decodedToken; // nincs DB user, de legalább a token megvan
    }
    next();
  } catch (error) {
    res.status(401).send('Érvénytelen token');
  }
}

// ÚJ: opcionális authentikáció – nem dob hibát, csak ha van token, beállítja req.user.id-t
export async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // vendég
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1',
      [decodedToken.uid]
    );
    if (rows[0]) {
      req.user = { ...decodedToken, id: rows[0].id };
    } else {
      req.user = decodedToken;
    }
  } catch (_) {
    // rossz/lejárt token -> vendégként tovább
  }
  next();
}

export function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).send('Nincs jogosultság');
  }
  next();
}
