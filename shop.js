/**
 * Rakit — Toko Tech & Audio
 * shop.js: logika katalog, keranjang, dan checkout (simulasi demo).
 * Semua data disimpan di browser saja, tidak ada pengiriman data ke server.
 */

(function () {
  'use strict';

  // ---------- Data produk ----------
  const productImageUrl = (seed, width = 900) => `https://picsum.photos/seed/${seed}/${width}/700`;

  const products = [
    { id: 'p1', name: 'Headphone Studio', category: 'audio', price: 1_250_000, image: productImageUrl('headphone-studio', 900), desc: 'Nyeri telinga minimized, suara jernih untuk mixing dan editing.' },
    { id: 'p2', name: 'Speaker Bluetooth', category: 'audio', price: 750_000, image: productImageUrl('speaker-bluetooth', 900), desc: 'Portabel, bass kuat, cocok untuk ruangan kecil atau outdoor.' },
    { id: 'p3', name: 'Earphone TWS', category: 'audio', price: 450_000, image: productImageUrl('earphone-tws', 900), desc: 'Nirkabel dengan fitur noise cancellation untuk konsentrasi maksimal.' },
    { id: 'p4', name: 'Mikrofon Kondensator', category: 'audio', price: 990_000, image: productImageUrl('mikrofon-kondensator', 900), desc: 'Cocok untuk podcast, streaming, dan rekaman vokal di rumah.' },
    { id: 'p5', name: 'Laptop Ringan', category: 'computer', price: 12_500_000, image: productImageUrl('laptop-ringan', 900), desc: 'Ringan dan cepat untuk pekerjaan sehari-hari serta kuliah.' },
    { id: 'p6', name: 'Monitor 27 Inch', category: 'computer', price: 3_200_000, image: productImageUrl('monitor-27-inch', 900), desc: 'Layar lebar dengan warna akurat untuk desain dan coding.' },
    { id: 'p7', name: 'Keyboard Mekanik', category: 'computer', price: 1_100_000, image: productImageUrl('keyboard-mekanik', 900), desc: 'Responsif dengan switch merah, nyaman untuk mengetik lama.' },
    { id: 'p8', name: 'Mouse Ergonomis', category: 'computer', price: 350_000, image: productImageUrl('mouse-ergonomis', 900), desc: 'Desain ergonomis yang menopang pergelangan tangan saat bekerja.' },
    { id: 'p9', name: 'Kabel USB-C', category: 'accessory', price: 120_000, image: productImageUrl('usb-c-cable', 900), desc: 'Data transfer cepat dan daya stabil untuk perangkat modern.' },
    { id: 'p10', name: 'Stand Laptop', category: 'accessory', price: 280_000, image: productImageUrl('stand-laptop', 900), desc: 'Tinggikan layar agar posisi duduk lebih ergonomis.' },
    { id: 'p11', name: 'Webcam HD', category: 'accessory', price: 650_000, image: productImageUrl('webcam-hd', 900), desc: 'Gambar jernah untuk rapat online dan streaming.' },
    { id: 'p12', name: 'Case Pelindung', category: 'accessory', price: 180_000, image: productImageUrl('case-pelindung', 900), desc: 'Pelindung perangkat dari goresan dan benturan ringan.' },
  ];

  // ---------- State ----------
  let cart = []; // { id, qty }
  let activeCategory = 'all';

  // ---------- Elemen DOM ----------
  const els = {
    productGrid: document.getElementById('productGrid'),
    productCount: document.getElementById('productCount'),
    filters: document.getElementById('filters'),
    openCart: document.getElementById('openCart'),
    closeCart: document.getElementById('closeCart'),
    cartBackdrop: document.getElementById('cartBackdrop'),
    cartDrawer: document.getElementById('cartDrawer'),
    emptyCart: document.getElementById('emptyCart'),
    cartItems: document.getElementById('cartItems'),
    cartItemSummary: document.getElementById('cartItemSummary'),
    cartTotal: document.getElementById('cartTotal'),
    cartBadge: document.getElementById('cartBadge'),
    checkoutButton: document.getElementById('checkoutButton'),
    continueShopping: document.getElementById('continueShopping'),
    checkoutModal: document.getElementById('checkoutModal'),
    closeCheckout: document.getElementById('closeCheckout'),
    checkoutSummary: document.getElementById('checkoutSummary'),
    checkoutForm: document.getElementById('checkoutForm'),
    payButton: document.getElementById('payButton'),
    orderSuccess: document.getElementById('orderSuccess'),
    successTitle: document.getElementById('successTitle'),
    orderReference: document.getElementById('orderReference'),
    orderAmount: document.getElementById('orderAmount'),
    orderMethod: document.getElementById('orderMethod'),
    finishCheckout: document.getElementById('finishCheckout'),
    toast: document.getElementById('toast'),
  };

  // ---------- Utilitas ----------
  const fallbackImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#f5f5f4"/>
      <rect x="50" y="50" width="700" height="500" rx="24" fill="#e7e5e4"/>
      <circle cx="400" cy="245" r="95" fill="#d6d3d1"/>
      <path d="M287 440c20-76 88-118 113-118s92 42 113 118" fill="#d6d3d1"/>
      <path d="M285 250l60 50 60-60 90 100H250z" fill="#cbd5e1" opacity="0.7"/>
      <text x="400" y="520" text-anchor="middle" font-size="44" font-family="Arial, sans-serif" fill="#57534e">No Image</text>
    </svg>
  `)}`;

  const applyImageFallback = (img, src = fallbackImage) => {
    img.onerror = () => {
      if (img.src !== src) {
        img.onerror = null;
        img.src = src;
      }
    };
    return img;
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const showToast = (message) => {
    if (!els.toast) return;

    els.toast.textContent = message;
    els.toast.classList.remove('opacity-0', 'translate-y-3');
    els.toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
      els.toast.classList.remove('opacity-100', 'translate-y-0');
      els.toast.classList.add('opacity-0', 'translate-y-3');
    }, 2500);
  };

  const toggleCartDrawer = (open) => {
    if (!els.cartBackdrop || !els.cartDrawer || !els.openCart) return;

    if (open) {
      els.cartBackdrop.hidden = false;
      els.cartDrawer.hidden = false;
      requestAnimationFrame(() => {
        els.cartBackdrop.classList.remove('opacity-0');
        els.cartDrawer.classList.remove('translate-x-full');
      });
      els.openCart.setAttribute('aria-expanded', 'true');
      els.cartDrawer.setAttribute('aria-hidden', 'false');
    } else {
      els.cartBackdrop.classList.add('opacity-0');
      els.cartDrawer.classList.add('translate-x-full');
      setTimeout(() => {
        els.cartBackdrop.hidden = true;
        els.cartDrawer.hidden = true;
      }, 300);
      els.openCart.setAttribute('aria-expanded', 'false');
      els.cartDrawer.setAttribute('aria-hidden', 'true');
    }
  };
  const cartItemIndex = (id) => cart.findIndex((item) => item.id === id);


  // ---------- Katalog ----------
  const renderProducts = () => {
    const filtered =
      activeCategory === 'all'
        ? products
        : products.filter((product) => product.category === activeCategory);

    els.productGrid.innerHTML = filtered
      .map(
        (product) => `
      <article class="image-fallback rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm" data-fallback="Gambar tidak tersedia">
        <img src="${product.image || fallbackImage}" alt="${product.name}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="m-0 text-base font-bold text-stone-900">${product.name}</h3>
          <p class="m-0 mt-1 text-sm text-emerald-700 font-semibold">${formatRupiah(product.price)}</p>
          <p class="m-0 mt-2 text-xs text-stone-500 line-clamp-2">${product.desc}</p>
          <button data-id="${product.id}" class="mt-3 w-full rounded-md bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800" type="button">
            Tambah ke keranjang
          </button>
        </div>
      </article>
    `
      )
      .join('');

    els.productGrid.querySelectorAll('img').forEach((img) => applyImageFallback(img));
    els.productCount.textContent = `${filtered.length} produk`;

    els.productGrid.querySelectorAll('button[data-id]').forEach((button) => {
      button.addEventListener('click', (event) => {
        const id = event.currentTarget.dataset.id;
        addToCart(id);
      });
    });
  };

  const updateFilterUI = () => {
    els.filters.querySelectorAll('button').forEach((button) => {
      const isActive = button.dataset.category === activeCategory;
      button.setAttribute('aria-pressed', String(isActive));
      if (isActive) {
        button.classList.remove('border-stone-300', 'bg-white', 'text-stone-600', 'hover:border-stone-500');
        button.classList.add('border-stone-900', 'bg-stone-900', 'text-white');
      } else {
        button.classList.remove('border-stone-900', 'bg-stone-900', 'text-white');
        button.classList.add('border-stone-300', 'bg-white', 'text-stone-600', 'hover:border-stone-500');
      }
    });
  };

  // ---------- Keranjang ----------
  const addToCart = (id) => {
    const existing = cartItemIndex(id);
    if (existing >= 0) {
      cart[existing].qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    renderCart();
    showToast('Produk ditambahkan ke keranjang');
    toggleCartDrawer(true);
  };

  const changeQty = (id, delta) => {
    const index = cartItemIndex(id);
    if (index < 0) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
  };

  const cartSubtotal = () =>
    cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + product.price * item.qty;
    }, 0);

  const cartTotalQty = () => cart.reduce((sum, item) => sum + item.qty, 0);

  const renderCart = () => {
    const totalQty = cartTotalQty();
    const summaryText = `${totalQty} barang`;

    els.cartBadge.textContent = String(totalQty);
    els.cartBadge.classList.toggle('hidden', totalQty === 0);
    if (els.cartItemSummary) els.cartItemSummary.textContent = summaryText;
    if (els.openCart) els.openCart.setAttribute('aria-label', `Buka keranjang, ${summaryText}`);

    els.checkoutButton.disabled = totalQty === 0;

    if (cart.length === 0) {
      els.emptyCart.hidden = false;
      els.cartItems.hidden = true;
      els.cartTotal.textContent = formatRupiah(0);
      return;
    }

    els.emptyCart.hidden = true;
    els.cartItems.hidden = false;
    els.cartItems.innerHTML = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        const lineTotal = product.price * item.qty;
        return `
        <li class="flex gap-3 py-3">
          <img src="${product.image || fallbackImage}" alt="${product.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0">
          <div class="flex-1 min-w-0">
            <p class="m-0 text-sm font-semibold text-stone-900 truncate">${product.name}</p>
            <p class="m-0 text-xs text-stone-500">${formatRupiah(product.price)}</p>
            <div class="mt-2 flex items-center gap-2">
              <button data-id="${item.id}" data-delta="-1" class="w-6 h-6 rounded-md border border-stone-300 bg-white text-stone-900 text-xs font-bold" type="button" aria-label="Kurangi ${product.name}">−</button>
              <span class="w-5 text-center text-xs font-medium text-stone-900">${item.qty}</span>
              <button data-id="${item.id}" data-delta="1" class="w-6 h-6 rounded-md border border-stone-300 bg-white text-stone-900 text-xs font-bold" type="button" aria-label="Tambah ${product.name}">+</button>
            </div>
          </div>
          <div class="text-right">
            <p class="m-0 text-sm font-semibold text-stone-900">${formatRupiah(lineTotal)}</p>
            <button data-id="${item.id}" class="mt-1 text-xs text-stone-400 hover:text-stone-900 underline underline-offset-4" type="button" aria-label="Hapus ${product.name}">Hapus</button>
          </div>
        </li>
      `;
      })
      .join('');

    els.cartItems.querySelectorAll('img').forEach((img) => applyImageFallback(img));
    els.cartTotal.textContent = formatRupiah(cartSubtotal());

    els.cartItems.querySelectorAll('button[data-delta]').forEach((button) => {
      button.addEventListener('click', () => changeQty(button.dataset.id, Number(button.dataset.delta)));
    });
    els.cartItems.querySelectorAll('button[data-id]:not([data-delta])').forEach((button) => {
      button.addEventListener('click', () => {
        changeQty(button.dataset.id, -cart[cartItemIndex(button.dataset.id)].qty);
        showToast('Produk dihapus dari keranjang');
      });
    });
  };

  // ---------- Checkout ----------
  const openCheckout = () => {
    const summary = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        return `${product.name} (${item.qty})`;
      })
      .join(', ');
    els.checkoutSummary.textContent = summary;
    els.orderSuccess.hidden = true;
    els.checkoutForm.reset();
    els.checkoutModal.hidden = false;
    els.checkoutForm.elements.customerName.focus();
  };

  const closeCheckoutModal = () => {
    els.checkoutModal.hidden = true;
  };

  const handleCheckoutSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(els.checkoutForm);
    const method = formData.get('paymentMethod');
    const amount = cartSubtotal();
    const reference = 'RAKIT-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    els.payButton.disabled = true;
    els.payButton.textContent = 'Memproses...';

    setTimeout(() => {
      els.payButton.disabled = false;
      els.payButton.textContent = 'Bayar';

      els.checkoutModal.hidden = true;
      els.orderSuccess.hidden = false;
      els.successTitle.textContent = 'Pesanan demo dibuat';
      els.orderReference.textContent = reference;
      els.orderAmount.textContent = formatRupiah(amount);
      els.orderMethod.textContent = method;

      cart = [];
      renderCart();
      toggleCartDrawer(false);

      showToast('Pesanan berhasil dibuat (demo)');
    }, 1200);
  };

  const finishCheckout = () => {
    els.orderSuccess.hidden = true;
    els.checkoutModal.hidden = true;
  };

  // ---------- Inisialisasi ----------
  const init = () => {
    if (init.initialized) return;
    init.initialized = true;

    if (els.filters) {
      els.filters.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-category]');
        if (!button) return;
        activeCategory = button.dataset.category;
        updateFilterUI();
        renderProducts();
      });
    }

    if (els.openCart) els.openCart.addEventListener('click', () => toggleCartDrawer(true));
    if (els.closeCart) els.closeCart.addEventListener('click', () => toggleCartDrawer(false));
    if (els.cartBackdrop) els.cartBackdrop.addEventListener('click', () => toggleCartDrawer(false));
    if (els.continueShopping) els.continueShopping.addEventListener('click', () => toggleCartDrawer(false));

    if (els.checkoutButton) els.checkoutButton.addEventListener('click', openCheckout);
    if (els.closeCheckout) els.closeCheckout.addEventListener('click', closeCheckoutModal);
    if (els.checkoutForm) els.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    if (els.finishCheckout) els.finishCheckout.addEventListener('click', finishCheckout);

    if (els.checkoutModal) {
      els.checkoutModal.addEventListener('click', (event) => {
        if (event.target === els.checkoutModal) closeCheckoutModal();
      });
    }

    renderProducts();
    renderCart();
    updateFilterUI();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
