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
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1',
      [decodedToken.uid]
    );
    if (rows[0]) {
      req.user = { ...decodedToken, id: rows[0].id };
    } else {
      req.user = decodedToken; 
    }
    next();
  } catch (error) {
    res.status(401).send('Érvénytelen token');
  }
}


export async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); 
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
  }
  next();
}

export function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).send('Nincs jogosultság');
  }
  next();
}
