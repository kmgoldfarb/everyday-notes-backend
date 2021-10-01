const admin = require('firebase-admin');
const serviceAccountKey = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

async function decodeToken(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.currentUser = decodedToken;
  } catch (err) {
    res.status(403).json({ message: 'Authentication failed.' });
  }
  next();
}

module.exports = decodeToken;
