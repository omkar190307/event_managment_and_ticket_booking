/* =============================================
   auth.js – Handles register.html logic
   (login.html has its own inline script)
   ============================================= */

/* ── Toggle password visibility ── */
function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
}

/* ── Register form handler ── */
async function handleRegister(e) {
  e.preventDefault();

  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const terms    = document.getElementById('agreeTerms').checked;
  const userType = document.querySelector('input[name="userType"]:checked')?.value || 'user';

  /* ── Validation ── */
  if (name.length < 2) {
    showToast('Name must be at least 2 characters.', 'error'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Enter a valid email address.', 'error'); return;
  }
  if (password.length < 8) {
    showToast('Password must be at least 8 characters.', 'error'); return;
  }
  if (password !== confirm) {
    showToast('Passwords do not match.', 'error'); return;
  }
  if (!terms) {
    showToast('You must agree to the Terms of Service.', 'error'); return;
  }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    const res  = await fetch(`${API}/users/register`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ name, email, password, user_type: userType })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Registration failed.', 'error');
      return;
    }

    /* Save token + user to localStorage */
    localStorage.setItem('ep_token', data.token);
    localStorage.setItem('ep_user',  JSON.stringify(data.user));

    showToast(`🎉 Welcome, ${data.user.name}! Redirecting…`, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);

  } catch {
    showToast('Server is unreachable. Is the backend running?', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account 🎉';
  }
}

/* ── Auto-redirect if already logged in ── */
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    showToast('👋 Already signed in. Redirecting…', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
  }
});
