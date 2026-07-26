/* =============================================
   event-detail.js – Event Detail page
   ============================================= */

let currentEvent   = null;
let selectedTicket = null;
let quantity       = 1;

/* ── Load event ── */
async function loadEvent() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { showNotFound(); return; }

  try {
    currentEvent = await apiFetch(`/events/${id}`);
    renderEvent();
    loadTickets(id);
  } catch {
    showNotFound();
  }
}

function showNotFound() {
  document.getElementById('eventLoading').style.display  = 'none';
  document.getElementById('eventNotFound').style.display = 'block';
}

/* ── Render event ── */
function renderEvent() {
  const ev = currentEvent;
  document.title = `${ev.Name} – EventPro`;

  // Hero
  const img = document.getElementById('detailHeroImg');
  if (ev.Image_URL) img.src = ev.Image_URL;
  else { img.style.display='none'; document.querySelector('.event-detail-hero').style.background = 'linear-gradient(135deg,#1a0838,#2d1b69)'; }

  document.getElementById('detailCategory').textContent  = ev.Category || 'General';
  document.getElementById('detailTitle').textContent     = ev.Name;
  document.getElementById('detailDate').textContent      = formatDate(ev.Date);
  document.getElementById('detailTime').textContent      = formatTime(ev.Time);
  document.getElementById('detailLocation').textContent  = ev.Location || '—';
  document.getElementById('detailVenueName').textContent = ev.Venue_Name || '—';

  const statusMap = { upcoming:'badge-primary', ongoing:'badge-success', completed:'badge-warning', cancelled:'badge-danger' };
  document.getElementById('detailStatus').innerHTML = `<span class="badge ${statusMap[ev.Status] || 'badge-info'}">${ev.Status}</span>`;

  // Description
  document.getElementById('detailDescription').textContent = ev.Description || 'No description available.';

  // Speaker
  const spCard = document.getElementById('speakerCard');
  if (ev.Speaker_Name) {
    spCard.innerHTML = `
      <div class="speaker-avatar">${ev.Speaker_Name.charAt(0)}</div>
      <div class="speaker-info">
        <h3>${ev.Speaker_Name}</h3>
        <p>${ev.Speaker_Bio || 'Speaker information not available.'}</p>
      </div>`;
  } else {
    spCard.innerHTML = '<p style="color:var(--text-300)">No speaker assigned.</p>';
  }

  // Venue
  const vGrid = document.getElementById('venueInfoGrid');
  vGrid.innerHTML = `
    <div class="venue-info-item"><label>Venue</label><span>${ev.Venue_Name || '—'}</span></div>
    <div class="venue-info-item"><label>City</label><span>${ev.City || '—'}</span></div>
    <div class="venue-info-item"><label>Address</label><span>${ev.Address || '—'}</span></div>
    <div class="venue-info-item"><label>State</label><span>${ev.State || '—'}</span></div>
    <div class="venue-info-item"><label>Zipcode</label><span>${ev.Zipcode || '—'}</span></div>
    <div class="venue-info-item"><label>Capacity</label><span>${ev.Capacity ? ev.Capacity.toLocaleString('en-IN') : '—'}</span></div>`;

  document.getElementById('eventLoading').style.display      = 'none';
  document.getElementById('eventDetailContent').style.display = 'block';
}

/* ── Load tickets ── */
async function loadTickets(eventId) {
  const sel = document.getElementById('ticketSelector');
  try {
    const tickets = await apiFetch(`/tickets/available/${eventId}`);
    // Group by type
    const groups = {};
    tickets.forEach(t => {
      if (!groups[t.Type]) groups[t.Type] = { price: t.Price, ids: [] };
      groups[t.Type].ids.push(t.Ticket_ID);
    });

    if (!Object.keys(groups).length) {
      sel.innerHTML = '<p style="color:var(--text-300);font-size:0.875rem;">No tickets available.</p>';
      return;
    }

    const getTicketIcon = (type) => {
      if (type === 'VIP') return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle;"><polygon points="2 4 6 16 12 8 18 16 22 4 22 20 2 20 2 4"></polygon></svg>`;
      if (type === 'Student') return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`;
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle;"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M7 6v12M17 6v12"></path><path d="M12 6v12" stroke-dasharray="2 2"></path></svg>`;
    };

    sel.innerHTML = Object.entries(groups).map(([type, info]) => `
      <div class="ticket-type" onclick="selectTicket('${type}', ${info.price}, ${info.ids[0]})" id="tt-${type}">
        <div class="ticket-type-info">
          <h4 style="display:flex; align-items:center;">${getTicketIcon(type)} ${type}</h4>
          <p>${info.ids.length} available</p>
        </div>
        <div class="ticket-price">${formatCurrency(info.price)}</div>
      </div>`).join('');

    // Auto-select first
    const first = Object.entries(groups)[0];
    selectTicket(first[0], first[1].price, first[1].ids[0]);
  } catch {
    sel.innerHTML = '<p style="color:var(--text-300);font-size:0.875rem;">Could not load tickets.</p>';
  }
}

function selectTicket(type, price, id) {
  selectedTicket = { type, price, id };
  document.querySelectorAll('.ticket-type').forEach(el => el.classList.remove('selected'));
  document.getElementById(`tt-${type}`)?.classList.add('selected');
  updatePrice();
}

function changeQty(delta) {
  quantity = Math.max(1, Math.min(10, quantity + delta));
  document.getElementById('qtyVal').textContent = quantity;
  updatePrice();
}

function updatePrice() {
  if (!selectedTicket) return;
  const sub  = selectedTicket.price * quantity;
  const fee  = Math.round(sub * 0.02);
  const total = sub + fee;
  document.getElementById('pbTicketPrice').textContent = formatCurrency(selectedTicket.price);
  document.getElementById('pbQty').textContent         = `×${quantity}`;
  document.getElementById('pbSubtotal').textContent    = formatCurrency(sub);
  document.getElementById('pbFee').textContent         = formatCurrency(fee);
  document.getElementById('pbTotal').innerHTML         = `<strong>${formatCurrency(total)}</strong>`;
}

function proceedToBook() {
  if (!isLoggedIn()) { showToast('Please login to book tickets', 'error'); setTimeout(() => location.href='login.html', 1200); return; }
  if (!selectedTicket) { showToast('Please select a ticket type', 'error'); return; }
  const params = new URLSearchParams({ eventId: currentEvent.Event_ID, ticketId: selectedTicket.id, type: selectedTicket.type, price: selectedTicket.price, qty: quantity });
  location.href = `checkout.html?${params}`;
}

function switchTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', loadEvent);
