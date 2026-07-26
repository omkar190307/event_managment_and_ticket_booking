/* =============================================
   events.js – Events listing page
   ============================================= */

let allEvents    = [];
let activeCategory = 'all';
let currentView  = 'grid';

const CATEGORY_ICONS = {
  Technology: '💻', Business: '📈', Workshop: '🔧',
  Leadership: '🏆', Music: '🎵', Health: '💚', General: '✨'
};

function getCatIcon(c) { return CATEGORY_ICONS[c] || '🎯'; }

/* ── Load all events from API ── */
async function loadEvents() {
  const container = document.getElementById('eventsList');
  try {
    allEvents = await apiFetch('/events');
    filterEvents();
  } catch {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
        <div style="font-size:3rem;margin-bottom:16px;">⚠️</div>
        <h3>Backend not running</h3>
        <p style="color:var(--text-300);margin-top:8px;">Start the Node.js server to load events.</p>
      </div>`;
  }
}

/* ── Filter & Sort ── */
function filterEvents() {
  const query  = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const sort   = document.getElementById('sortSelect')?.value || 'date_asc';

  let filtered = allEvents.filter(ev => {
    const matchCat  = activeCategory === 'all' || ev.Category === activeCategory;
    const matchSearch = !query ||
      ev.Name.toLowerCase().includes(query) ||
      (ev.Location || '').toLowerCase().includes(query) ||
      (ev.Speaker_Name || '').toLowerCase().includes(query) ||
      (ev.Venue_Name || '').toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'date_asc')   return new Date(a.Date) - new Date(b.Date);
    if (sort === 'date_desc')  return new Date(b.Date) - new Date(a.Date);
    if (sort === 'price_asc')  return (a.min_price||0) - (b.min_price||0);
    if (sort === 'price_desc') return (b.min_price||0) - (a.min_price||0);
    return 0;
  });

  renderEvents(filtered);
}

/* ── Render ── */
function renderEvents(list) {
  const container = document.getElementById('eventsList');
  const noEvents  = document.getElementById('noEvents');
  const count     = document.getElementById('eventsShownCount');

  if (count) count.textContent = list.length;

  if (!list.length) {
    container.innerHTML = '';
    if (noEvents) noEvents.style.display = 'block';
    return;
  }
  if (noEvents) noEvents.style.display = 'none';

  container.className = `events-list${currentView === 'list' ? ' list-view' : ''}`;
  container.innerHTML = list.map(ev => {
    const minP  = ev.min_price ? formatCurrency(ev.min_price) : '₹299';
    const date  = ev.Date ? formatDate(ev.Date) : '—';
    return `
      <a href="event-detail.html?id=${ev.Event_ID}" class="event-card">
        <div class="event-card-img" style="background:linear-gradient(135deg,#1a0838,#2d1b69)">
          ${ev.Image_URL
            ? `<img src="${ev.Image_URL}" alt="${ev.Name}" loading="lazy"/>`
            : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3.5rem;">${getCatIcon(ev.Category)}</div>`}
          <div class="event-card-category">${getCatIcon(ev.Category)} ${ev.Category || 'General'}</div>
          <div class="event-card-date-badge">${date}</div>
        </div>
        <div class="event-card-body">
          <div class="event-card-title">${ev.Name}</div>
          <div class="event-card-meta">
            <div class="event-meta-item"><span class="icon">⏰</span>${ev.Time ? formatTime(ev.Time) : '—'}</div>
            <div class="event-meta-item"><span class="icon">📍</span>${ev.Location || ev.City || '—'}</div>
            <div class="event-meta-item"><span class="icon">🏛️</span>${ev.Venue_Name || '—'}</div>
            ${ev.Speaker_Name ? `<div class="event-meta-item"><span class="icon">🎤</span>${ev.Speaker_Name}</div>` : ''}
          </div>
          <div class="event-card-footer">
            <div class="event-price">${minP}<br><small>onwards</small></div>
            <span class="btn btn-primary btn-sm">Book Now</span>
          </div>
        </div>
      </a>`;
  }).join('');
}

/* ── Category chip ── */
function setCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterEvents();
}

/* ── View toggle ── */
function setView(v) {
  currentView = v;
  document.getElementById('gridBtn').classList.toggle('active', v === 'grid');
  document.getElementById('listBtn').classList.toggle('active', v === 'list');
  filterEvents();
}

/* ── URL param category ── */
document.addEventListener('DOMContentLoaded', () => {
  const cat = new URLSearchParams(location.search).get('category');
  if (cat) {
    activeCategory = cat;
    document.querySelectorAll('.chip').forEach(c => {
      if (c.textContent.trim().includes(cat)) c.classList.add('active');
      else c.classList.remove('active');
    });
  }
  loadEvents();
});
