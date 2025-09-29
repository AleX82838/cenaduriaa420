/* script.js - versión final unificada
   Carrito editable, búsqueda, filtros, draggable cart, reloj fijo con saludo,
   particles.js separado, QR, WhatsApp, ubicación, persistencia.
*/

/* ---------- Datos (productos y combos) ---------- */
const PRODUCTS = [
  { id: 'torta',  name: 'Torta Especial', price: 50, img: 'torta.png', cate: 'torta' },
  { id: 'tlayuda',name: 'Tlayuda',         price: 70, img: 'tlayuda.png', cate: 'tlayuda' },
  { id: 'tostada',name: 'Tostada',         price: 30, img: 'tostada.png', cate: 'tostada' }
];

const COMBOS = [
  { id:'combo1', title:'Combo Tlayuda + Tostada', items:[{id:'tlayuda',q:1},{id:'tostada',q:1}], discount:10 },
  { id:'combo2', title:'Combo Torta + Tostada',  items:[{id:'torta',q:1},{id:'tostada',q:1}], discount:8 }
];

/* ---------- Estado (localStorage) ---------- */
let state = {
  cart: JSON.parse(localStorage.getItem('cart')) || [],
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  history: JSON.parse(localStorage.getItem('history')) || [],
  reviews: JSON.parse(localStorage.getItem('reviews')) || [],
  theme: localStorage.getItem('theme') || 'neon',
  ubicacion: localStorage.getItem('ubicacion') || ''
};

/* ---------- util ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function saveAll(){ localStorage.setItem('cart', JSON.stringify(state.cart)); localStorage.setItem('favorites', JSON.stringify(state.favorites)); localStorage.setItem('history', JSON.stringify(state.history)); localStorage.setItem('reviews', JSON.stringify(state.reviews)); localStorage.setItem('theme', state.theme); if(state.ubicacion) localStorage.setItem('ubicacion', state.ubicacion); }

/* ---------- Reloj + saludo ---------- */
function actualizarRelojYSaludo(){
  const el = $('#clock');
  const greet = $('#greeting');
  const now = new Date();
  el.textContent = now.toLocaleTimeString();
  const h = now.getHours();
  let saludo = 'Bienvenido';
  if(h >= 5 && h < 12) saludo = 'Buenos días ☀️';
  else if(h >= 12 && h < 19) saludo = 'Buenas tardes 🌤️';
  else saludo = 'Buenas noches 🌙';
  // ETA hint sample
  const eta = Math.max(10, 15 + (state.cart.reduce((s,i)=>s + (i.qty||0), 0) - 1) * 4);
  greet.textContent = `${saludo} — tu pedido aprox. ${eta} min`;
}

/* ---------- THEME ---------- */
function applyTheme(t){ document.body.dataset.theme = t; $('#theme-select').value = t; state.theme = t; saveAll(); }
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme(state.theme || 'neon');
});

/* ---------- Render menú y combos ---------- */
function renderMenu(filter = ''){
  const cont = $('#menu-list'); cont.innerHTML = '';
  PRODUCTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())).forEach(p=>{
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" class="product-img" data-id="${p.id}">
      <h3>${p.name}</h3>
      <p>$${p.price} MXN</p>
      <div class="card-actions">
        <input type="number" min="1" value="1" id="qty-${p.id}" class="qty-input" />
        <button class="btn add-btn" data-id="${p.id}">➕ Agregar</button>
        <button class="fav" data-id="${p.id}">${state.favorites.includes(p.id)?'💖':'🤍'}</button>
      </div>
    `;
    cont.appendChild(card);
  });
}

function renderCombos(){
  const cont = $('#combos-list'); cont.innerHTML = '';
  COMBOS.forEach(c=>{
    const el = document.createElement('div'); el.className = 'card';
    el.innerHTML = `
      <h3>${c.title} 🔥</h3>
      <p>${c.items.map(i=> PRODUCTS.find(p=>p.id===i.id).name + ' x'+i.q).join(', ')}</p>
      <p>Descuento ${c.discount}%</p>
      <div class="card-actions"><button class="btn add-combo" data-id="${c.id}">Agregar Combo 🧩</button></div>
    `;
    cont.appendChild(el);
  });
}

/* ---------- Favoritos / reviews / history ---------- */
function renderFavorites(){ const ul = $('#favorites-list'); ul.innerHTML=''; state.favorites.forEach(id=>{ const p=PRODUCTS.find(x=>x.id===id); if(p){ const li = document.createElement('li'); li.textContent = `⭐ ${p.name}`; ul.appendChild(li); }}); }
function renderReviews(){ const ul = $('#reviews-list'); ul.innerHTML=''; state.reviews.forEach(r=>{ const li=document.createElement('li'); li.textContent = `${r.name} (${r.date}): ${r.text}`; ul.appendChild(li); }); }
function renderHistory(){ const ul = $('#history-list'); ul.innerHTML=''; state.history.forEach(h=>{ const li=document.createElement('li'); li.textContent = `${h.date} — ${h.items.map(i=>i.name + ' x'+i.qty).join(', ')} ($${h.total.toFixed(2)})`; ul.appendChild(li); }); }

/* ---------- Carrito ---------- */
function updateCartCount(){
  const c = state.cart.reduce((s,i)=> s + (i.qty||0), 0);
  $('#cart-count').textContent = c;
  $('#cart-floating').style.boxShadow = c>0 ? '0 8px 26px rgba(0,255,106,0.15)' : 'none';
}

function findCartItem(id){ return state.cart.find(it=>it.id === id); }

function addToCart(id, qty = 1, note = ''){
  const prod = PRODUCTS.find(p=>p.id === id);
  if(!prod) return;
  const existing = findCartItem(id);
  if(existing) existing.qty += qty;
  else state.cart.push({ id, name: prod.name, price: prod.price, qty, note });
  saveAll(); renderCart(); updateCartCount(); showPopup(`✅ ${qty} x ${prod.name} agregado`);
  notify('Producto agregado', `${qty} x ${prod.name}`);
  animateFlyToCart(id);
}

function addComboById(cid){
  const combo = COMBOS.find(c=>c.id === cid); if(!combo) return;
  combo.items.forEach(it => addToCart(it.id, it.q));
  const subtotal = combo.items.reduce((s,it)=> s + PRODUCTS.find(p=>p.id===it.id).price * it.q, 0);
  const ahorro = subtotal * (combo.discount / 100);
  if(ahorro > 0) state.cart.push({ id: 'disc_'+cid, name: `Descuento ${combo.discount}%`, price: -ahorro, qty: 1});
  saveAll(); renderCart(); updateCartCount(); showPopup('Combo agregado 🎉');
}

function renderCart(){
  const ul = $('#cart-items'); ul.innerHTML = '';
  let total = 0;
  state.cart.forEach(item => {
    const price = (item.price !== undefined) ? item.price : (PRODUCTS.find(p=>p.id === item.id)?.price || 0);
    const li = document.createElement('li');
    li.dataset.id = item.id;
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong><br/><small>${item.note || ''}</small>
      </div>
      <div class="item-controls">
        <button class="qty-minus mini" data-id="${item.id}">➖</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-plus mini" data-id="${item.id}">➕</button>
        <button class="item-delete mini" data-id="${item.id}">❌</button>
      </div>
    `;
    ul.appendChild(li);
    total += price * (item.qty || 0);
  });
  $('#cart-total').textContent = `Total: $${total.toFixed(2)} MXN`;
  $('#cart-eta').textContent = `⏱ Estimado: ${calculateETA()} min`;
  saveAll();
}

function changeQty(id, delta){
  const it = findCartItem(id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) state.cart = state.cart.filter(x => x.id !== id);
  saveAll(); renderCart(); updateCartCount();
}

function removeFromCart(id){
  state.cart = state.cart.filter(x => x.id !== id);
  saveAll(); renderCart(); updateCartCount(); showPopup('Producto eliminado 🗑️');
}

function emptyCart(){
  if(!confirm('¿Vaciar todo el carrito?')) return;
  state.cart = []; saveAll(); renderCart(); updateCartCount(); showPopup('Carrito vaciado 🧹');
}

function calculateETA(){
  const items = state.cart.reduce((s,i)=> s + (i.qty||0), 0);
  const base = 15;
  const per = 4;
  return Math.max(10, base + per * Math.max(0, items - 1));
}

/* ---------- Checkout & QR ---------- */
function checkout(){
  if(state.cart.length === 0){ alert('Carrito vacío 😅'); return; }
  const note = $('#note').value || '';
  let msg = '¡Hola! Quisiera hacer el siguiente pedido:%0A%0A';
  state.cart.forEach(it => {
    const price = (it.price !== undefined) ? it.price : (PRODUCTS.find(p=>p.id===it.id).price || 0);
    msg += `🍽 ${it.name} x${it.qty} - $${(price * it.qty).toFixed(2)} MXN%0A`;
  });
  const total = state.cart.reduce((s,i)=> s + ((i.price !== undefined ? i.price : PRODUCTS.find(p=>p.id===i.id).price) * i.qty), 0);
  msg += `%0ATotal: $${total.toFixed(2)} MXN%0A`;
  if(note) msg += `%0ANota: ${encodeURIComponent(note)}%0A`;
  if(state.ubicacion) msg += `%0A📍 Mi ubicación: ${encodeURIComponent(state.ubicacion)}%0A`;

  state.history.unshift({ date: new Date().toLocaleString(), items: JSON.parse(JSON.stringify(state.cart)), total });
  if(state.history.length > 40) state.history.pop();
  saveAll(); renderHistory();

  const phone = '5215654595169';
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  showPopup('Pedido enviado a WhatsApp 📲');
}

function generateQR(){
  if(state.cart.length === 0){ showPopup('Carrito vacío 🫣'); return; }
  const payload = { items: state.cart, total: state.cart.reduce((s,i)=> s + ((i.price !== undefined ? i.price : PRODUCTS.find(p=>p.id===i.id).price) * i.qty), 0) };
  const txt = encodeURIComponent(JSON.stringify(payload));
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${txt}`;
  const w = window.open('', '_blank', 'noopener');
  if(w){ w.document.write(`<img src="${src}" alt="QR">`); w.document.title = 'QR de tu pedido'; }
}

/* ---------- Geolocalización ---------- */
function obtainLocation(askUser=true){
  if(!navigator.geolocation){ showPopup('Geolocalización no soportada'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(6), lon = pos.coords.longitude.toFixed(6);
    state.ubicacion = `https://www.google.com/maps?q=${lat},${lon}`;
    saveAll(); showPopup('📍 Ubicación detectada');
  }, (err) => { if(askUser) alert('No se pudo obtener la ubicación 😅'); console.warn(err); }, { timeout: 10000 });
}

/* ---------- Reviews ---------- */
document.addEventListener('submit', (e) => {
  if(e.target && e.target.id === 'review-form'){
    e.preventDefault();
    const name = $('#review-name').value.trim(), text = $('#review-text').value.trim();
    if(!name || !text) return;
    state.reviews.unshift({ name, text, date: new Date().toLocaleString() });
    if(state.reviews.length > 200) state.reviews.pop();
    saveAll(); renderReviews(); $('#review-form').reset(); showPopup('Gracias por tu reseña 💬');
  }
});

/* ---------- Search & filters ---------- */
$('#search').addEventListener('input', e => renderMenu(e.target.value));
function filtrarCategoria(categoria){
  renderMenu();
  if(categoria === 'all') return;
  // hide non-matching cards
  $$('#menu-list .card').forEach(card => {
    const img = card.querySelector('.product-img');
    const id = img?.dataset?.id;
    const p = PRODUCTS.find(x => x.id === id);
    card.style.display = (p && p.cate === categoria) ? 'block' : 'none';
  });
}

/* ---------- Popup / Notifications ---------- */
function showPopup(text, ms = 1500){
  const p = $('#popup');
  p.textContent = text;
  p.style.display = 'block';
  p.classList.add('show');
  setTimeout(()=>{ p.style.display = 'none'; p.classList.remove('show'); }, ms);
}
function requestNotif(){ if("Notification" in window && Notification.permission === 'default') Notification.requestPermission(); }
function notify(title, body=''){ if("Notification" in window && Notification.permission === 'granted'){ try{ new Notification(title, { body }); }catch(e){} } }

/* ---------- Fly to cart anim ---------- */
function animateFlyToCart(productId){
  try{
    const img = document.querySelector(`.product-img[data-id="${productId}"]`);
    const cartFloat = $('#cart-floating');
    if(!img || !cartFloat) return;
    const fly = img.cloneNode(true);
    const r = img.getBoundingClientRect();
    fly.style.position = 'fixed'; fly.style.left = r.left + 'px'; fly.style.top = r.top + 'px';
    fly.style.width = r.width + 'px'; fly.style.height = r.height + 'px'; fly.style.zIndex = 9999;
    fly.style.transition = 'all 700ms cubic-bezier(.2,.8,.2,1)';
    document.body.appendChild(fly);
    const cr = cartFloat.getBoundingClientRect();
    requestAnimationFrame(()=>{ fly.style.left = (cr.left + 10) + 'px'; fly.style.top = (cr.top + 10) + 'px'; fly.style.transform = 'scale(.12)'; fly.style.opacity = '0.3'; });
    setTimeout(()=> fly.remove(), 800);
  }catch(e){ console.warn(e); }
}

/* ---------- Draggable cart ---------- */
(function makeDraggable(){
  const el = $('#cart'); if(!el) return;
  let dragging=false, ox=0, oy=0;
  el.addEventListener('mousedown', e => { dragging=true; ox = e.clientX - el.getBoundingClientRect().left; oy = e.clientY - el.getBoundingClientRect().top; el.style.cursor='grabbing'; });
  document.addEventListener('mousemove', e => { if(!dragging) return; el.style.left = (e.clientX - ox) + 'px'; el.style.top = (e.clientY - oy) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; });
  document.addEventListener('mouseup', ()=> { dragging=false; el.style.cursor='grab'; });
  // touch
  el.addEventListener('touchstart', e => { const t = e.touches[0]; dragging=true; ox = t.clientX - el.getBoundingClientRect().left; oy = t.clientY - el.getBoundingClientRect().top; });
  document.addEventListener('touchmove', e => { if(!dragging) return; const t = e.touches[0]; el.style.left = (t.clientX - ox) + 'px'; el.style.top = (t.clientY - oy) + 'px'; });
  document.addEventListener('touchend', () => dragging=false);
})();

/* ---------- Event delegation ---------- */
document.addEventListener('click', (e) => {
  // add product
  const a = e.target.closest('.add-btn'); if(a){ const id = a.dataset.id; const qtyInput = document.getElementById(`qty-${id}`); const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value)||1) : 1; addToCart(id, qty); return; }
  // add combo
  const ac = e.target.closest('.add-combo'); if(ac){ addComboById(ac.dataset.id); return; }
  // favorite toggle
  const f = e.target.closest('.fav'); if(f){ const id = f.dataset.id; state.favorites.includes(id) ? state.favorites = state.favorites.filter(x=>x!==id) : state.favorites.push(id); saveAll(); renderFavorites(); f.textContent = state.favorites.includes(id) ? '💖' : '🤍'; return; }
  // qty controls
  if(e.target.closest('.qty-plus')) { changeQty(e.target.dataset.id, +1); return; }
  if(e.target.closest('.qty-minus')) { changeQty(e.target.dataset.id, -1); return; }
  if(e.target.closest('.item-delete')) { removeFromCart(e.target.dataset.id); return; }
  // cart controls
  if(e.target.id === 'cart-empty') { emptyCart(); return; }
  if(e.target.id === 'checkout') { checkout(); return; }
  if(e.target.id === 'generate-qr') { generateQR(); return; }
  if(e.target.id === 'btn-locate') { obtainLocation(true); return; }
  if(e.target.id === 'cart-close') { $('#cart').style.display = 'none'; return; }
  if(e.target.id === 'btn-toggle-cart') { $('#cart').style.display = $('#cart').style.display === 'none' ? 'block' : 'none'; return; }
  if(e.target.id === 'cart-floating') { $('#cart').style.display = 'block'; return; }
});

/* ---------- Init on DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCombos();
  renderFavorites();
  renderReviews();
  renderHistory();
  renderCart();
  updateCartCount();
  applyTheme(state.theme || 'neon');
  // Reloj
  actualizarRelojYSaludo();
  setInterval(actualizarRelojYSaludo, 1000);
  // Particles file loads separately
  // Cursor optional
  // Notifications
  requestNotif();

  // Bind small UI controls
  $('#theme-select').addEventListener('change', e => applyTheme(e.target.value));
  $('#cart-empty').addEventListener('click', emptyCart);
  $('#generate-qr').addEventListener('click', generateQR);
  $('#checkout').addEventListener('click', checkout);
  $('#btn-locate').addEventListener('click', () => obtainLocation(true));
  $('#btn-toggle-cart').addEventListener('click', () => { $('#cart').style.display = $('#cart').style.display === 'none' ? 'block' : 'none'; });

  // ensure cart is visible on load (but can be hidden)
  if(!$('#cart').style.left) { $('#cart').style.left = ''; $('#cart').style.top = ''; }
});
