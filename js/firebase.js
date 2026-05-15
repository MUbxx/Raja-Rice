/**
 * S.N.A Raja Maligai — Firebase Configuration & Helpers
 * ──────────────────────────────────────────────────────
 * SECURITY: Replace placeholder values with your Firebase project credentials.
 * See SETUP.md for instructions.
 * NEVER commit real credentials to version control.
 */

'use strict';

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyC0usOnYDlA8X9GH_JDUZIqKkdwKIkoAko",
  authDomain:        "sumudevils.firebaseapp.com",
  projectId:         "sumudevils",
  storageBucket:     "sumudevils.firebasestorage.app",
  messagingSenderId: "1090519412620",
  appId:             "1:1090519412620:web:221ec7ddd27b65cd1130a9",
  measurementId:     "G-76DYJ2YE9J"
};

// ── Initialize Firebase ─────────────────────────────────────────────────────
firebase.initializeApp(FIREBASE_CONFIG);

const db      = firebase.firestore();
const auth    = firebase.auth();
const storage = firebase.storage();

// Enable offline persistence (Firestore cache)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not supported in this browser.');
  }
});

// Google OAuth provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ── Input Sanitization ──────────────────────────────────────────────────────
function sanitizeStr(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '').substring(0, maxLen);
}

// ── Rate Limiter (client-side guard) ────────────────────────────────────────
const _rateLimits = {};
function checkRateLimit(key, maxPerMinute = 5) {
  const now = Date.now();
  if (!_rateLimits[key]) _rateLimits[key] = [];
  _rateLimits[key] = _rateLimits[key].filter(t => now - t < 60000);
  if (_rateLimits[key].length >= maxPerMinute) return false;
  _rateLimits[key].push(now);
  return true;
}

// ── Firestore Auto-Schema Bootstrap ─────────────────────────────────────────
async function bootstrapFirestore() {
  try {
    const batch = db.batch();
    let needsCommit = false;

    // Config: discount popup
    const popupRef  = db.collection('config').doc('discountPopup');
    const popupSnap = await popupRef.get();
    if (!popupSnap.exists) {
      batch.set(popupRef, {
        title: 'Welcome to S.N.A Raja Maligai! 🎉',
        description: 'Get 30% off your first order!',
        code: 'FRESH30', discount: 30, type: 'percent',
        photoUrl: '', active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      needsCommit = true;
    }

    // Config: offers banner ticker
    const bannerRef  = db.collection('config').doc('offersBanner');
    const bannerSnap = await bannerRef.get();
    if (!bannerSnap.exists) {
      batch.set(bannerRef, {
        offers: [
          '🚚 Free delivery on orders above ₹499!',
          '🎉 Use code FRESH30 for 30% off your first order!',
          '🥛 Fresh dairy products delivered daily!',
          '🛒 New arrivals every morning — shop fresh!',
          '📦 30–45 min delivery in Tiruppur & Coimbatore!',
          '🌿 100% farm fresh quality guaranteed!'
        ],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      needsCommit = true;
    }

    if (needsCommit) await batch.commit();

    // Default coupons (separate batch)
    const couponsSnap = await db.collection('coupons').limit(1).get();
    if (couponsSnap.empty) {
      const defaultCoupons = [
        { code:'FRESH30',  type:'percent', discount:30, usageLimit:100, usedCount:0, minOrder:200, expiry:'2026-12-31', active:true },
        { code:'DAIRY20',  type:'percent', discount:20, usageLimit:50,  usedCount:0, minOrder:100, expiry:'2026-12-31', active:true },
        { code:'NEWUSER',  type:'flat',    discount:50, usageLimit:200, usedCount:0, minOrder:300, expiry:'2026-12-31', active:true },
        { code:'VEGGIE15', type:'percent', discount:15, usageLimit:100, usedCount:0, minOrder:150, expiry:'2026-12-31', active:true },
        { code:'FREESHIP', type:'flat',    discount:40, usageLimit:500, usedCount:0, minOrder:199, expiry:'2026-12-31', active:true }
      ];
      const cb = db.batch();
      defaultCoupons.forEach(c => {
        cb.set(db.collection('coupons').doc(), {
          ...c, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await cb.commit();
    }

    console.log('✅ Firestore bootstrap complete');
  } catch (e) {
    console.warn('Bootstrap skipped (offline or rules issue):', e.message);
  }
}

// ── User Document Auto-Create ────────────────────────────────────────────────
async function ensureUserDocument(user, extraData = {}) {
  if (!user?.uid) return 'customer';
  const userRef = db.collection('users').doc(user.uid);

  try {
    const snap = await userRef.get();
    if (!snap.exists) {
      await userRef.set({
        uid:        user.uid,
        name:       sanitizeStr(user.displayName || extraData.name || 'Guest', 100),
        email:      user.email || '',
        phone:      sanitizeStr(extraData.phone || '', 15),
        photoURL:   user.photoURL || '',
        role:       'customer',
        active:     true,
        provider:   extraData.provider || 'email',
        address:    '',
        city:       'Tiruppur',
        pincode:    '',
        totalOrders: 0,
        totalSpent:  0,
        wishlist:   [],
        createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:  firebase.firestore.FieldValue.serverTimestamp()
      });
      return 'customer';
    } else {
      // Only update safe fields — never allow client to self-elevate role
      await userRef.update({
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...(user.photoURL ? { photoURL: user.photoURL } : {})
      });
      return snap.data().role || 'customer';
    }
  } catch (e) {
    console.warn('ensureUserDocument error:', e.message);
    return 'customer';
  }
}

// ── Image Upload Helper ──────────────────────────────────────────────────────
async function uploadImage(file, folder = 'products', onProgress = null) {
  if (!file) throw new Error('No file provided');

  // Validate type & size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type. Use JPG, PNG, or WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large. Max 5MB.');

  const ext  = file.name.split('.').pop().toLowerCase();
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const ref  = storage.ref(name);
  const task = ref.put(file, { contentType: file.type });

  if (onProgress) {
    task.on('state_changed', snapshot => {
      const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(Math.round(pct));
    });
  }

  await task;
  return await ref.getDownloadURL();
}

// ── Auth Helpers ─────────────────────────────────────────────────────────────
function getCurrentUser() { return auth.currentUser; }

async function getUserRole(uid) {
  if (!uid) return 'customer';
  try {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? (snap.data().role || 'customer') : 'customer';
  } catch {
    return 'customer';
  }
}

// Validate user is active (not banned)
async function isUserActive(uid) {
  if (!uid) return true;
  try {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? (snap.data().active !== false) : true;
  } catch {
    return true;
  }
}

// ── Coupon Validator (server-side safe logic) ────────────────────────────────
async function validateCoupon(code, cartTotal) {
  if (!code) return { valid: false, msg: 'Enter a coupon code.' };
  const clean = String(code).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  if (!clean || clean.length < 3) return { valid: false, msg: 'Invalid coupon code.' };

  try {
    const snap = await db.collection('coupons').where('code', '==', clean).limit(1).get();
    if (snap.empty) return { valid: false, msg: 'Coupon not found.' };

    const c = snap.docs[0].data();
    if (!c.active) return { valid: false, msg: 'Coupon is inactive.' };
    if (c.expiry && new Date(c.expiry) < new Date()) return { valid: false, msg: 'Coupon has expired.' };
    if (c.usageLimit && c.usedCount >= c.usageLimit) return { valid: false, msg: 'Coupon usage limit reached.' };
    if (c.minOrder && cartTotal < c.minOrder) return { valid: false, msg: `Minimum order ₹${c.minOrder} required.` };

    const discount = c.type === 'percent'
      ? Math.ceil(cartTotal * c.discount / 100)
      : Math.min(c.discount, cartTotal);

    return { valid: true, code: clean, type: c.type, discount, couponData: c, docId: snap.docs[0].id };
  } catch (e) {
    return { valid: false, msg: 'Could not verify coupon. Try again.' };
  }
}

// ── Order ID Generator ───────────────────────────────────────────────────────
function generateOrderId() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SNA-${ts}-${rnd}`;
}

// ── Expose to global scope ───────────────────────────────────────────────────
window.FM = {
  db, auth, storage, googleProvider, firebase,
  bootstrapFirestore, ensureUserDocument,
  getCurrentUser, getUserRole, isUserActive,
  uploadImage, validateCoupon,
  sanitizeStr, checkRateLimit, generateOrderId
};
