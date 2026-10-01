/**
 * FrontEnd Store - Interactive E-Commerce & Cart Controller (2026)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  initCategoryFilters();
  initProductSearch();
  initSizeSelector();
  initMobileMenu();
  initScrollHeader();
});

/* --------------------------------------------------------------------------
   Sticky Header Effect
-------------------------------------------------------------------------- */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* --------------------------------------------------------------------------
   Mobile Menu
-------------------------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-btn');
  const nav = document.querySelector('.nav-links');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
    }
  });
}

/* --------------------------------------------------------------------------
   Interactive Shopping Cart (State & Drawer)
-------------------------------------------------------------------------- */
let cart = [];

function initCart() {
  const triggerBtn = document.getElementById('cart-trigger-btn');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('cart-close-btn');
  const checkoutBtn = document.getElementById('btn-checkout');

  if (triggerBtn && overlay) {
    triggerBtn.addEventListener('click', openCart);
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeCart);
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCart();
    });
  }

  // Quick Add buttons on cards
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const price = parseFloat(btn.dataset.price || '25');
      const img = btn.dataset.img;
      addToCart({ id, title, price, img, size: 'M', qty: 1 });
      showToast(`⚡ ¡${title} (Talla M) añadida al carrito!`);
    });
  });

  // Product detail buy now button
  const buyNowBtn = document.getElementById('btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = buyNowBtn.dataset.title;
      const price = parseFloat(buyNowBtn.dataset.price || '25');
      const img = buyNowBtn.dataset.img;
      const activeSize = document.querySelector('.size-chip.active')?.dataset.size || 'M';
      const qty = parseInt(document.getElementById('product-qty')?.value || '1', 10);

      addToCart({ id: title.toLowerCase(), title, price, img, size: activeSize, qty });
      showToast(`🛒 ¡${title} (Talla ${activeSize} × ${qty}) añadida al carrito!`);
      openCart();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('⚠️ Tu carrito está vacío. Agrega una camiseta primero.');
        return;
      }
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      cart = [];
      updateCartUI();
      closeCart();
      showToast(`🎉 ¡Pedido simulado de $${total}.00 USD confirmado con éxito!`);
    });
  }
}

function openCart() {
  const overlay = document.getElementById('cart-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id && i.size === item.size);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById('cart-count-badge');
  const list = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal-val');

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) badge.textContent = totalCount;

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 3.5rem; margin-bottom: 1rem;">📦</p>
        <h4 style="font-size: 1.8rem; color: var(--text-dark); margin-bottom: 0.5rem;">Tu carrito está vacío</h4>
        <p style="font-size: 1.4rem;">Explora nuestra colección y viste con el orgullo de programar.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }

  let html = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    html += `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.title}" />
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div style="font-size: 1.25rem; color: var(--text-muted); font-family: var(--font-code);">Talla: ${item.size} • Cant: ${item.qty}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Eliminar">&times;</button>
      </div>
    `;
  });

  list.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// Make accessible to inline onclick
window.removeFromCart = removeFromCart;

/* --------------------------------------------------------------------------
   Category Filter Tabs
-------------------------------------------------------------------------- */
function initCategoryFilters() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.producto');

  if (tabs.length === 0 || cards.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.category;

      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Realtime Product Search
-------------------------------------------------------------------------- */
function initProductSearch() {
  const input = document.getElementById('search-input');
  const cards = document.querySelectorAll('.producto');

  if (!input || cards.length === 0) return;

  input.addEventListener('input', () => {
    const term = input.value.toLowerCase().trim();
    cards.forEach(card => {
      const name = card.querySelector('.producto__nombre')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.producto__desc')?.textContent.toLowerCase() || '';
      if (name.includes(term) || desc.includes(term)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Size Selector Chips
-------------------------------------------------------------------------- */
function initSizeSelector() {
  const chips = document.querySelectorAll('.size-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   Toast Utility
-------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
