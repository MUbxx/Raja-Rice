/**
 * S.N.A Raja Maligai — Customer App Logic v2.0
 * Requires: js/firebase.js loaded first (window.FM)
 */

'use strict';

// ── State ────────────────────────────────────────────────────────────────────
const STATE = {
  products:        [],
  cart:            [],
  wishlist:        [],
  coupon:          null,
  currentUser:     null,
  userRole:        'customer',
  paymentMethod:   'upi',
  selectedUpiApp:  'gpay',
  lastOrderId:     null,
  deliveryLat:     null,
  deliveryLng:     null,
  map:             null,
  marker:          null,
  activeCategory:  'all',
  searchQuery:     '',
  carouselIndex:   0,
};

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;

// ── Demo Products ─────────────────────────────────────────────────────────────
const DEMO_PRODUCTS = [
  { id:'d1',  name:'Full Cream Milk',      nameTa:'முழு கொழுப்பு பால்',   category:'Dairy',      price:72,  oldPrice:80,  emoji:'🥛', weight:'1 Litre',   unit:'litre', pricePerKg:72,   allowCustomQty:false, stock:50,  hot:true,  isNew:false, active:true, imageUrl:'', description:'Rich, full-fat milk from local dairy farms. Pasteurized and packed fresh daily.' },
  { id:'d2',  name:'Curd',                 nameTa:'தயிர்',                 category:'Dairy',      price:35,  oldPrice:40,  emoji:'🥣', weight:'500g',      unit:'g',     pricePerKg:70,   allowCustomQty:false, stock:40,  hot:false, isNew:false, active:true, imageUrl:'', description:'Thick and creamy curd made from fresh milk. Perfect for cooking or eating.' },
  { id:'d3',  name:'Paneer',               nameTa:'பனீர்',                 category:'Dairy',      price:280, oldPrice:320, emoji:'🧀', weight:'200g',      unit:'g',     pricePerKg:1400, allowCustomQty:true,  stock:20,  hot:true,  isNew:false, active:true, imageUrl:'', description:'Fresh cottage cheese made daily. Soft texture, ideal for curries and snacks.' },
  { id:'d4',  name:'Butter',               nameTa:'வெண்ணெய்',             category:'Dairy',      price:54,  oldPrice:60,  emoji:'🧈', weight:'100g',      unit:'g',     pricePerKg:540,  allowCustomQty:false, stock:30,  hot:false, isNew:true,  active:true, imageUrl:'', description:'Creamy salted butter from pure milk fat. Ideal for cooking and spreading.' },
  { id:'d5',  name:'Ghee',                 nameTa:'நெய்',                  category:'Dairy',      price:580, oldPrice:640, emoji:'🫙', weight:'500ml',     unit:'litre', pricePerKg:1160, allowCustomQty:false, stock:20,  hot:false, isNew:true,  active:true, imageUrl:'', description:'Pure clarified butter with rich aroma. Traditional A2 ghee from local cows.' },
  { id:'v1',  name:'Tomato',               nameTa:'தக்காளி',              category:'Vegetables', price:25,  oldPrice:35,  emoji:'🍅', weight:'1 kg',      unit:'kg',    pricePerKg:25,   allowCustomQty:true,  stock:100, hot:true,  isNew:false, active:true, imageUrl:'', description:'Fresh, vine-ripened tomatoes sourced directly from farms. Ideal for gravies.' },
  { id:'v2',  name:'Onion',                nameTa:'வெங்காயம்',            category:'Vegetables', price:30,  oldPrice:40,  emoji:'🧅', weight:'1 kg',      unit:'kg',    pricePerKg:30,   allowCustomQty:true,  stock:80,  hot:false, isNew:false, active:true, imageUrl:'', description:'Freshly harvested onions with strong flavour. Essential for every kitchen.' },
  { id:'v3',  name:'Potato',               nameTa:'உருளைக்கிழங்கு',      category:'Vegetables', price:28,  oldPrice:35,  emoji:'🥔', weight:'1 kg',      unit:'kg',    pricePerKg:28,   allowCustomQty:true,  stock:90,  hot:false, isNew:false, active:true, imageUrl:'', description:'Farm-fresh potatoes. Versatile for frying, boiling, or curries.' },
  { id:'v4',  name:'Brinjal',              nameTa:'கத்திரிக்காய்',        category:'Vegetables', price:22,  oldPrice:30,  emoji:'🍆', weight:'500g',      unit:'g',     pricePerKg:44,   allowCustomQty:true,  stock:60,  hot:false, isNew:false, active:true, imageUrl:'', description:'Tender purple brinjals. Great for curries, baingan bharta, and stir fries.' },
  { id:'v5',  name:'Carrot',               nameTa:'கேரட்',                category:'Vegetables', price:40,  oldPrice:50,  emoji:'🥕', weight:'500g',      unit:'g',     pricePerKg:80,   allowCustomQty:true,  stock:45,  hot:false, isNew:true,  active:true, imageUrl:'', description:'Crunchy, sweet carrots. Rich in vitamin A. Perfect for salads and curries.' },
  { id:'v6',  name:'Spinach',              nameTa:'கீரை',                 category:'Vegetables', price:15,  oldPrice:20,  emoji:'🥬', weight:'250g',      unit:'g',     pricePerKg:60,   allowCustomQty:false, stock:30,  hot:false, isNew:false, active:true, imageUrl:'', description:'Freshly picked green spinach leaves. High in iron and nutrients.' },
  { id:'f1',  name:'Banana',               nameTa:'வாழைப்பழம்',          category:'Fruits',     price:45,  oldPrice:55,  emoji:'🍌', weight:'1 dozen',   unit:'piece', pricePerKg:45,   allowCustomQty:false, stock:50,  hot:true,  isNew:false, active:true, imageUrl:'', description:'Sweet and ripe bananas. Great source of energy and potassium.' },
  { id:'f2',  name:'Mango',                nameTa:'மாம்பழம்',             category:'Fruits',     price:120, oldPrice:150, emoji:'🥭', weight:'1 kg',      unit:'kg',    pricePerKg:120,  allowCustomQty:true,  stock:25,  hot:true,  isNew:false, active:true, imageUrl:'', description:'Premium Alphonso mangoes. Naturally ripened, sweet and juicy.' },
  { id:'f3',  name:'Apple',                nameTa:'ஆப்பிள்',              category:'Fruits',     price:180, oldPrice:220, emoji:'🍎', weight:'1 kg',      unit:'kg',    pricePerKg:180,  allowCustomQty:true,  stock:30,  hot:false, isNew:true,  active:true, imageUrl:'', description:'Crisp red apples imported fresh. Rich in fibre and antioxidants.' },
  { id:'g1',  name:'Basmati Rice',         nameTa:'பாஸ்மதி அரிசி',       category:'Grains',     price:145, oldPrice:170, emoji:'🌾', weight:'1 kg',      unit:'kg',    pricePerKg:145,  allowCustomQty:true,  stock:200, hot:false, isNew:false, active:true, imageUrl:'', description:'Long-grain premium basmati rice with natural fragrance.' },
  { id:'g2',  name:'Toor Dal',             nameTa:'துவரம் பருப்பு',       category:'Grains',     price:155, oldPrice:175, emoji:'🫘', weight:'1 kg',      unit:'kg',    pricePerKg:155,  allowCustomQty:true,  stock:150, hot:false, isNew:false, active:true, imageUrl:'', description:'Split pigeon peas, essential for sambar and dal recipes.' },
  { id:'g3',  name:'Wheat Flour',          nameTa:'கோதுமை மாவு',         category:'Grains',     price:65,  oldPrice:75,  emoji:'🌾', weight:'1 kg',      unit:'kg',    pricePerKg:65,   allowCustomQty:true,  stock:180, hot:false, isNew:false, active:true, imageUrl:'', description:'Finely milled whole wheat flour. Perfect for rotis and parathas.' },
  { id:'o1',  name:'Sunflower Oil',        nameTa:'சூரியகாந்தி எண்ணெய்', category:'Oils',       price:185, oldPrice:210, emoji:'🫙', weight:'1 Litre',   unit:'litre', pricePerKg:185,  allowCustomQty:false, stock:60,  hot:false, isNew:false, active:true, imageUrl:'', description:'Light, refined sunflower oil ideal for everyday Indian cooking.' },
  { id:'o2',  name:'Gingelly Oil',         nameTa:'நல்லெண்ணெய்',         category:'Oils',       price:280, oldPrice:320, emoji:'🫙', weight:'500ml',     unit:'litre', pricePerKg:560,  allowCustomQty:false, stock:30,  hot:true,  isNew:false, active:true, imageUrl:'', description:'Cold-pressed sesame oil with rich nutty flavour. Traditional and healthy.' },
  { id:'s1',  name:'Red Chilli Powder',    nameTa:'சிவப்பு மிளகாய் பொடி', category:'Spices',    price:80,  oldPrice:95,  emoji:'🌶️', weight:'200g',     unit:'g',     pricePerKg:400,  allowCustomQty:false, stock:80,  hot:false, isNew:false, active:true, imageUrl:'', description:'Bright red, aromatic chilli powder. Adds heat and colour to dishes.' },
  { id:'s2',  name:'Turmeric Powder',      nameTa:'மஞ்சள் தூள்',         category:'Spices',     price:55,  oldPrice:65,  emoji:'🟡', weight:'100g',      unit:'g',     pricePerKg:550,  allowCustomQty:false, stock:100, hot:false, isNew:false, active:true, imageUrl:'', description:'Pure turmeric with high curcumin content. Earthy, warm spice.' },
  { id:'b1',  name:'Filter Coffee Powder', nameTa:'பிலிட்டர் காபி தூள்', category:'Beverages',  price:220, oldPrice:250, emoji:'☕', weight:'500g',      unit:'g',     pricePerKg:440,  allowCustomQty:false, stock:40,  hot:true,  isNew:false, active:true, imageUrl:'', description:'South Indian filter coffee blend. Roasted and ground to perfection.' },
  { id:'b2',  name:'Tea Powder',           nameTa:'தேநீர் தூள்',         category:'Beverages',  price:180, oldPrice:200, emoji:'🍵', weight:'500g',      unit:'g',     pricePerKg:360,  allowCustomQty:false, stock:50,  hot:false, isNew:false, active:true, imageUrl:'', description:'Premium CTC tea powder for a strong, refreshing cup of chai.' },
  { id:'sn1', name:'Mixture',              nameTa:'மிக்ஸர்',             category:'Snacks',     price:80,  oldPrice:95,  emoji:'🍿', weight:'300g',      unit:'g',     pricePerKg:267,  allowCustomQty:false, stock:35,  hot:false, isNew:true,  active:true, imageUrl:'', description:'Crunchy South Indian mixture with peanuts, sev, and poha. Great snack.' },
];

// ── Initialization ────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.FM) {
      await FM.bootstrapFirestore();
      await loadProductsFromFirebase();
      loadTickerFromFirebase();
    } else {
      throw new Error('FM not ready');
    }
  } catch (e) {
    console.warn('Firebase unavailable, using demo products:', e.message);
    STATE.products = DEMO_PRODUCTS;
  }

  if (window.FM) {
    FM.auth.onAuthStateChanged(async (user) => {
      if (user) {
        const isActive = await FM.isUserActive(user.uid);
        if (!isActive) {
          FM.auth.signOut();
          showToast('Your account has been deactivated. Contact support.', 'error');
          return;
        }
        STATE.currentUser = user;
        const role = await FM.getUserRole(user.uid);
        STATE.userRole = role;
        updateNavForUser(user, role);
        loadNotifications(user.uid);
        loadUserOrders(user.uid);
        loadWishlist(user.uid);
      } else {
        STATE.currentUser = null;
        STATE.userRole = 'customer';
        updateNavForGuest();
      }
    });
  }

  renderProducts();
  setupSearch();
  setupCategories();
  startCountdown();
  loadCart();
  renderCart();
  setupScrollBehavior();

  // Show discount popup after 3s (only once per session)
  if (!sessionStorage.getItem('popupShown')) {
    setTimeout(showDiscountPopup, 3000);
  }

  // Hide loading screen
  setTimeout(() => {
    const ls = document.getElementById('loadingScreen');
    if (ls) { ls.style.opacity = '0'; ls.style.transition = 'opacity .4s'; setTimeout(() => ls.style.display = 'none', 400); }
  }, 1800);
});

// ── Scroll Behavior ───────────────────────────────────────────────────────────
function setupScrollBehavior() {
  const nav     = document.getElementById('mainNav');
  const scrollBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (scrollBtn) scrollBtn.classList.toggle('visible', y > 400);
  }, { passive: true });
}

// ── Firebase Loaders ──────────────────────────────────────────────────────────
async function loadProductsFromFirebase() {
  const snap = await FM.db.collection('products').where('active', '==', true).get();
  if (snap.empty) {
    await seedDemoProducts();
    STATE.products = DEMO_PRODUCTS;
  } else {
    STATE.products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

async function seedDemoProducts() {
  try {
    const batch = FM.db.batch();
    DEMO_PRODUCTS.forEach(p => {
      const ref = FM.db.collection('products').doc(p.id);
      const { id, ...data } = p;
      batch.set(ref, { ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
  } catch(e) { console.warn('Seed failed:', e.message); }
}

async function loadTickerFromFirebase() {
  try {
    const snap = await FM.db.collection('config').doc('offersBanner').get();
    if (snap.exists && snap.data().offers?.length > 0) {
      const offers = snap.data().offers;
      const doubled = [...offers, ...offers];
      const track = document.getElementById('tickerTrack');
      if (track) track.innerHTML = doubled.map(o => `<span>${escHtml(o)}</span>`).join('');
    }
  } catch(e) {}
}

// ── Screen Router ─────────────────────────────────────────────────────────────
function showScreen(name) {
  const screens = ['home', 'checkout', 'order-success', 'my-orders', 'profile', 'wishlist'];
  screens.forEach(s => {
    const el = document.getElementById(`${s}-screen`);
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
  closeCart(); closeNotif();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'my-orders')  loadUserOrders(STATE.currentUser?.uid);
  if (name === 'profile')    loadProfileForm();
  if (name === 'checkout')   populateCheckoutSummary();
  if (name === 'wishlist')   renderWishlistScreen();
}

// ── Auth UI ───────────────────────────────────────────────────────────────────
function updateNavForUser(user, role) {
  const guestBtns = document.getElementById('guestButtons');
  const userMenu  = document.getElementById('userMenu');
  const avatarBtn = document.getElementById('userAvatarBtn');
  const udName    = document.getElementById('udName');
  const udEmail   = document.getElementById('udEmail');
  const udRole    = document.getElementById('udRole');

  if (guestBtns) guestBtns.style.display = 'none';
  if (userMenu)  userMenu.style.display  = 'block';

  const displayName = FM.sanitizeStr(user.displayName || user.email?.split('@')[0] || 'User', 50);
  if (udName) udName.textContent  = displayName;
  if (udEmail) udEmail.textContent = user.email || '';

  // Set avatar
  if (avatarBtn) {
    if (user.photoURL) {
      avatarBtn.innerHTML = `<img src="${user.photoURL}" alt="Avatar">`;
    } else {
      avatarBtn.textContent = displayName.charAt(0).toUpperCase();
    }
  }

  // Role badge
  const roleLabels = { admin: 'Admin', shopkeeper: 'Shopkeeper', customer: 'Customer' };
  const roleClass  = { admin: 'role-admin', shopkeeper: 'role-shopkeeper', customer: 'role-customer' };
  if (udRole) {
    udRole.textContent = roleLabels[role] || 'Customer';
    udRole.className   = `ud-role ${roleClass[role] || 'role-customer'}`;
  }

  // Admin bar
  const bar = document.getElementById('adminActionsBar');
  if (bar && (role === 'admin' || role === 'shopkeeper')) {
    bar.classList.add('visible');
    const adminBtn = document.getElementById('goAdminPanelBtn');
    const skBtn    = document.getElementById('goShopkeeperPanelBtn');
    if (role === 'admin' && adminBtn) adminBtn.style.display = 'block';
    if ((role === 'admin' || role === 'shopkeeper') && skBtn) skBtn.style.display = 'block';
  }
}

function updateNavForGuest() {
  const guestBtns = document.getElementById('guestButtons');
  const userMenu  = document.getElementById('userMenu');
  const bar       = document.getElementById('adminActionsBar');
  if (guestBtns) guestBtns.style.display = 'flex';
  if (userMenu)  userMenu.style.display  = 'none';
  if (bar)       bar.classList.remove('visible');
}

function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  const btn = document.getElementById('userAvatarBtn');
  if (dd) {
    const open = dd.classList.toggle('open');
    if (btn) btn.setAttribute('aria-expanded', open);
  }
}

document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  const dd   = document.getElementById('userDropdown');
  if (menu && dd && !menu.contains(e.target)) {
    dd.classList.remove('open');
    const btn = document.getElementById('userAvatarBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  const searchDD = document.getElementById('searchDropdown');
  const searchInput = document.getElementById('searchInput');
  if (searchDD && searchInput && !searchInput.contains(e.target) && !searchDD.contains(e.target)) {
    searchDD.classList.remove('open');
  }
});

// ── Auth Functions ────────────────────────────────────────────────────────────
function openAuth(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (modal) { modal.classList.add('open'); modal.style.display = 'flex'; }
  switchAuthTab(tab);
}

function closeAuthModal(event) {
  if (event && event.target !== event.currentTarget) return;
  closeAuthDirect();
}
function closeAuthDirect() {
  const modal = document.getElementById('authModal');
  if (modal) { modal.style.display = 'none'; modal.classList.remove('open'); }
}

function switchAuthTab(tab) {
  const lt = document.getElementById('loginTab');
  const st = document.getElementById('signupTab');
  const lf = document.getElementById('loginForm');
  const sf = document.getElementById('signupForm');
  if (tab === 'login') {
    lt?.classList.add('active'); lt?.setAttribute('aria-selected','true');
    st?.classList.remove('active'); st?.setAttribute('aria-selected','false');
    if (lf) lf.style.display = 'block';
    if (sf) sf.style.display = 'none';
  } else {
    st?.classList.add('active'); st?.setAttribute('aria-selected','true');
    lt?.classList.remove('active'); lt?.setAttribute('aria-selected','false');
    if (sf) sf.style.display = 'block';
    if (lf) lf.style.display = 'none';
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; }
  else { input.type = 'password'; btn.textContent = 'Show'; }
}

function updatePasswordStrength(val) {
  const wrap = document.getElementById('passwordStrength');
  const bar  = document.getElementById('psBar');
  const lbl  = document.getElementById('psLabel');
  if (!wrap || !bar || !lbl) return;
  if (!val) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w:'20%', c:'var(--red)',        t:'Weak' },
    { w:'40%', c:'var(--orange)',     t:'Fair' },
    { w:'70%', c:'var(--gold)',       t:'Good' },
    { w:'100%',c:'var(--green)',      t:'Strong' },
  ];
  const l = levels[Math.max(0, score - 1)] || levels[0];
  bar.style.width      = l.w;
  bar.style.background = l.c;
  lbl.textContent      = l.t;
  lbl.style.color      = l.c;
}

async function signInUser() {
  if (!FM.checkRateLimit('login', 5)) { showToast('Too many attempts. Try again in a minute.', 'error'); return; }
  const emailEl = document.getElementById('loginEmail');
  const passEl  = document.getElementById('loginPassword');
  const errEl   = document.getElementById('loginError');
  const btn     = document.getElementById('loginSubmitBtn');
  if (!emailEl || !passEl) return;

  const email = emailEl.value.trim();
  const pass  = passEl.value;
  if (!email || !pass) { showAuthError(errEl, 'Please fill in all fields.'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
  try {
    const cred = await FM.auth.signInWithEmailAndPassword(email, pass);
    await FM.ensureUserDocument(cred.user);
    closeAuthDirect();
    showToast('Welcome back! 👋', 'success');
  } catch(e) {
    showAuthError(errEl, friendlyAuthError(e.code));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In →'; }
  }
}

async function signUpUser() {
  if (!FM.checkRateLimit('signup', 3)) { showToast('Too many attempts. Try again in a minute.', 'error'); return; }
  const nameEl  = document.getElementById('signupName');
  const phoneEl = document.getElementById('signupPhone');
  const emailEl = document.getElementById('signupEmail');
  const passEl  = document.getElementById('signupPassword');
  const errEl   = document.getElementById('signupError');
  const btn     = document.getElementById('signupSubmitBtn');

  const name  = FM.sanitizeStr(nameEl?.value || '', 100);
  const phone = FM.sanitizeStr(phoneEl?.value || '', 15);
  const email = emailEl?.value.trim() || '';
  const pass  = passEl?.value || '';

  if (!name || !email || !pass) { showAuthError(errEl, 'Please fill in all required fields.'); return; }
  if (phone && !/^\d{10}$/.test(phone)) { showAuthError(errEl, 'Enter a valid 10-digit phone number.'); return; }
  if (pass.length < 8) { showAuthError(errEl, 'Password must be at least 8 characters.'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }
  try {
    const cred = await FM.auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    await FM.ensureUserDocument(cred.user, { name, phone, provider: 'email' });
    closeAuthDirect();
    showToast('Account created! Welcome 🎉', 'success');
  } catch(e) {
    showAuthError(errEl, friendlyAuthError(e.code));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account →'; }
  }
}

async function signInGoogle() {
  if (!FM.checkRateLimit('google-auth', 5)) return;
  try {
    const result = await FM.auth.signInWithPopup(FM.googleProvider);
    await FM.ensureUserDocument(result.user, { provider: 'google' });
    closeAuthDirect();
    showToast('Signed in with Google! 🎉', 'success');
  } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      showToast(friendlyAuthError(e.code), 'error');
    }
  }
}

async function signOutUser() {
  try {
    await FM.auth.signOut();
    STATE.currentUser = null;
    STATE.userRole = 'customer';
    STATE.wishlist = [];
    updateNavForGuest();
    showToast('Signed out successfully.', 'info');
    showScreen('home');
  } catch(e) { showToast('Error signing out.', 'error'); }
}

async function forgotPassword() {
  const email = document.getElementById('loginEmail')?.value.trim();
  if (!email) { showToast('Enter your email first.', 'error'); return; }
  try {
    await FM.auth.sendPasswordResetEmail(email);
    showToast('Password reset email sent! Check your inbox.', 'success');
  } catch(e) { showToast(friendlyAuthError(e.code), 'error'); }
}

async function sendPasswordReset() {
  if (!STATE.currentUser?.email) return;
  try {
    await FM.auth.sendPasswordResetEmail(STATE.currentUser.email);
    showToast('Password reset email sent!', 'success');
  } catch(e) { showToast('Could not send reset email.', 'error'); }
}

function showAuthError(el, msg) {
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function friendlyAuthError(code) {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered. Try signing in.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/too-many-requests':    'Too many failed attempts. Try again later.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/popup-blocked':        'Pop-up blocked. Allow pop-ups and try again.',
    'auth/unauthorized-domain':  'This domain is not authorized. See SETUP.md.',
  };
  return map[code] || 'Authentication failed. Please try again.';
}

// ── Products ──────────────────────────────────────────────────────────────────
function getFilteredProducts() {
  let products = STATE.products.filter(p => p.active !== false);
  if (STATE.activeCategory !== 'all') {
    products = products.filter(p => p.category === STATE.activeCategory);
  }
  if (STATE.searchQuery) {
    const q = STATE.searchQuery.toLowerCase();
    products = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.nameTa?.includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }
  const sort = document.getElementById('sortSelect')?.value || 'default';
  switch(sort) {
    case 'price-asc':  products.sort((a,b) => a.price - b.price); break;
    case 'price-desc': products.sort((a,b) => b.price - a.price); break;
    case 'name-asc':   products.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'discount':   products.sort((a,b) => (b.oldPrice - b.price) - (a.oldPrice - a.price)); break;
    default:           products.sort((a,b) => ((b.hot?1:0)+(b.isNew?1:0)) - ((a.hot?1:0)+(a.isNew?1:0)));
  }
  return products;
}

function renderProducts() {
  const grid     = document.getElementById('productGrid');
  const noEl     = document.getElementById('noProducts');
  const countEl  = document.getElementById('productCount');
  if (!grid) return;

  const products = getFilteredProducts();
  if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  if (products.length === 0) {
    grid.innerHTML = '';
    if (noEl) noEl.style.display = 'block';
    return;
  }
  if (noEl) noEl.style.display = 'none';
  grid.innerHTML = products.map(p => renderProductCard(p)).join('');
  renderFlashDeals();
  renderCarousel();
}

function renderProductCard(p, context = 'grid') {
  const inCart    = STATE.cart.find(c => c.id === p.id);
  const inWishlist = STATE.wishlist.includes(p.id);
  const outOfStock = (p.stock ?? 1) <= 0;
  const discount   = p.oldPrice > p.price ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : 0;

  const badges = [];
  if (outOfStock)  badges.push(`<span class="pc-badge badge-out">Out of Stock</span>`);
  else if (p.hot)  badges.push(`<span class="pc-badge badge-hot">🔥 Hot</span>`);
  if (p.isNew)     badges.push(`<span class="pc-badge badge-new">✨ New</span>`);
  if (discount > 0) badges.push(`<span class="pc-badge badge-sale">${discount}% OFF</span>`);

  const imgContent = p.imageUrl
    ? `<img src="${p.imageUrl}" alt="${escHtml(p.name)}" loading="lazy">`
    : `<span class="pc-img-emoji">${p.emoji || '🛒'}</span>`;

  const ctaSection = outOfStock
    ? `<div class="pc-add out-of-stock">Out of Stock</div>`
    : inCart
      ? `<div class="pc-qty-ctrl">
           <div class="qty-btn" onclick="event.stopPropagation();changeCartQty('${p.id}',-1)">−</div>
           <div class="qty-num">${inCart.qty}</div>
           <div class="qty-btn" onclick="event.stopPropagation();changeCartQty('${p.id}',1)">+</div>
         </div>`
      : `<div class="pc-add" onclick="event.stopPropagation();quickAddToCart('${p.id}')">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
           Add to Cart
         </div>`;

  return `
    <div class="product-card" role="listitem" onclick="openProductModal('${p.id}')" tabindex="0" onkeydown="if(event.key==='Enter')openProductModal('${p.id}')">
      <div class="pc-badges">${badges.join('')}</div>
      <div class="pc-wishlist ${inWishlist ? 'active' : ''}" onclick="event.stopPropagation();toggleWishlist('${p.id}')" title="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}" aria-label="Wishlist">
        ${inWishlist ? '❤️' : '🤍'}
      </div>
      <div class="pc-img">${imgContent}</div>
      <div class="pc-body">
        <div class="pc-category">${escHtml(p.category)}</div>
        <div class="pc-name">${escHtml(p.name)}</div>
        ${p.nameTa ? `<div class="pc-name-ta">${escHtml(p.nameTa)}</div>` : ''}
        <div class="pc-weight">${escHtml(p.weight || '')}</div>
        <div class="pc-price-row">
          <div class="pc-price">₹${p.price}</div>
          ${p.oldPrice > p.price ? `<div class="pc-old-price">₹${p.oldPrice}</div>` : ''}
          ${discount > 0 ? `<div class="pc-discount-pct">${discount}%</div>` : ''}
        </div>
      </div>
      ${ctaSection}
    </div>`;
}

function renderFlashDeals() {
  const grid  = document.getElementById('dealsGrid');
  if (!grid) return;
  const deals = STATE.products.filter(p => p.hot && p.active !== false).slice(0, 4);
  if (deals.length === 0) { const fs = document.getElementById('flashSection'); if (fs) fs.style.display = 'none'; return; }
  grid.innerHTML = deals.map(p => {
    const discount = p.oldPrice > p.price ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : 0;
    return `
      <div class="deal-card" onclick="openProductModal('${p.id}')">
        <div class="deal-emoji">${p.emoji || '🛒'}</div>
        <div class="deal-name">${escHtml(p.name)}</div>
        ${p.nameTa ? `<div class="deal-name-ta">${escHtml(p.nameTa)}</div>` : ''}
        <div class="deal-price">
          <span class="deal-price-new">₹${p.price}</span>
          ${p.oldPrice > p.price ? `<span class="deal-price-old">₹${p.oldPrice}</span>` : ''}
          ${discount > 0 ? `<span class="deal-save">-${discount}%</span>` : ''}
        </div>
        <button class="deal-add" onclick="event.stopPropagation();quickAddToCart('${p.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Add to Cart
        </button>
      </div>`;
  }).join('');
}

function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const newItems = STATE.products.filter(p => p.isNew && p.active !== false).slice(0, 10);
  if (newItems.length === 0) { const na = document.getElementById('newArrivalsSection'); if (na) na.style.display = 'none'; return; }
  track.innerHTML = newItems.map(p => `
    <div class="carousel-card" onclick="openProductModal('${p.id}')">
      <div class="carousel-img">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${escHtml(p.name)}" loading="lazy">` : p.emoji || '🛒'}
      </div>
      <div class="carousel-info">
        <div class="carousel-name">${escHtml(p.name)}</div>
        <div class="carousel-price">₹${p.price}</div>
      </div>
    </div>`).join('');

  const cardWidth = 216;
  document.getElementById('carouselNext')?.addEventListener('click', () => {
    STATE.carouselIndex = Math.min(STATE.carouselIndex + 1, newItems.length - 4);
    track.style.transform = `translateX(-${STATE.carouselIndex * cardWidth}px)`;
  });
  document.getElementById('carouselPrev')?.addEventListener('click', () => {
    STATE.carouselIndex = Math.max(STATE.carouselIndex - 1, 0);
    track.style.transform = `translateX(-${STATE.carouselIndex * cardWidth}px)`;
  });
}

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  'all':        { emoji: '🏪', label: 'All' },
  'Dairy':      { emoji: '🥛', label: 'Dairy' },
  'Vegetables': { emoji: '🥦', label: 'Vegetables' },
  'Fruits':     { emoji: '🍎', label: 'Fruits' },
  'Grains':     { emoji: '🌾', label: 'Grains' },
  'Oils':       { emoji: '🫙', label: 'Oils' },
  'Spices':     { emoji: '🌶️', label: 'Spices' },
  'Beverages':  { emoji: '☕', label: 'Beverages' },
  'Snacks':     { emoji: '🍿', label: 'Snacks' },
};

function setupCategories() {
  const wrap = document.getElementById('categoriesWrap');
  if (!wrap) return;
  const cats = ['all', ...new Set(STATE.products.map(p => p.category).filter(Boolean))];
  wrap.innerHTML = cats.map(cat => {
    const meta  = CATEGORY_META[cat] || { emoji: '📦', label: cat };
    const count = cat === 'all' ? STATE.products.length : STATE.products.filter(p => p.category === cat).length;
    return `
      <button class="cat-pill ${cat === STATE.activeCategory ? 'active' : ''}"
              onclick="filterCategory('${cat}')" role="tab"
              aria-selected="${cat === STATE.activeCategory}">
        <span class="cat-emoji">${meta.emoji}</span>
        ${meta.label}
        <span class="cat-count">${count}</span>
      </button>`;
  }).join('');
}

function filterCategory(cat) {
  STATE.activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(p => {
    const isActive = p.textContent.trim().startsWith(CATEGORY_META[cat]?.emoji || '') || p.onclick?.toString().includes(`'${cat}'`);
    p.classList.toggle('active', p.getAttribute('onclick')?.includes(`'${cat}'`));
    p.setAttribute('aria-selected', p.getAttribute('onclick')?.includes(`'${cat}'`) ? 'true' : 'false');
  });
  renderProducts();
}

function resetFilters() {
  STATE.activeCategory = 'all';
  STATE.searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  setupCategories();
  renderProducts();
}

// ── Search ────────────────────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('searchInput');
  const dd    = document.getElementById('searchDropdown');
  const clear = document.getElementById('searchClear');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (clear) clear.classList.toggle('visible', q.length > 0);
    debounceTimer = setTimeout(() => {
      STATE.searchQuery = q;
      renderProducts();
      if (q.length >= 2) {
        showSearchDropdown(q);
        input.setAttribute('aria-expanded', 'true');
      } else {
        if (dd) dd.classList.remove('open');
        input.setAttribute('aria-expanded', 'false');
      }
    }, 220);
  });

  if (clear) clear.addEventListener('click', () => {
    input.value = '';
    STATE.searchQuery = '';
    clear.classList.remove('visible');
    if (dd) dd.classList.remove('open');
    renderProducts();
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (dd) dd.classList.remove('open'); input.blur(); }
  });
}

function showSearchDropdown(q) {
  const dd = document.getElementById('searchDropdown');
  if (!dd) return;
  const results = STATE.products.filter(p =>
    p.active !== false && (
      p.name?.toLowerCase().includes(q.toLowerCase()) ||
      p.nameTa?.includes(q) ||
      p.category?.toLowerCase().includes(q.toLowerCase())
    )
  ).slice(0, 8);

  if (results.length === 0) {
    dd.innerHTML = `<div class="search-no-results">No products found for "<strong>${escHtml(q)}</strong>"</div>`;
  } else {
    dd.innerHTML = `<div class="search-dropdown-header">Results for "${escHtml(q)}"</div>` +
      results.map(p => {
        const imgContent = p.imageUrl
          ? `<img src="${p.imageUrl}" alt="${escHtml(p.name)}" loading="lazy">`
          : p.emoji || '🛒';
        return `
          <div class="search-item" onclick="openProductModal('${p.id}');document.getElementById('searchDropdown').classList.remove('open')" role="option">
            <div class="si-img">${imgContent}</div>
            <div class="si-info">
              <div class="si-name">${escHtml(p.name)}</div>
              ${p.nameTa ? `<div class="si-name-ta">${escHtml(p.nameTa)}</div>` : ''}
              <div class="si-price">₹${p.price} / ${p.weight || 'unit'}</div>
            </div>
            <div class="si-add-btn" onclick="event.stopPropagation();quickAddToCart('${p.id}');document.getElementById('searchDropdown').classList.remove('open')">Add +</div>
          </div>`;
      }).join('');
  }
  dd.classList.add('open');
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function openProductModal(productId) {
  const p = STATE.products.find(x => x.id === productId);
  if (!p) return;
  const modal = document.getElementById('productModal');
  const box   = document.getElementById('modalBox');
  if (!modal || !box) return;

  const inCart    = STATE.cart.find(c => c.id === p.id);
  const inWishlist = STATE.wishlist.includes(p.id);
  const outOfStock = (p.stock ?? 1) <= 0;
  const discount   = p.oldPrice > p.price ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : 0;

  const imgContent = p.imageUrl
    ? `<img src="${p.imageUrl}" alt="${escHtml(p.name)}">`
    : `<span style="font-size:88px;line-height:1">${p.emoji || '🛒'}</span>`;

  const customQtySection = p.allowCustomQty ? `
    <div class="pm-custom-qty">
      <label>Custom Quantity (${p.unit === 'kg' ? 'kg' : p.unit === 'litre' ? 'L' : 'units'})</label>
      <div class="pm-qty-input-row">
        <input type="number" class="pm-qty-input" id="pmQtyInput" value="1" min="0.1" step="${p.unit === 'g' ? '100' : '0.5'}" onchange="updateModalPrice(${p.pricePerKg})">
        <span class="pm-qty-unit">${p.unit === 'kg' ? 'kg' : p.unit === 'litre' ? 'L' : 'units'}</span>
        <span class="pm-calc-price" id="pmCalcPrice">₹${p.price}</span>
      </div>
    </div>` : '';

  box.innerHTML = `
    <div class="pm-img">${imgContent}</div>
    <div class="pm-body">
      <div class="pm-cat">${escHtml(p.category)}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="pm-name">${escHtml(p.name)}</div>
          ${p.nameTa ? `<div class="pm-name-ta">${escHtml(p.nameTa)}</div>` : ''}
        </div>
        <div onclick="toggleWishlist('${p.id}')" style="font-size:24px;cursor:pointer;padding:4px" title="Wishlist" id="modalWishlistBtn">
          ${inWishlist ? '❤️' : '🤍'}
        </div>
      </div>
      ${p.description ? `<div class="pm-description">${escHtml(p.description)}</div>` : ''}
      <div class="pm-weight-row">
        <span class="pm-weight-tag">📦 ${escHtml(p.weight || 'standard')}</span>
        ${discount > 0 ? `<span class="pm-save-badge">Save ${discount}%</span>` : ''}
        <span class="pm-weight-tag" style="${(p.stock ?? 1) > 0 ? 'color:var(--green)' : 'color:var(--red)'}">
          ${(p.stock ?? 1) > 10 ? '✅ In Stock' : (p.stock ?? 1) > 0 ? `⚠️ ${p.stock} left` : '❌ Out of Stock'}
        </span>
      </div>
      <div class="pm-price-row">
        <div class="pm-price">₹${p.price}</div>
        ${p.oldPrice > p.price ? `<div class="pm-old-price">₹${p.oldPrice}</div>` : ''}
      </div>
      ${customQtySection}
      <button class="pm-add-btn" id="pmAddBtn" onclick="addToCartFromModal('${p.id}')" ${outOfStock ? 'disabled' : ''}>
        ${outOfStock ? '❌ Out of Stock' : inCart ? `✅ In Cart (${inCart.qty}) — Add More` : '🛒 Add to Cart'}
      </button>
      <div class="pm-tags">
        ${p.hot ? '<span class="pm-tag">🔥 Hot Item</span>' : ''}
        ${p.isNew ? '<span class="pm-tag">✨ New Arrival</span>' : ''}
        <span class="pm-tag">📦 ${escHtml(p.weight || '')}</span>
        <span class="pm-tag">🏷️ ${escHtml(p.category)}</span>
      </div>
    </div>`;

  modal.style.display = 'flex';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateModalPrice(pricePerKg) {
  const input = document.getElementById('pmQtyInput');
  const calc  = document.getElementById('pmCalcPrice');
  if (!input || !calc) return;
  const qty = parseFloat(input.value) || 1;
  calc.textContent = `₹${Math.ceil(pricePerKg * qty)}`;
}

function addToCartFromModal(productId) {
  const p = STATE.products.find(x => x.id === productId);
  if (!p || (p.stock ?? 1) <= 0) return;

  let qty = 1;
  let displayQty = `1 × ${p.weight}`;
  let price = p.price;

  if (p.allowCustomQty) {
    const input = document.getElementById('pmQtyInput');
    if (input) {
      qty = parseFloat(input.value) || 1;
      qty = Math.max(0.1, qty);
      price = Math.ceil(p.pricePerKg * qty);
      const unit = p.unit === 'kg' ? 'kg' : p.unit === 'litre' ? 'L' : '';
      displayQty = `${qty}${unit}`;
    }
  }

  addToCart(p, qty, price, displayQty);
  closeProductModalDirect();
  openCart();
}

function quickAddToCart(productId) {
  const p = STATE.products.find(x => x.id === productId);
  if (!p || (p.stock ?? 1) <= 0) { showToast('This product is out of stock.', 'error'); return; }
  addToCart(p, 1, p.price, `1 × ${p.weight}`);
}

function closeProductModal(event) {
  if (event && event.target !== event.currentTarget) return;
  closeProductModalDirect();
}
function closeProductModalDirect() {
  const modal = document.getElementById('productModal');
  if (modal) { modal.style.display = 'none'; modal.classList.remove('open'); }
  document.body.style.overflow = '';
}

// ── Cart ──────────────────────────────────────────────────────────────────────
function addToCart(product, qty = 1, price = null, displayQty = null) {
  const effectivePrice = price ?? product.price;
  const existing = STATE.cart.find(c => c.id === product.id);
  if (existing) {
    existing.qty   += qty;
    existing.price  = effectivePrice;
  } else {
    STATE.cart.push({
      id:         product.id,
      name:       product.name,
      nameTa:     product.nameTa || '',
      emoji:      product.emoji || '🛒',
      imageUrl:   product.imageUrl || '',
      weight:     product.weight || '',
      displayQty: displayQty || `${qty} × ${product.weight}`,
      price:      effectivePrice,
      qty:        qty,
      allowCustomQty: product.allowCustomQty || false,
    });
  }
  saveCart();
  renderCart();
  renderProducts();
  showToast(`${product.name} added to cart! 🛒`, 'success');
  animateCartBadge();
}

function changeCartQty(productId, delta) {
  const item = STATE.cart.find(c => c.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    STATE.cart = STATE.cart.filter(c => c.id !== productId);
  }
  saveCart();
  renderCart();
  renderProducts();
}

function removeFromCart(productId) {
  STATE.cart = STATE.cart.filter(c => c.id !== productId);
  saveCart();
  renderCart();
  renderProducts();
}

function saveCart() {
  try { localStorage.setItem('sna_cart', JSON.stringify(STATE.cart)); } catch(e) {}
}
function loadCart() {
  try {
    const raw = localStorage.getItem('sna_cart');
    STATE.cart = raw ? JSON.parse(raw) : [];
    // Validate cart items
    STATE.cart = STATE.cart.filter(c => c.id && c.name && c.price > 0 && c.qty > 0);
  } catch(e) { STATE.cart = []; }
}

function renderCart() {
  const itemsEl  = document.getElementById('cartItems');
  const badgeEl  = document.getElementById('cartBadge');
  const footerEl = document.getElementById('cartFooter');

  const totalItems = STATE.cart.reduce((s, c) => s + c.qty, 0);
  if (badgeEl) {
    badgeEl.textContent = totalItems;
    badgeEl.classList.toggle('visible', totalItems > 0);
  }
  const subEl = document.getElementById('cartHeaderSub');
  if (subEl) subEl.textContent = totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''}` : '';

  if (!itemsEl) return;

  if (STATE.cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-family:var(--font-tamil);font-size:13px;color:var(--text-muted);margin-top:4px">உங்கள் கூடை காலியாக உள்ளது</p>
        <button onclick="closeCart();showScreen('home')" style="margin-top:16px;height:40px;padding:0 20px;background:var(--primary);color:#fff;border-radius:9px;font-size:13.5px;font-weight:700">Start Shopping →</button>
      </div>`;
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = STATE.cart.map(item => {
    const imgContent = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="${escHtml(item.name)}" loading="lazy">`
      : item.emoji || '🛒';
    return `
      <div class="cart-item">
        <div class="ci-img">${imgContent}</div>
        <div class="ci-info">
          <div class="ci-name">${escHtml(item.name)}</div>
          <div class="ci-desc">${escHtml(item.displayQty || item.weight || '')}</div>
          <div class="ci-price">₹${item.price * item.qty}</div>
          <div class="ci-actions">
            <div class="ci-qty-btn" onclick="changeCartQty('${item.id}',-1)" aria-label="Decrease quantity">−</div>
            <div class="ci-qty-num">${item.qty}</div>
            <div class="ci-qty-btn" onclick="changeCartQty('${item.id}',1)" aria-label="Increase quantity">+</div>
            <div class="ci-remove" onclick="removeFromCart('${item.id}')" title="Remove" aria-label="Remove item">🗑️</div>
          </div>
        </div>
      </div>`;
  }).join('');

  if (footerEl) footerEl.style.display = 'block';
  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = STATE.cart.reduce((s, c) => s + (c.price * c.qty), 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  let discount   = 0;
  if (STATE.coupon) discount = STATE.coupon.discount;
  const total = Math.max(0, subtotal + delivery - discount);

  // Progress bar
  const dpBar  = document.getElementById('dpBar');
  const dpText = document.getElementById('dpText');
  const dpPct  = document.getElementById('dpPct');
  if (dpBar) {
    const pct = Math.min(100, Math.round(subtotal / FREE_DELIVERY_THRESHOLD * 100));
    dpBar.style.width = `${pct}%`;
    if (dpPct) dpPct.textContent = `${pct}%`;
    if (dpText) {
      dpText.textContent = subtotal >= FREE_DELIVERY_THRESHOLD
        ? '🎉 You have free delivery!'
        : `Add ₹${FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery`;
    }
  }

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('cartSubtotal', `₹${subtotal}`);
  setEl('cartDelivery', delivery === 0 ? '🆓 Free' : `₹${delivery}`);
  setEl('cartTotal', `₹${total}`);
  setEl('osSubtotal', `₹${subtotal}`);
  setEl('osDelivery', delivery === 0 ? '🆓 Free' : `₹${delivery}`);
  setEl('osTotal', `₹${total}`);

  const discRow = document.getElementById('cartDiscountRow');
  const osDiscRow = document.getElementById('osDiscountRow');
  if (discRow) discRow.style.display = discount > 0 ? 'flex' : 'none';
  if (osDiscRow) osDiscRow.style.display = discount > 0 ? 'flex' : 'none';
  setEl('cartDiscount', `-₹${discount}`);
  setEl('osDiscount', `-₹${discount}`);
}

function animateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.style.transform = 'scale(1.4)';
  setTimeout(() => badge.style.transform = 'scale(1)', 300);
}

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Coupon ────────────────────────────────────────────────────────────────────
async function applyCoupon() {
  const input = document.getElementById('couponInput');
  const msg   = document.getElementById('couponMsg');
  const btn   = document.getElementById('applyCouponBtn');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();
  if (!code) { msg.textContent = 'Please enter a coupon code.'; msg.className = 'coupon-msg error'; return; }

  if (window.FM && !FM.checkRateLimit('coupon', 5)) { msg.textContent = 'Too many attempts. Try again later.'; msg.className = 'coupon-msg error'; return; }

  if (btn) btn.disabled = true;
  msg.textContent = 'Verifying…';
  msg.className   = 'coupon-msg';

  const subtotal = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);

  if (window.FM) {
    const result = await FM.validateCoupon(code, subtotal);
    if (result.valid) {
      STATE.coupon = result;
      msg.textContent = `✅ ${result.type === 'percent' ? '' : ''}Discount of ₹${result.discount} applied!`;
      msg.className   = 'coupon-msg success';
      updateCartTotals();
    } else {
      STATE.coupon = null;
      msg.textContent = `❌ ${result.msg}`;
      msg.className   = 'coupon-msg error';
      updateCartTotals();
    }
  } else {
    // Demo mode
    const demo = { FRESH30: { discount: 30, type: 'percent' }, DAIRY20: { discount: 20, type: 'percent' }, NEWUSER: { discount: 50, type: 'flat' }, FREESHIP: { discount: 40, type: 'flat' } };
    const found = demo[code];
    if (found) {
      const discAmt = found.type === 'percent' ? Math.ceil(subtotal * found.discount / 100) : found.discount;
      STATE.coupon = { code, discount: discAmt, type: found.type };
      msg.textContent = `✅ Discount of ₹${discAmt} applied!`;
      msg.className   = 'coupon-msg success';
    } else {
      STATE.coupon = null;
      msg.textContent = '❌ Coupon not found.';
      msg.className   = 'coupon-msg error';
    }
    updateCartTotals();
  }
  if (btn) btn.disabled = false;
}

// ── Checkout ──────────────────────────────────────────────────────────────────
function goToCheckout() {
  if (STATE.cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  closeCart();
  showScreen('checkout');
  populateCheckoutSummary();
  // Pre-fill from user profile
  if (STATE.currentUser) {
    document.getElementById('checkoutAuthNotice')?.style.setProperty('display','none');
    FM.db.collection('users').doc(STATE.currentUser.uid).get().then(snap => {
      if (snap.exists) {
        const d = snap.data();
        const setVal = (id, v) => { const el = document.getElementById(id); if (el && !el.value) el.value = v || ''; };
        setVal('coName',    d.name  || STATE.currentUser.displayName || '');
        setVal('coPhone',   d.phone || '');
        setVal('coAddress', d.address || '');
        const cityEl = document.getElementById('coCity');
        if (cityEl && d.city) cityEl.value = d.city;
      }
    }).catch(() => {});
  } else {
    document.getElementById('checkoutAuthNotice')?.style.setProperty('display','block');
  }
}

function populateCheckoutSummary() {
  const osItems = document.getElementById('osSummaryItems');
  if (!osItems) return;
  osItems.innerHTML = STATE.cart.map(item => {
    const imgContent = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">`
      : item.emoji || '🛒';
    return `
      <div class="os-item">
        <div class="os-item-img">${imgContent}</div>
        <div class="os-item-name">${escHtml(item.name)} <span class="os-item-qty">×${item.qty}</span></div>
        <div class="os-item-price">₹${item.price * item.qty}</div>
      </div>`;
  }).join('');
  updateCartTotals();
}

function selectPayment(method) {
  STATE.paymentMethod = method;
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  document.getElementById(method === 'upi' ? 'payOptUpi' : 'payOptCod')?.classList.add('selected');
  const upiSection = document.getElementById('upiSection');
  if (upiSection) upiSection.style.display = method === 'upi' ? 'block' : 'none';
}

function selectUpiApp(app) {
  STATE.selectedUpiApp = app;
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('selected'));
  document.getElementById(`upi-${app}`)?.classList.add('selected');
}

function validateCheckoutForm() {
  const fields = [
    { id: 'coName',    errId: 'coNameErr',    check: v => v.length >= 2,             msg: 'Enter a valid name.' },
    { id: 'coPhone',   errId: 'coPhoneErr',   check: v => /^\d{10}$/.test(v),        msg: 'Enter a 10-digit phone number.' },
    { id: 'coAddress', errId: 'coAddressErr', check: v => v.length >= 5,             msg: 'Enter a valid address.' },
  ];
  let valid = true;
  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    const val = el?.value.trim() || '';
    const ok  = f.check(val);
    if (el)  el.classList.toggle('error', !ok);
    if (err) err.style.display = ok ? 'none' : 'block';
    if (!ok) valid = false;
  });
  const cityEl = document.getElementById('coCity');
  if (!cityEl?.value) { valid = false; showToast('Please select your city.', 'error'); }
  return valid;
}

async function placeOrder() {
  if (!validateCheckoutForm()) { showToast('Please fill in all required fields.', 'error'); return; }
  if (STATE.cart.length === 0) { showToast('Your cart is empty.', 'error'); return; }

  const btn = document.getElementById('placeOrderBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Placing Order…'; }

  const getVal = id => FM.sanitizeStr(document.getElementById(id)?.value?.trim() || '', 200);
  const subtotal = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const discount = STATE.coupon?.discount || 0;
  const total    = Math.max(0, subtotal + delivery - discount);
  const orderId  = FM.generateOrderId();

  const order = {
    orderId,
    customerName:  getVal('coName'),
    phone:         getVal('coPhone'),
    address:       getVal('coAddress'),
    city:          document.getElementById('coCity')?.value || '',
    pincode:       getVal('coPincode'),
    notes:         getVal('coNotes'),
    items:         STATE.cart.map(c => ({
      id: c.id, name: c.name, emoji: c.emoji || '',
      qty: c.qty, price: c.price, displayQty: c.displayQty || ''
    })),
    subtotal, delivery, discount, total,
    couponCode:    STATE.coupon?.code || '',
    paymentMethod: STATE.paymentMethod,
    upiApp:        STATE.paymentMethod === 'upi' ? STATE.selectedUpiApp : '',
    deliveryLat:   STATE.deliveryLat,
    deliveryLng:   STATE.deliveryLng,
    status:        'pending',
    uid:           STATE.currentUser?.uid || null,
    createdAt:     window.FM ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
  };

  try {
    if (window.FM) {
      // Save order with custom ID
      await FM.db.collection('orders').doc(orderId).set(order);

      // Mark coupon as used
      if (STATE.coupon?.docId) {
        FM.db.collection('coupons').doc(STATE.coupon.docId).update({
          usedCount: firebase.firestore.FieldValue.increment(1)
        }).catch(() => {});
      }

      // Update user stats
      if (STATE.currentUser?.uid) {
        FM.db.collection('users').doc(STATE.currentUser.uid).update({
          totalOrders: firebase.firestore.FieldValue.increment(1),
          totalSpent:  firebase.firestore.FieldValue.increment(total),
          updatedAt:   firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
        // Send notification to user
        FM.db.collection('notifications').add({
          uid:   STATE.currentUser.uid,
          icon:  '📦',
          title: `Order #${orderId.slice(-8)} Confirmed!`,
          desc:  `Your order for ₹${total} has been placed. Estimated delivery: 30-45 min.`,
          type:  'order',
          read:  false,
          time:  new Date().toLocaleTimeString(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
      }

      // Update product stock
      const batch = FM.db.batch();
      STATE.cart.forEach(item => {
        const ref = FM.db.collection('products').doc(item.id);
        batch.update(ref, { stock: firebase.firestore.FieldValue.increment(-Math.ceil(item.qty)) });
      });
      batch.commit().catch(() => {});
    }

    STATE.lastOrderId = orderId;
    STATE.cart        = [];
    STATE.coupon      = null;
    saveCart();
    renderCart();

    // UPI deep link
    if (STATE.paymentMethod === 'upi') {
      const upiId  = 'snarajamaligai@upi';
      const payee  = encodeURIComponent('S.N.A Raja Maligai');
      const note   = encodeURIComponent(`Order ${orderId}`);
      const upiLinks = {
        gpay:    `gpay://upi/pay?pa=${upiId}&pn=${payee}&am=${total}&tn=${note}`,
        phonepe: `phonepe://upi/pay?pa=${upiId}&pn=${payee}&am=${total}&tn=${note}`,
        paytm:   `paytmmp://upi/pay?pa=${upiId}&pn=${payee}&am=${total}&tn=${note}`,
      };
      const link = upiLinks[STATE.selectedUpiApp] || upiLinks.gpay;
      setTimeout(() => { window.location.href = link; }, 500);
    }

    document.getElementById('successOrderId').textContent = `#${orderId}`;
    showScreen('order-success');
  } catch(e) {
    showToast('Order failed. Please try again.', 'error');
    console.error('Order error:', e);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
  }
}

// ── Map ────────────────────────────────────────────────────────────────────────
function initMap() {
  const container = document.getElementById('mapContainer');
  if (!container) return;
  if (!window.google?.maps) { showToast('Google Maps not loaded. Add your API key.', 'error'); return; }

  container.innerHTML = '<div id="map" style="width:100%;height:220px;border-radius:10px"></div>';
  const center = { lat: 11.1085, lng: 77.3411 }; // Tiruppur
  STATE.map = new google.maps.Map(document.getElementById('map'), {
    center, zoom: 14,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
  });
  STATE.marker = new google.maps.Marker({ position: center, map: STATE.map, draggable: true, title: 'Drag to your location' });
  STATE.deliveryLat = center.lat;
  STATE.deliveryLng = center.lng;
  STATE.map.addListener('click', e => setMapLocation(e.latLng));
  STATE.marker.addListener('dragend', e => setMapLocation(e.latLng));
}

function setMapLocation(latLng) {
  STATE.deliveryLat = latLng.lat();
  STATE.deliveryLng = latLng.lng();
  STATE.marker?.setPosition(latLng);
  const coordEl = document.getElementById('locCoords');
  if (coordEl) coordEl.textContent = `📍 ${STATE.deliveryLat.toFixed(5)}, ${STATE.deliveryLng.toFixed(5)}`;
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function startCountdown() {
  const target = new Date();
  target.setHours(23, 59, 59, 0);
  function update() {
    const now  = new Date();
    const diff = Math.max(0, target - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2,'0');
    const hEl = document.getElementById('cdHours');
    const mEl = document.getElementById('cdMins');
    const sEl = document.getElementById('cdSecs');
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
  }
  update();
  setInterval(update, 1000);
}

// ── Discount Popup ─────────────────────────────────────────────────────────────
async function showDiscountPopup() {
  if (sessionStorage.getItem('popupShown')) return;
  try {
    if (window.FM) {
      const snap = await FM.db.collection('config').doc('discountPopup').get();
      if (snap.exists) {
        const d = snap.data();
        if (!d.active) return;
        const titleEl = document.getElementById('popupTitle');
        const descEl  = document.getElementById('popupDesc');
        const codeEl  = document.getElementById('popupCode');
        const emojiEl = document.getElementById('popupEmoji');
        if (titleEl) titleEl.textContent = d.title || 'Welcome!';
        if (descEl)  descEl.textContent  = d.description || '';
        if (codeEl)  codeEl.textContent  = d.code || '';
        if (emojiEl && d.photoUrl) {
          emojiEl.innerHTML = `<img src="${d.photoUrl}" class="popup-banner-img" alt="Offer">`;
        }
      }
    }
  } catch(e) {}
  const popup = document.getElementById('discountPopup');
  if (popup) popup.classList.add('show');
  sessionStorage.setItem('popupShown', '1');
}

function closePopup() {
  const popup = document.getElementById('discountPopup');
  if (popup) popup.classList.remove('show');
}

function usePopupCoupon() {
  const code = document.getElementById('popupCode')?.textContent || '';
  closePopup();
  openCart();
  const input = document.getElementById('couponInput');
  if (input && code) {
    input.value = code;
    applyCoupon();
  }
}

function copyPopupCode() {
  const code = document.getElementById('popupCode')?.textContent || '';
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => showToast(`Code "${code}" copied! 📋`, 'success')).catch(() => {});
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
function toggleWishlist(productId) {
  const idx = STATE.wishlist.indexOf(productId);
  if (idx > -1) {
    STATE.wishlist.splice(idx, 1);
    showToast('Removed from wishlist.', 'info');
  } else {
    STATE.wishlist.push(productId);
    showToast('Added to wishlist! ❤️', 'success');
  }
  saveWishlist();
  renderProducts();
  // Update modal wishlist btn if open
  const modalBtn = document.getElementById('modalWishlistBtn');
  if (modalBtn) modalBtn.textContent = STATE.wishlist.includes(productId) ? '❤️' : '🤍';
  // Update wishlist dot
  const dot = document.getElementById('wishlistDot');
  if (dot) dot.classList.toggle('has', STATE.wishlist.length > 0);
}

function saveWishlist() {
  try { localStorage.setItem('sna_wishlist', JSON.stringify(STATE.wishlist)); } catch(e) {}
  if (STATE.currentUser && window.FM) {
    FM.db.collection('users').doc(STATE.currentUser.uid).update({ wishlist: STATE.wishlist }).catch(() => {});
  }
}

async function loadWishlist(uid) {
  try {
    const local = localStorage.getItem('sna_wishlist');
    if (local) STATE.wishlist = JSON.parse(local).filter(Boolean);
    if (uid && window.FM) {
      const snap = await FM.db.collection('users').doc(uid).get();
      if (snap.exists && snap.data().wishlist) {
        STATE.wishlist = snap.data().wishlist;
        localStorage.setItem('sna_wishlist', JSON.stringify(STATE.wishlist));
      }
    }
  } catch(e) { STATE.wishlist = []; }
  const dot = document.getElementById('wishlistDot');
  if (dot) dot.classList.toggle('has', STATE.wishlist.length > 0);
}

function renderWishlistScreen() {
  const grid  = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  if (!grid) return;
  const items = STATE.products.filter(p => STATE.wishlist.includes(p.id));
  if (items.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
  } else {
    if (empty) empty.style.display = 'none';
    grid.innerHTML = items.map(p => renderProductCard(p)).join('');
  }
}

// ── My Orders ─────────────────────────────────────────────────────────────────
async function loadUserOrders(uid) {
  const listEl = document.getElementById('ordersList');
  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">Loading orders…</div>';

  const userId = uid || STATE.currentUser?.uid;
  if (!userId || !window.FM) {
    listEl.innerHTML = `<div class="orders-empty">
      <div class="orders-empty-icon">📦</div>
      <p style="font-weight:600;font-size:16px;color:var(--text-muted)">Sign in to view your orders</p>
      <button onclick="openAuth('login')" style="margin-top:16px;height:42px;padding:0 22px;background:var(--primary);color:#fff;border-radius:9px;font-size:14px;font-weight:700">Sign In</button>
    </div>`;
    return;
  }

  try {
    const snap = await FM.db.collection('orders').where('uid','==',userId).limit(50).get();
    if (snap.empty) {
      listEl.innerHTML = `<div class="orders-empty">
        <div class="orders-empty-icon">📦</div>
        <p style="font-weight:600;font-size:16px;color:var(--text-muted)">No orders yet</p>
        <p style="font-size:13px;color:var(--text-faint);margin-top:6px">Your orders will appear here once you shop</p>
        <button onclick="showScreen('home')" style="margin-top:16px;height:42px;padding:0 22px;background:var(--primary);color:#fff;border-radius:9px;font-size:14px;font-weight:700">Start Shopping →</button>
      </div>`;
      return;
    }
    const sortedDocs = snap.docs.slice().sort((a, b) => {
      const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
      const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    listEl.innerHTML = sortedDocs.map(doc => {
      const o = doc.data();
      const id = doc.id;
      const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
      const itemsPreview = (o.items || []).map(i => `${i.emoji || ''} ${i.name} ×${i.qty}`).join(' · ');
      const chipClass = `order-status-chip status-${o.status || 'pending'}`;
      return `
        <div class="order-card">
          <div class="order-card-top">
            <div>
              <div class="order-id-label">Order ID</div>
              <div class="order-id-val">#${escHtml(id.slice(-10).toUpperCase())}</div>
            </div>
            <span class="${chipClass}">${statusLabel(o.status)}</span>
          </div>
          <div class="order-card-body">
            <div class="order-items-preview">${escHtml(itemsPreview)}</div>
            <div class="order-card-footer">
              <div>
                <div class="order-total">₹${o.total || 0}</div>
                <div class="order-meta">${date} · ${o.paymentMethod === 'upi' ? 'UPI' : 'COD'}</div>
              </div>
              <div class="order-card-actions">
                <button class="btn-reorder" onclick="reorder('${id}')">🔁 Reorder</button>
                <button class="btn-view-bill" onclick="viewBill('${id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  View Bill
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red)">Error loading orders. Please try again.</div>';
  }
}

async function reorder(orderId) {
  if (!window.FM) return;
  try {
    const snap = await FM.db.collection('orders').doc(orderId).get();
    if (!snap.exists) return;
    const items = snap.data().items || [];
    items.forEach(item => {
      const product = STATE.products.find(p => p.id === item.id);
      if (product) addToCart(product, item.qty, item.price, item.displayQty || '');
    });
    showToast('Items added to cart! 🛒', 'success');
    openCart();
  } catch(e) { showToast('Could not reorder. Try again.', 'error'); }
}

function statusLabel(s) {
  return { pending:'⏳ Pending', packed:'📦 Packed', dispatched:'🛵 On the Way', delivered:'✅ Delivered', cancelled:'❌ Cancelled' }[s] || s;
}

// ── Bill ──────────────────────────────────────────────────────────────────────
async function viewBill(orderId) {
  if (!window.FM) return;
  try {
    const snap = await FM.db.collection('orders').doc(orderId).get();
    if (!snap.exists) { showToast('Order not found.', 'error'); return; }
    const o = snap.data();
    const w = window.open('', '_blank', 'width=560,height=800');
    if (!w) { showToast('Pop-up blocked. Allow pop-ups to view bill.', 'error'); return; }
    w.document.write(generateBillHTML(orderId, o));
    w.document.close();
  } catch(e) { showToast('Could not load bill.', 'error'); }
}

function generateBillHTML(id, o) {
  const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('en-IN') : new Date().toLocaleString();
  const rows  = (o.items || []).map(i =>
    `<tr><td>${escHtml(i.emoji || '')} ${escHtml(i.name)}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Invoice #${id.slice(-10).toUpperCase()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;padding:32px;max-width:540px;margin:0 auto;color:#111;background:#fff}
    .header{background:#0D1F35;color:#fff;padding:24px 28px;border-radius:14px;margin-bottom:22px;position:relative;overflow:hidden}
    .header::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(200,146,42,.3),transparent)}
    .shop-name{font-family:'Playfair Display',serif;font-size:24px;color:#E5AA45;margin-bottom:2px}
    .shop-ta{font-size:12px;color:rgba(255,255,255,.6);margin-bottom:10px}
    .invoice-num{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:7px;padding:7px 12px;display:inline-block;font-size:13px;font-weight:700;font-family:monospace;letter-spacing:1px}
    .section{background:#F7F8FA;border-radius:10px;padding:16px 18px;margin-bottom:16px}
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px}
    .row{display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px}
    .row span:first-child{color:#6B7280}
    table{width:100%;border-collapse:collapse;margin:0}
    th{background:#F1F3F6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6B7280;padding:9px 12px;text-align:left;border-bottom:1px solid #E5E7EB}
    td{padding:10px 12px;border-bottom:1px solid #E5E7EB;font-size:13px}
    tr:last-child td{border-bottom:none}
    .total-section{background:#0D1F35;color:#fff;padding:16px 18px;border-radius:10px;margin-top:14px}
    .total-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;color:rgba(255,255,255,.7)}
    .grand-total{display:flex;justify-content:space-between;font-size:20px;font-weight:800;color:#fff;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.2)}
    .grand-total span:last-child{color:#E5AA45}
    .footer-note{text-align:center;font-size:12px;color:#9CA3AF;margin-top:20px;padding-top:14px;border-top:1px solid #E5E7EB}
    .print-btn{display:block;width:100%;margin-top:18px;padding:13px;background:#0D1F35;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif}
    .print-btn:hover{background:#224166}
    @media print{.print-btn{display:none}}
  </style></head><body>
  <div class="header">
    <div class="shop-name">S.N.A Raja Maligai</div>
    <div class="shop-ta">எஸ்.என்.ஏ ராஜா மளிகை · Tiruppur &amp; Coimbatore</div>
    <div class="invoice-num">INVOICE #${id.slice(-10).toUpperCase()}</div>
  </div>
  <div class="section">
    <div class="section-title">Order Details</div>
    <div class="row"><span>Date &amp; Time</span><span>${date}</span></div>
    <div class="row"><span>Customer</span><span>${escHtml(o.customerName || '—')}</span></div>
    <div class="row"><span>Phone</span><span>${escHtml(o.phone || '—')}</span></div>
    <div class="row"><span>Address</span><span style="max-width:220px;text-align:right">${escHtml(o.address || '—')}, ${escHtml(o.city || '')}</span></div>
    <div class="row"><span>Payment</span><span>${o.paymentMethod === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}</span></div>
    ${o.couponCode ? `<div class="row"><span>Coupon</span><span style="color:#1A6B40;font-weight:700">${escHtml(o.couponCode)}</span></div>` : ''}
  </div>
  <div class="section">
    <div class="section-title">Items Ordered</div>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
  </div>
  <div class="total-section">
    <div class="total-row"><span>Subtotal</span><span>₹${o.subtotal || 0}</span></div>
    <div class="total-row"><span>Delivery</span><span>${o.delivery === 0 ? '🆓 Free' : '₹' + o.delivery}</span></div>
    ${(o.discount || 0) > 0 ? `<div class="total-row"><span>Discount</span><span style="color:#22A05A">-₹${o.discount}</span></div>` : ''}
    <div class="grand-total"><span>Total Paid</span><span>₹${o.total}</span></div>
  </div>
  <div class="footer-note">Thank you for shopping with S.N.A Raja Maligai! 🙏<br>+91 98765 43210 · hello@snarajamaligai.in · 6 AM – 10 PM IST</div>
  <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
  </body></html>`;
}

// ── Profile ────────────────────────────────────────────────────────────────────
async function loadProfileForm() {
  if (!STATE.currentUser) { showScreen('home'); openAuth('login'); return; }

  const user = STATE.currentUser;
  const name = FM.sanitizeStr(user.displayName || '', 100);

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };

  setEl('profileEmail', user.email || '');
  setTxt('profileNameDisplay', name);
  setTxt('profileEmailDisplay', user.email || '');

  // Avatar
  const avatarLg = document.getElementById('profileAvatarLg');
  if (avatarLg) {
    if (user.photoURL) avatarLg.innerHTML = `<img src="${user.photoURL}" alt="Avatar">`;
    else avatarLg.textContent = name.charAt(0).toUpperCase();
  }

  try {
    const snap = await FM.db.collection('users').doc(user.uid).get();
    if (snap.exists) {
      const d = snap.data();
      setEl('profileName',    d.name || name);
      setEl('profilePhone',   d.phone || '');
      setEl('profileAddress', d.address || '');
      const cityEl = document.getElementById('profileCity');
      if (cityEl && d.city) cityEl.value = d.city;

      const roleEl = document.getElementById('profileRoleDisplay');
      if (roleEl) {
        const roleLabels = { admin: 'Admin', shopkeeper: 'Shopkeeper', customer: 'Customer' };
        const roleClass  = { admin: 'role-admin', shopkeeper: 'role-shopkeeper', customer: 'role-customer' };
        roleEl.textContent = roleLabels[d.role] || 'Customer';
        roleEl.className   = `ud-role ${roleClass[d.role] || 'role-customer'}`;
      }
    }
  } catch(e) {}
}

async function saveProfile() {
  if (!STATE.currentUser) return;
  const getVal = id => FM.sanitizeStr(document.getElementById(id)?.value?.trim() || '', 200);
  const name    = getVal('profileName');
  const phone   = getVal('profilePhone');
  const address = getVal('profileAddress');
  const city    = document.getElementById('profileCity')?.value || '';

  if (phone && !/^\d{10}$/.test(phone)) { showToast('Enter a valid 10-digit phone number.', 'error'); return; }

  try {
    await FM.db.collection('users').doc(STATE.currentUser.uid).update({
      name, phone, address, city,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (name) await STATE.currentUser.updateProfile({ displayName: name });
    showToast('Profile saved! ✅', 'success');
  } catch(e) { showToast('Error saving profile.', 'error'); }
}

// ── Notifications ──────────────────────────────────────────────────────────────
function loadNotifications(uid) {
  if (!uid || !window.FM) return;
  FM.db.collection('notifications').where('uid','==',uid).orderBy('createdAt','desc').limit(25)
    .onSnapshot(snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const unread = notifs.filter(n => !n.read).length;
      const dot    = document.getElementById('notifDot');
      if (dot) dot.classList.toggle('has', unread > 0);
      const markAll = document.getElementById('notifMarkAll');
      if (markAll) markAll.style.display = unread > 0 ? 'block' : 'none';
      const listEl = document.getElementById('notifList');
      if (!listEl) return;
      if (notifs.length === 0) {
        listEl.innerHTML = `<div style="padding:50px 20px;text-align:center;color:var(--text-muted);font-size:14px"><div style="font-size:40px;margin-bottom:12px">🔔</div>No notifications yet.</div>`;
        return;
      }
      listEl.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
          <div class="notif-icon">${n.icon || '📢'}</div>
          <div class="notif-content">
            <div class="notif-title">${escHtml(n.title || '')}</div>
            <div class="notif-desc">${escHtml(n.desc || '')}</div>
            <div class="notif-time">${n.time || ''}</div>
          </div>
        </div>`).join('');
    }, () => {});
}

async function markNotifRead(id) {
  try { await FM.db.collection('notifications').doc(id).update({ read: true }); } catch(e) {}
}

async function markAllNotifRead() {
  if (!STATE.currentUser || !window.FM) return;
  try {
    const snap = await FM.db.collection('notifications').where('uid','==',STATE.currentUser.uid).where('read','==',false).get();
    const batch = FM.db.batch();
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
    showToast('All notifications marked as read.', 'info');
  } catch(e) {}
}

document.getElementById('notifBtn')?.addEventListener('click', () => {
  document.getElementById('notifDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeNotif() {
  document.getElementById('notifDrawer')?.classList.remove('open');
  if (!document.getElementById('cartDrawer')?.classList.contains('open')) {
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function closeAllDrawers() {
  closeCart();
  closeNotif();
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${escHtml(msg)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3800);
}

// ── Escape HTML (XSS protection) ───────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
