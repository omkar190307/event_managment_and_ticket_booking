/* =============================================
   main.js – Home page logic
   ============================================= */

const CATEGORIES = {
  Technology: '💻', Business: '📈', Workshop: '🔧',
  Leadership: '🏆', Music: '🎵', Health: '💚', General: '✨'
};

/* ── Animated counters ── */
function animateCounter(id, target, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.innerHTML = current + '<span>' + suffix + '</span>';
    if (current >= target) clearInterval(timer);
  }, 25);
}

/* ── Particle background ── */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation-delay:${Math.random() * 4}s;
      animation-duration:${3 + Math.random() * 4}s;
    `;
    container.appendChild(p);
  }
}

/* ── Category icon ── */
function getCatIcon(cat) { return CATEGORIES[cat] || '🎯'; }

/* ── Render event card ── */
function renderEventCard(ev) {
  const minPrice = ev.min_price ? formatCurrency(ev.min_price) : '₹499';
  const dateStr  = ev.Date ? formatDate(ev.Date) : '—';
  return `
    <a href="event-detail.html?id=${ev.Event_ID}" class="event-card">
      <div class="event-card-img" style="background:${randomGradient()}">
        ${ev.Image_URL ? `<img src="${ev.Image_URL}" alt="${ev.Name}" loading="lazy"/>` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">${getCatIcon(ev.Category)}</div>`}
        <div class="event-card-category">${getCatIcon(ev.Category)} ${ev.Category || 'General'}</div>
        <div class="event-card-date-badge">${dateStr}</div>
      </div>
      <div class="event-card-body">
        <div class="event-card-title">${ev.Name}</div>
        <div class="event-card-meta">
          <div class="event-meta-item"><span class="icon">⏰</span>${ev.Time ? formatTime(ev.Time) : '—'}</div>
          <div class="event-meta-item"><span class="icon">📍</span>${ev.Location || ev.City || '—'}</div>
          ${ev.Speaker_Name ? `<div class="event-meta-item"><span class="icon">🎤</span>${ev.Speaker_Name}</div>` : ''}
        </div>
        <div class="event-card-footer">
          <div class="event-price">${minPrice}<br><small>onwards</small></div>
          <span class="btn btn-primary btn-sm">Book Now</span>
        </div>
      </div>
    </a>`;
}

/* ── Load featured events ── */
async function loadFeaturedEvents() {
  const container = document.getElementById('featuredEvents');
  if (!container) return;
  try {
    const events = await apiFetch('/events');
    const featured = events.slice(0, 3);
    if (!featured.length) { container.innerHTML = '<p style="color:var(--text-300);text-align:center;padding:40px">No events yet.</p>'; return; }
    container.innerHTML = featured.map(renderEventCard).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-300);text-align:center;padding:40px">Could not load events. Start the backend server.</p>';
  }
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadFeaturedEvents();
  animateCounter('statEvents',  500, '+');
  animateCounter('statUsers',    50, 'K+');
  animateCounter('statCities',   25, '+');
  animateCounter('statSpeakers',100, '+');
  revealOnScroll('.step-card, .category-card');
});
