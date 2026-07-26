/* =============================================
   dashboard.js – User / Admin Dashboard
   ============================================= */

const user = getUser();

/* ── Guard: redirect if not logged in ── */
if (!user) { window.location.href = 'login.html'; }

/* ── Tab switching ── */
function showSection(id) {
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.style.display = 'block';
  const link = document.querySelector(`[data-section="${id}"]`);
  if (link) link.classList.add('active');
}

/* ── Load profile ── */
function renderProfile() {
  const el = document.getElementById('profileInfo');
  if (!el || !user) return;
  el.innerHTML = `
    <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:20px;padding:28px;">
      <div style="display:flex;align-items:center;gap:16px;">
        <div class="speaker-avatar" style="width:72px;height:72px;font-size:1.8rem;">${user.name.charAt(0)}</div>
        <div>
          <h2 style="font-size:1.3rem;font-weight:700;">${user.name}</h2>
          <p style="color:var(--text-300);font-size:0.875rem;">${user.email}</p>
          ${user.mobile ? `<p style="color:var(--text-400);font-size:0.8rem;">📱 ${user.mobile}</p>` : ''}
          <span class="badge ${user.user_type==='admin'?'badge-warning':'badge-primary'}" style="margin-top:6px;">${user.user_type==='admin'?'👑 Organizer':'🙋 Attendee'}</span>
        </div>
      </div>
    </div>`;
}

/* ── Load user orders ── */
async function loadOrders() {
  const el = document.getElementById('ordersList');
  if (!el) return;
  try {
    const orders = await apiFetch(`/orders/user/${user.id}`);

    if (!Array.isArray(orders) || !orders.length) {
      el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-300);">
        <div style="font-size:3rem;margin-bottom:12px;">🎟️</div>
        <h3>No orders yet</h3>
        <p>Book your first event!</p>
        <a href="events.html" class="btn btn-primary" style="margin-top:16px;">Browse Events</a>
      </div>`;
      return;
    }

    el.innerHTML = orders.map(o => {
      const statusColor = o.Status === 'confirmed' ? '#10b981'
                        : o.Status === 'cancelled'  ? '#ef4444'
                        : '#f59e0b';
      const statusBg   = o.Status === 'confirmed' ? 'rgba(16,185,129,0.12)'
                        : o.Status === 'cancelled'  ? 'rgba(239,68,68,0.12)'
                        : 'rgba(245,158,11,0.12)';
      const catIcon = { Technology:'💻', Business:'📈', Workshop:'🔧',
                        Leadership:'🏆', Music:'🎵', Health:'💚',
                        Education:'📚', General:'✨' }[o.Event_Category] || '🎯';

      return `
      <div class="order-item" style="flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden;">

        <!-- Top: event image strip + name -->
        <div style="display:flex;align-items:center;gap:16px;padding:18px 20px;border-bottom:1px solid var(--glass-border);">
          <div style="width:54px;height:54px;border-radius:12px;background:linear-gradient(135deg,rgba(108,61,229,0.3),rgba(139,92,246,0.15));
                      display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;">
            ${catIcon}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:1rem;color:var(--text-100);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${o.Event_Name || 'Event Tickets'}
            </div>
            <div style="font-size:0.75rem;color:var(--text-400);margin-top:3px;">
              ${o.Event_Category ? `${catIcon} ${o.Event_Category}` : ''} 
              ${o.Event_Location ? `&nbsp;·&nbsp; 📍 ${o.Event_Location}` : ''}
            </div>
          </div>
          <span style="padding:5px 14px;border-radius:50px;font-size:0.72rem;font-weight:700;
                       background:${statusBg};color:${statusColor};border:1px solid ${statusColor};
                       flex-shrink:0;text-transform:uppercase;letter-spacing:0.5px;">
            ${o.Status}
          </span>
        </div>

        <!-- Bottom: detail grid -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;">

          <div style="padding:14px 18px;border-right:1px solid var(--glass-border);">
            <div style="font-size:0.68rem;color:var(--text-400);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">
              🎫 Tickets Booked
            </div>
            <div style="font-weight:700;font-size:1rem;color:var(--text-100);">
              ${o.Ticket_Count || 1}
            </div>
            <div style="font-size:0.72rem;color:var(--text-400);margin-top:2px;">
              ${o.Ticket_Types || 'General'}
            </div>
          </div>

          <div style="padding:14px 18px;border-right:1px solid var(--glass-border);">
            <div style="font-size:0.68rem;color:var(--text-400);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">
              💺 Seat(s)
            </div>
            <div style="font-weight:700;font-size:0.9rem;color:var(--text-100);">
              ${o.Seat_Numbers || '—'}
            </div>
          </div>

          <div style="padding:14px 18px;border-right:1px solid var(--glass-border);">
            <div style="font-size:0.68rem;color:var(--text-400);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">
              📅 Booked On
            </div>
            <div style="font-weight:700;font-size:0.9rem;color:var(--text-100);">
              ${formatDate(o.Date)}
            </div>
            <div style="font-size:0.72rem;color:var(--text-400);margin-top:2px;">
              Order #${o.Order_ID}
            </div>
          </div>

          <div style="padding:14px 18px;">
            <div style="font-size:0.68rem;color:var(--text-400);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">
              💰 Amount Paid
            </div>
            <div style="font-weight:800;font-size:1.1rem;color:var(--accent-light);">
              ${formatCurrency(o.Total_Price)}
            </div>
          </div>

        </div>
      </div>`;
    }).join('');

  } catch(err) {
    el.innerHTML = `<div style="text-align:center;padding:40px 20px;">
      <div style="font-size:2rem;margin-bottom:10px;">⚠️</div>
      <p style="color:var(--text-300);">Could not load your orders. Please make sure the backend is running.</p>
    </div>`;
  }
}


/* ── Admin: load all users ── */
async function loadAllUsers() {
  const el = document.getElementById('adminUsersList');
  if (!el) return;
  try {
    const users = await apiFetch('/users');
    document.getElementById('totalUsers').textContent = users.length;
    el.innerHTML = `
      <div class="table-container">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Type</th><th>Joined</th></tr></thead>
          <tbody>${users.map(u => `
            <tr>
              <td>${u.User_ID}</td>
              <td>${u.Name}</td>
              <td>${u.Email}</td>
              <td>${u.Mobile || '—'}</td>
              <td><span class="badge ${u.User_type==='admin'?'badge-warning':'badge-primary'}">${u.User_type}</span></td>
              <td>${formatDate(u.Created_At)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch {
    el.innerHTML = '<p style="color:var(--text-300);padding:20px;">Could not load users.</p>';
  }
}

/* ── Admin: load all events ── */
async function loadAdminEvents() {
  const el = document.getElementById('adminEventsList');
  if (!el) return;
  try {
    const events = await apiFetch('/events');
    document.getElementById('totalEvents').textContent = events.length;
    el.innerHTML = `
      <div class="table-container">
        <table>
          <thead><tr><th>#</th><th>Event</th><th>Category</th><th>Date</th><th>Venue</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${events.map(ev => `
            <tr>
              <td>${ev.Event_ID}</td>
              <td><strong>${ev.Name}</strong></td>
              <td>${ev.Category}</td>
              <td>${formatDate(ev.Date)}</td>
              <td>${ev.Venue_Name || '—'}</td>
              <td><span class="badge badge-primary">${ev.Status}</span></td>
              <td><a href="event-detail.html?id=${ev.Event_ID}" class="btn btn-outline btn-sm">View</a></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch {
    el.innerHTML = '<p style="color:var(--text-300);padding:20px;">Could not load events.</p>';
  }
}

/* ── Admin: load all orders ── */
async function loadAdminOrders() {
  const el = document.getElementById('adminOrdersList');
  if (!el) return;
  try {
    const orders = await apiFetch('/orders');
    document.getElementById('totalOrders').textContent = orders.length;
    const revenue = orders.reduce((s, o) => s + parseFloat(o.Total_Price || 0), 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(revenue);
    el.innerHTML = `
      <div class="table-container">
        <table>
          <thead><tr><th>#</th><th>User</th><th>Email</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${orders.map(o => `
            <tr>
              <td>${o.Order_ID}</td>
              <td>${o.User_Name}</td>
              <td>${o.Email}</td>
              <td><strong>${formatCurrency(o.Total_Price)}</strong></td>
              <td><span class="badge ${o.Status==='confirmed'?'badge-success':'badge-warning'}">${o.Status}</span></td>
              <td>${formatDate(o.Date)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch {
    el.innerHTML = '<p style="color:var(--text-300);padding:20px;">Could not load orders.</p>';
  }
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  // Set greeting
  const greet = document.getElementById('dashGreeting');
  if (greet) greet.textContent = `Hello, ${user.name.split(' ')[0]} 👋`;
  const role = document.getElementById('dashRole');
  if (role) role.textContent = user.user_type === 'admin' ? '👑 Organizer Dashboard' : '🙋 My Dashboard';

  renderProfile();
  loadOrders();

  const tab = new URLSearchParams(location.search).get('tab') || 'myOrders';
  showSection(tab);

  if (user.user_type === 'admin') {
    loadAllUsers();
    loadAdminEvents();
    loadAdminOrders();
    document.getElementById('adminNav')?.classList.remove('hidden');
  }
});
