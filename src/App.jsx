import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';
import { PRODUCTS, CATEGORIES, SHOWS } from './data/products';
import { money, buildOrderText } from './utils/format';
import { generateOrderPdf } from './utils/pdf';

const loadJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const keyOf = (id, size) => `${id}__${size}`;
const fromPrice = (p) => Math.min(...p.sizes.map((s) => s.price));

// Category icons for rich visual UI
const CATEGORY_ICONS = {
  All: '✨',
  Shells: '💥',
  'Batteries & Cascades': '🎆',
  Shots: '🌈',
  Specials: '🎇',
};

function Qty({ value, onChange, small }) {
  return (
    <div className={`qty-control ${small ? 'qty-control-sm' : ''}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

function SizePicker({ sizes, value, onChange }) {
  if (sizes.length < 2) {
    return sizes[0]?.size ? (
      <div className="sizes-container">
        <span className="size-tag">{sizes[0].size}</span>
      </div>
    ) : null;
  }
  return (
    <div className="sizes-container">
      <div className="sizes" role="radiogroup" aria-label="Select size">
        {sizes.map((s) => (
          <button
            key={s.size}
            type="button"
            className={`size-pill ${value === s.size ? 'on' : ''}`}
            onClick={() => onChange(s.size)}
          >
            {s.size}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ p, cart, setQty, onVideo, onView }) {
  const [size, setSize] = useState(p.sizes[0].size);
  const currentSizeObj = p.sizes.find((s) => s.size === size) || p.sizes[0];
  const price = currentSizeObj.price;
  const qty = cart[keyOf(p.id, size)] || 0;
  const anySelected = p.sizes.some((s) => cart[keyOf(p.id, s.size)]);

  return (
    <article className={`card ${anySelected ? 'selected' : ''}`}>
      <div className="card-media" onClick={() => onView(p)}>
        <img src={p.image} alt={p.name} loading="lazy" />
        {p.badge && <span className="badge">⭐ {p.badge}</span>}
        {p.video && (
          <button
            type="button"
            className="play-badge"
            aria-label={`Watch video of ${p.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onVideo(p);
            }}
          >
            ▶ Watch Effect
          </button>
        )}
      </div>

      <div className="card-body">
        <span className="cat-label">{p.category}</span>
        <h3>{p.name}</h3>
        <p className="desc">{p.description}</p>

        <SizePicker sizes={p.sizes} value={size} onChange={setSize} />

        <div className="card-foot">
          <strong className="price">{money(price)}</strong>
          {qty ? (
            <Qty value={qty} onChange={(v) => setQty(p.id, size, v)} />
          ) : (
            <button
              id={`add-${p.id}`}
              type="button"
              className="btn-add-item"
              onClick={() => setQty(p.id, size, 1)}
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function DetailModal({ p, onClose, onAdd, onVideo }) {
  const [size, setSize] = useState(p.sizes[0].size);
  const currentSizeObj = p.sizes.find((s) => s.size === size) || p.sizes[0];
  const price = currentSizeObj.price;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          aria-label="Close modal"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="detail-modal-layout">
          <div className="detail-modal-media">
            <img src={p.image} alt={p.name} />
          </div>

          <div className="detail-modal-content">
            <span className="cat-label">{p.category}</span>
            <h3>{p.name}</h3>
            <p>{p.description}</p>

            <SizePicker sizes={p.sizes} value={size} onChange={setSize} />

            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Selected Unit Price:</span>
              <div className="price" style={{ fontSize: '1.6rem', marginTop: '2px' }}>
                {money(price)}
              </div>
            </div>

            <div className="detail-modal-actions">
              {p.video && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onVideo(p)}
                >
                  ▶ Watch Live Burst Video
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onAdd(p.id, size)}
              >
                + Add Item to My Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState(() => loadJSON('slf-cart-v2', {}));
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [cartOpen, setCartOpen] = useState(false);
  const [video, setVideo] = useState(null);
  const [detail, setDetail] = useState(null);
  const [customer, setCustomer] = useState(() =>
    loadJSON('slf-customer', { name: '', phone: '', address: '', note: '' })
  );
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem('slf-cart-v2', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('slf-customer', JSON.stringify(customer)), [customer]);
  useEffect(() => {
    document.body.style.overflow = cartOpen || video || detail ? 'hidden' : '';
  }, [cartOpen, video, detail]);

  const setQty = (id, size, q) =>
    setCart((c) => {
      const n = { ...c };
      const k = keyOf(id, size);
      if (q <= 0) delete n[k];
      else n[k] = Math.min(q, 999);
      return n;
    });

  const items = useMemo(
    () =>
      PRODUCTS.flatMap((p) =>
        p.sizes
          .filter((s) => cart[keyOf(p.id, s.size)])
          .map((s) => ({
            id: p.id,
            category: p.category,
            image: p.image,
            name: p.name,
            size: s.size,
            label: s.size ? `${p.name} (${s.size})` : p.name,
            price: s.price,
            qty: cart[keyOf(p.id, s.size)],
          }))
      ),
    [cart]
  );

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const visible = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        `${p.name} ${p.category} ${p.description || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
    );
    if (sort === 'low') list = [...list].sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === 'high') list = [...list].sort((a, b) => fromPrice(b) - fromPrice(a));
    return list;
  }, [category, query, sort]);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 3500);
  };

  const validate = () => {
    if (!items.length) {
      showToast('⚠️ Please select at least one item from the catalog.');
      return false;
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      showToast('⚠️ Please provide your Name and WhatsApp phone number.');
      return false;
    }
    return true;
  };

  const saveBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const downloadPdf = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const { blob, fileName } = await generateOrderPdf(items, customer, total);
      saveBlob(blob, fileName);
      showToast('✓ PDF Quotation downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const sendWhatsApp = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const text = buildOrderText(items, customer, total);
      const { blob, fileName } = await generateOrderPdf(items, customer, total);
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // Mobile native share (allows sending PDF directly to WhatsApp contact)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: CONFIG.businessName });
        setBusy(false);
        return;
      }

      // Desktop & general browser fallback: download PDF & open wa.me
      saveBlob(blob, fileName);
      const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      showToast('PDF downloaded! Attach it in the opened WhatsApp chat.');
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error(e);
        showToast('Opening WhatsApp chat directly...');
        const text = buildOrderText(items, customer, total);
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
      }
    } finally {
      setBusy(false);
    }
  };

  const field = (k) => ({
    value: customer[k],
    onChange: (e) => setCustomer({ ...customer, [k]: e.target.value }),
  });

  return (
    <>
      {/* Top Luxury Gold Ribbon */}
      <div className="top-ribbon">
        <div className="top-ribbon-content">
          <div className="top-ribbon-left">
            <span>✨</span>
            <span>
              <b>South Lanka Fireworks</b> · Official Factory Catalog & Event Displays
            </span>
          </div>
          <div className="top-ribbon-right">
            <a href="tel:0777135516" className="ribbon-link">
              📞 {CONFIG.mobilePhone}
            </a>
            <a
              href={`https://wa.me/${CONFIG.whatsappNumber}?text=Hello%20South%20Lanka%20Fireworks,%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noreferrer"
              className="ribbon-link"
            >
              💬 WhatsApp Chat
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation */}
      <header className="nav">
        <div className="nav-in">
          <a href="#top" className="brand" aria-label="South Lanka Fireworks home">
            <div className="logo-wrapper">
              <img
                className="logo-img"
                src="/assets/MainLogo.jpg"
                alt="South Lanka Fireworks Logo"
              />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                <b>South Lanka</b> Fireworks
              </span>
              <span className="brand-subtitle">Premium Quality Catalog</span>
            </div>
          </a>

          <div className="nav-actions">
            <a
              href={`https://wa.me/${CONFIG.whatsappNumber}?text=Hello,%20I%20want%20to%20inquire%20about%20fireworks.`}
              target="_blank"
              rel="noreferrer"
              className="nav-wa-link"
            >
              💬 WhatsApp Us
            </a>

            <button
              id="open-cart"
              type="button"
              className="cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label={`View order (${count} items)`}
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-label-text">My Order</span>
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-wrap">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-spark">✨</span>
              <span>Premier Fireworks Manufacturer · Sri Lanka</span>
            </div>

            <h1>
              Light Up Every <span className="grad-text">Celebration</span>
            </h1>

            <p>
              Explore our complete handcrafted collection, watch live aerial burst videos,
              select your items & sizes, and send your order directly via WhatsApp with an
              instant official PDF quotation.
            </p>

            <div className="hero-checklist">
              <div className="checklist-item">
                <span className="checklist-icon">✓</span>
                <span>Factory Direct Prices</span>
              </div>
              <div className="checklist-item">
                <span className="checklist-icon">✓</span>
                <span>Vibrant Colors & Altitude</span>
              </div>
              <div className="checklist-item">
                <span className="checklist-icon">✓</span>
                <span>Instant PDF Quotation</span>
              </div>
              <div className="checklist-item">
                <span className="checklist-icon">✓</span>
                <span>Islandwide Event Support</span>
              </div>
            </div>

            <div className="hero-actions">
              <a href="#catalog" className="btn btn-primary btn-lg">
                Explore Catalog ↓
              </a>
              {count > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => setCartOpen(true)}
                >
                  View Order ({count})
                </button>
              )}
            </div>
          </div>

          <div
            className="hero-media-card"
            onClick={() =>
              setVideo({
                name: 'South Lanka Fireworks Celebration Display',
                video: CONFIG.heroVideo,
                image: '/assets/fireworks-display.jpg',
              })
            }
          >
            {CONFIG.heroVideo ? (
              <video
                src={CONFIG.heroVideo}
                poster="/assets/fireworks-display.jpg"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src="/assets/fireworks-display.jpg"
                alt="Grand fireworks display in night sky"
              />
            )}
            <div className="hero-media-badge">
              <span className="hero-media-badge-dot" />
              <span>Watch Live Effect</span>
            </div>
            <div className="hero-media-overlay">
              <div>
                <div className="hero-media-tag">Grand Shows & Celebrations</div>
                <div className="hero-media-title">Night Spectacle Highlights</div>
              </div>
              <div className="hero-media-play">▶</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main id="catalog" className="wrap">
        <div className="catalog-header">
          <div className="catalog-title-row">
            <h2>Fireworks Catalog</h2>
            <span className="item-count-badge">
              {visible.length} {visible.length === 1 ? 'variety' : 'varieties'} available
            </span>
          </div>
        </div>

        {/* Sticky Filter Toolbar */}
        <div className="toolbar">
          <div className="chips-container">
            <div className="chips" role="tablist">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${category === c ? 'on' : ''}`}
                  onClick={() => setCategory(c)}
                  role="tab"
                  aria-selected={category === c}
                >
                  <span>{CATEGORY_ICONS[c] || '🎇'}</span>
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="controls-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                id="search"
                type="search"
                className="search-input"
                placeholder="Search fireworks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              id="sort"
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              <option value="default">Featured</option>
              <option value="low">Price: Low ↑</option>
              <option value="high">Price: High ↓</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {visible.length ? (
          <div className="grid">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                cart={cart}
                setQty={setQty}
                onVideo={setVideo}
                onView={setDetail}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎆</div>
            <h3>No matching fireworks found</h3>
            <p style={{ marginTop: '6px' }}>Try searching another keyword or select All categories.</p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Why Choose Us Trust Section */}
        <section className="trust-section">
          <div className="trust-header">
            <h2>Why Choose <span className="grad-text">South Lanka Fireworks</span></h2>
            <p>Bringing professional, vibrant, and safe pyrotechnic experiences to every Sri Lankan celebration.</p>
          </div>

          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon-box">🏆</div>
              <h3>Factory Direct Quality</h3>
              <p>Authentic chemical formulations designed for high bursts, vivid chromatic saturation, and long hang-time blooms.</p>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box">💬</div>
              <h3>WhatsApp Ordering</h3>
              <p>Skip complicated checkout forms. Send your itemized list straight to our WhatsApp for quick order confirmation.</p>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box">📄</div>
              <h3>Instant PDF Quotation</h3>
              <p>Download a cleanly formatted, branded quotation with item breakdown, quantities, and pricing for easy event planning.</p>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box">🎇</div>
              <h3>Custom Displays & Events</h3>
              <p>We supply and coordinate weddings, carnivals, grand school displays (e.g. Mahinda College, St. Aloysius) and Port City.</p>
            </div>
          </div>
        </section>

        {/* Recent Displays Portfolio Section */}
        <section className="shows-section" aria-labelledby="shows-heading">
          <div className="shows-section-header">
            <h2 id="shows-heading">
              Our Recent <span className="grad-text">Displays</span>
            </h2>
            <p>Highlights from school carnivals, waterfront launches, and grand ceremonies.</p>
          </div>

          <div className="show-grid">
            {SHOWS.map((s) => (
              <div
                key={s.name}
                className="show-card"
                onClick={() => setVideo({ name: s.name, image: s.image, video: s.video })}
                role="button"
                tabIndex={0}
                aria-label={`Watch video of ${s.name}`}
              >
                <img src={s.image} alt={s.name} loading="lazy" />
                <div className="show-overlay">
                  <span className="show-name">{s.name}</span>
                  <span className="show-play-btn">▶</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Guideline Alert */}
        <div className="safety-banner">
          <span className="safety-icon">⚠️</span>
          <div>
            <strong>Safety & Regulations: </strong>
            {CONFIG.safetyNote} Always maintain a safe spectator distance and follow adult supervision.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <b>{CONFIG.businessName}</b>
          </div>
          <div>{CONFIG.phone} · {CONFIG.address}</div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '6px' }}>
            © {new Date().getFullYear()} {CONFIG.businessName}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating Action Bar (Responsive Mobile & Desktop) */}
      {count > 0 && !cartOpen && (
        <div
          className="floating-bar"
          onClick={() => setCartOpen(true)}
          role="button"
          tabIndex={0}
          aria-label={`View order: ${count} items, Total ${money(total)}`}
        >
          <div className="floating-bar-left">
            <span className="floating-cart-badge">🛒 {count}</span>
            <span className="floating-bar-label">
              {count === 1 ? '1 item selected' : `${count} items selected`}
            </span>
          </div>
          <div className="floating-bar-right">
            <span>{money(total)}</span>
            <span>Review Order →</span>
          </div>
        </div>
      )}

      {/* Order Drawer (Side on Desktop / Bottom Sheet on Mobile) */}
      <div
        className={`drawer-overlay ${cartOpen ? 'show' : ''}`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        className={`drawer ${cartOpen ? 'open' : ''}`}
        aria-hidden={!cartOpen}
        aria-label="Order Cart Drawer"
      >
        <div className="drawer-sheet-handle" />

        <div className="drawer-head">
          <div className="drawer-head-title">
            <h2>My Order</h2>
            {count > 0 && (
              <span className="item-count-badge">{count} items</span>
            )}
          </div>
          <button
            type="button"
            className="btn-close-drawer"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 10px' }}>
              <div className="empty-state-icon">🎆</div>
              <h3>Your order is currently empty</h3>
              <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                Browse our catalog and tap <b>+ Add</b> on any fireworks item to get started.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '18px' }}
                onClick={() => setCartOpen(false)}
              >
                Browse Fireworks
              </button>
            </div>
          ) : (
            <>
              {items.map((i) => (
                <div className="order-line" key={keyOf(i.id, i.size)}>
                  <img className="order-line-img" src={i.image} alt={i.label} />
                  <div className="order-line-details">
                    <span className="order-line-title">{i.label}</span>
                    <span className="order-line-price-unit">{money(i.price)} each</span>
                    <Qty
                      small
                      value={i.qty}
                      onChange={(v) => setQty(i.id, i.size, v)}
                    />
                  </div>
                  <div className="order-line-right">
                    <span className="order-line-total">{money(i.price * i.qty)}</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setQty(i.id, i.size, 0)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="customer-form-section">
                <h3 className="customer-form-title">
                  <span>👤</span> Customer & Delivery Details
                </h3>
                <div className="customer-form">
                  <div className="form-group">
                    <label htmlFor="c-name">Your Full Name *</label>
                    <input
                      id="c-name"
                      className="form-input"
                      placeholder="e.g. Kasun Perera"
                      required
                      {...field('name')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="c-phone">WhatsApp / Phone Number *</label>
                    <input
                      id="c-phone"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 077 123 4567"
                      required
                      {...field('phone')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="c-address">Delivery Address / City</label>
                    <input
                      id="c-address"
                      className="form-input"
                      placeholder="e.g. Galle / Matara / Colombo"
                      {...field('address')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="c-note">Special Instructions (Optional)</label>
                    <textarea
                      id="c-note"
                      className="form-input form-textarea"
                      rows={2}
                      placeholder="e.g. Preferred delivery date or wedding timing"
                      {...field('note')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-total-row">
              <span className="drawer-total-label">Total Amount:</span>
              <span className="drawer-total-amount">
                <b>{money(total)}</b>
              </span>
            </div>

            <div className="drawer-actions">
              <button
                id="send-whatsapp"
                type="button"
                className="btn btn-wa"
                disabled={busy}
                onClick={sendWhatsApp}
              >
                {busy ? 'Preparing Order…' : '💬 Send Order via WhatsApp'}
              </button>

              <button
                id="download-pdf"
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={downloadPdf}
              >
                📄 Download PDF Quotation
              </button>

              <button
                type="button"
                className="link"
                style={{ textAlign: 'center', marginTop: '4px' }}
                onClick={() => {
                  if (confirm('Are you sure you want to clear all items from your order?')) {
                    setCart({});
                  }
                }}
              >
                Clear entire order
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Video Modal Player */}
      {video && (
        <div className="modal-backdrop" onClick={() => setVideo(null)}>
          <div
            className="modal-dialog video-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              aria-label="Close video player"
              onClick={() => setVideo(null)}
            >
              ✕
            </button>
            <video
              className="video-player"
              src={video.video}
              poster={video.image}
              controls
              autoPlay
              playsInline
            />
            <div className="video-modal-title">{video.name}</div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {detail && (
        <DetailModal
          p={detail}
          onClose={() => setDetail(null)}
          onVideo={(p) => {
            setDetail(null);
            setVideo(p);
          }}
          onAdd={(id, size) => {
            setQty(id, size, (cart[keyOf(id, size)] || 0) + 1);
            setDetail(null);
            showToast('✓ Added item to your order');
          }}
        />
      )}

      {/* Toast Notice */}
      {toast && <div className="toast-notice">{toast}</div>}
    </>
  );
}
