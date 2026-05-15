/**
 * FreshMart Firebase Configuration
 * ---------------------------------
 * SECURITY: Replace the placeholder values below with your actual
 * Firebase project credentials from https://console.firebase.google.com
 *
 * For production deployment, use environment variables or a secure
 * backend proxy. Never commit real credentials to version control.
 *
 * Firestore Security Rules enforce who can read/write what data.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC0usOnYDlA8X9GH_JDUZIqKkdwKIkoAko",
  authDomain: "sumudevils.firebaseapp.com",
  projectId: "sumudevils",
  storageBucket: "sumudevils.firebasestorage.app",
  messagingSenderId: "1090519412620",
  appId: "1:1090519412620:web:221ec7ddd27b65cd1130a9",
  measurementId: "G-76DYJ2YE9J"
};

// ── Initialize Firebase ──────────────────────────────────────────────────────
firebase.initializeApp(FIREBASE_CONFIG);

const db   = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Google OAuth provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ── Firestore Auto-Schema Bootstrap ─────────────────────────────────────────
// Called once on first load: creates required collections + default config docs
async function bootstrapFirestore() {
  try {
    // Config: discount popup
    const popupRef = db.collection('config').doc('discountPopup');
    const popupSnap = await popupRef.get();
    if (!popupSnap.exists) {
      await popupRef.set({
        title: 'Welcome to FreshMart! 🎉',
        description: 'Get 30% off your first order!',
        code: 'FRESH30',
        discount: 30,
        type: 'percent',
        photoUrl: '',
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    // Config: offers banner ticker
    const bannerRef = db.collection('config').doc('offersBanner');
    const bannerSnap = await bannerRef.get();
    if (!bannerSnap.exists) {
      await bannerRef.set({
        offers: [
          '🚚 Free delivery on orders above ₹499!',
          '🎉 Use code FRESH30 for 30% off your first order!',
          '🥛 Fresh dairy products delivered daily!',
          '🛒 New arrivals every morning — shop fresh!',
          '📦 30–45 min delivery in Tiruppur & Coimbatore!'
        ],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    // Default coupons
    const couponsSnap = await db.collection('coupons').limit(1).get();
    if (couponsSnap.empty) {
      const defaultCoupons = [
        { code: 'FRESH30', type: 'percent', discount: 30, usageLimit: 100, usedCount: 0, minOrder: 200, expiry: '2025-12-31', active: true },
        { code: 'DAIRY20', type: 'percent', discount: 20, usageLimit: 50,  usedCount: 0, minOrder: 100, expiry: '2025-12-31', active: true },
        { code: 'NEWUSER', type: 'flat',    discount: 50, usageLimit: 200, usedCount: 0, minOrder: 300, expiry: '2025-12-31', active: true },
        { code: 'VEGGIE15',type:'percent',  discount: 15, usageLimit: 100, usedCount: 0, minOrder: 150, expiry: '2025-12-31', active: true }
      ];
      const batch = db.batch();
      defaultCoupons.forEach(c => {
        const ref = db.collection('coupons').doc();
        batch.set(ref, { ...c, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      });
      await batch.commit();
    }

    console.log('✅ Firestore bootstrap complete');
  } catch (e) {
    console.warn('Bootstrap skipped (offline or already exists):', e.message);
  }
}

// ── User Document Auto-Create ────────────────────────────────────────────────
async function ensureUserDocument(user, extraData = {}) {
  const userRef = db.collection('users').doc(user.uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    // First time: create full user document with all required columns
    await userRef.set({
      uid: user.uid,
      name: user.displayName || extraData.name || 'Guest',
      email: user.email || '',
      phone: extraData.phone || '',
      photoURL: user.photoURL || '',
      role: 'customer',          // default role — admin changes via Firebase Console
      active: true,
      provider: extraData.provider || 'email',
      address: '',
      city: 'Tiruppur',
      pincode: '',
      totalOrders: 0,
      totalSpent: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return 'customer';
  } else {
    // Existing user: update last seen
    await userRef.update({ updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    return snap.data().role;
  }
}

// ── Auth State Helper ────────────────────────────────────────────────────────
function getCurrentUser() {
  return auth.currentUser;
}

async function getUserRole(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? snap.data().role : 'customer';
  } catch {
    return 'customer';
  }
}

// Export to global scope (used by all pages)
window.FM = {
  db, auth, storage,
  googleProvider,
  bootstrapFirestore,
  ensureUserDocument,
  getCurrentUser,
  getUserRole,
  firebase
};
