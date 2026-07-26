/* =============================================
   utils.js – shared helpers used by all pages
   ============================================= */

const API = 'http://localhost:3000/api';

/* ── Auth helpers ── */
const getToken    = ()  => localStorage.getItem('ep_token');
const getUser     = ()  => { try { return JSON.parse(localStorage.getItem('ep_user')); } catch { return null; } };
const isLoggedIn  = ()  => !!getToken();

function logout() {
  localStorage.removeItem('ep_token');
  localStorage.removeItem('ep_user');
  window.location.href = 'login.html';
}

/* ── Fetch wrapper ── */
async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
  const res  = await fetch(`${API}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Toast ── */
function showToast(msg, type = 'success') {
  let box = document.getElementById('toast-container');
  if (!box) { box = document.createElement('div'); box.id = 'toast-container'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── Format helpers ── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const ampm = +h >= 12 ? 'PM' : 'AM';
  return `${+h % 12 || 12}:${m} ${ampm}`;
}
function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* ── Navbar auth state ── */
function initNavbar() {
  const user       = getUser();
  const loginBtn   = document.getElementById('navLoginBtn');
  const registerBtn= document.getElementById('navRegisterBtn');
  const dashBtn    = document.getElementById('navDashBtn');
  const logoutBtn  = document.getElementById('navLogoutBtn');
  const userName   = document.getElementById('navUserName');

  if (user) {
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (dashBtn)     dashBtn.style.display     = 'inline-flex';
    if (logoutBtn)   logoutBtn.style.display   = 'inline-flex';
    if (userName)  { userName.style.display    = 'inline-flex'; userName.textContent = '👤 ' + user.name.split(' ')[0]; }
  }
}

/* ── Hamburger menu ── */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

/* ── Navbar scroll effect ── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Random event gradient ── */
const gradients = [
  'linear-gradient(135deg,#1a0838,#2d1b69)',
  'linear-gradient(135deg,#0f2027,#203a43)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#0d0d1a,#1a0f3a)',
];
function randomGradient() { return gradients[Math.floor(Math.random() * gradients.length)]; }

/* ── Scroll-reveal ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animate-fadeInUp'); io.unobserve(e.target); } });
}, { threshold: 0.1 });
function revealOnScroll(selector) {
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', initNavbar);
