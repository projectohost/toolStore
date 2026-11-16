
/* selected-product.js — запам’ятовує товар, який користувач вибрав у каталозі.
 * Підключається на index.html і product.html ПЕРЕД script.js
 */
(function () {
  'use strict';
 
  var STORAGE_KEY = 'electrotool_selected_product';
 
  var isProductPage = !!document.getElementById('product-sku');
  var selectedSection = document.getElementById('selected-product');
 
  /* ---------- localStorage ---------- */
 
  function readSelected() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : null;
      return data && typeof data === 'object' && data.id ? data : null;
    } catch (e) {
      return null;
    }
  }
 
  function writeSelected(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Не вдалося зберегти вибраний товар:', e);
    }
  }
 
  function clearSelected() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }
 
  function text(el) {
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }
 
  function nonEmpty(obj) {
    var out = {};
    Object.keys(obj).forEach(function (key) {
      if (obj[key]) out[key] = obj[key];
    });
    return out;
  }
 
  function getIdFromHref(href) {
    try {
      return new URL(href, window.location.href).searchParams.get('id') || '';
    } catch (e) {
      return '';
    }
  }
 
  /* ---------- Каталог (index.html): збереження при виборі картки ---------- */
 
  function snapshotFromCard(card) {
    var href = card.getAttribute('href') || '';
    var id = getIdFromHref(href);
    if (!id) return null;
 
    var imageBox = card.querySelector('.product-image');
    var images = imageBox ? (imageBox.getAttribute('data-images') || '').split(',') : [];
 
    return {
      id: id,
      url: href,
      title: text(card.querySelector('.product-title')),
      price: text(card.querySelector('.product-price')),
      oldPrice: text(card.querySelector('.old-price')),
      badge: text(card.querySelector('.product-badge')),
      image: (images[0] || '').trim()
    };
  }
 
  function onCardActivate(e) {
    if (!e.target.closest) return;
    // Кнопка «Купити» не означає вибір товару для перегляду
    if (e.target.closest('.add-to-cart')) return;
 
    var card = e.target.closest('a.product-card');
    if (!card) return;
 
    var snap = snapshotFromCard(card);
    if (!snap) return;
 
    var prev = readSelected();
    var base = prev && prev.id === snap.id ? prev : {};
    writeSelected(Object.assign({}, base, snap));
  }
 
  /* ---------- Сторінка товару (product.html): повні дані ---------- */
 
  function captureFromProductPage() {
    var sku = text(document.getElementById('product-sku'));
    var title = text(document.getElementById('product-title'));
    if (!sku || sku === '---' || !title || title === 'Завантаження...') return;
 
    var oldPriceEl = document.getElementById('product-old-price');
    var badgeEl = document.getElementById('product-badge');
    var imgEl = document.getElementById('main-product-img');
    var id = new URLSearchParams(window.location.search).get('id') || sku;
 
    var data = {
      id: id,
      sku: sku,
      url: window.location.pathname.split('/').pop() + window.location.search,
      title: title,
      price: text(document.getElementById('product-price')),
      image: imgEl ? imgEl.getAttribute('src') || '' : '',
      description: text(document.getElementById('tab-desc-text')) ||
                   text(document.getElementById('product-desc'))
    };
 
    var prev = readSelected();
    var base = prev && prev.id === id ? prev : {};
    var merged = Object.assign({}, base, nonEmpty(data), {
      // знижка і бейдж можуть зникнути — тут завжди актуальні значення
      oldPrice: oldPriceEl && oldPriceEl.style.display !== 'none' ? text(oldPriceEl) : '',
      badge: badgeEl && badgeEl.style.display !== 'none' ? text(badgeEl) : ''
    });
 
    if (JSON.stringify(merged) !== JSON.stringify(prev)) writeSelected(merged);
  }
 
  function initProductPage() {
    // Відкрили product.html без ?id= — показуємо раніше вибраний товар
    var hasId = new URLSearchParams(window.location.search).get('id');
    if (!hasId) {
      var saved = readSelected();
      if (saved && saved.url) {
        window.location.replace(saved.url);
        return;
      }
    }
 
    window.addEventListener('load', captureFromProductPage);
 
    if ('MutationObserver' in window) {
      var observer = new MutationObserver(captureFromProductPage);
      ['product-sku', 'product-title', 'product-price'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) observer.observe(el, { childList: true, characterData: true, subtree: true });
      });
    }
  }
 
  /* ---------- index.html: блок «Ви обрали» + підсвітка картки ---------- */
 
  function markSelectedCard(selected) {
    var cards = document.querySelectorAll('a.product-card');
    Array.prototype.forEach.call(cards, function (card) {
      var isSelected = !!selected && getIdFromHref(card.getAttribute('href')) === selected.id;
      card.classList.toggle('is-selected', isSelected);
    });
  }
 
  function renderSelectedBlock() {
    var body = document.getElementById('selected-product-body');
    var selected = readSelected();
 
    markSelectedCard(selected);
    if (!selectedSection || !body) return;
 
    body.textContent = '';
    selectedSection.hidden = !selected;
    if (!selected) return;
 
    var link = document.createElement('a');
    link.className = 'selected-product-link';
    link.href = selected.url || 'product.html?id=' + encodeURIComponent(selected.id);
 
    if (selected.image) {
      var img = document.createElement('img');
      img.src = selected.image;
      img.alt = selected.title || '';
      link.appendChild(img);
    }
 
    var info = document.createElement('div');
    info.className = 'selected-product-info';
 
    if (selected.badge) {
      var badge = document.createElement('span');
      badge.className = 'selected-product-badge';
      badge.textContent = selected.badge;
      info.appendChild(badge);
    }
 
    var title = document.createElement('strong');
    title.className = 'selected-product-title';
    title.textContent = selected.title || '';
    info.appendChild(title);
 
    var priceRow = document.createElement('div');
    priceRow.className = 'selected-product-price';
    if (selected.oldPrice) {
      var old = document.createElement('s');
      old.textContent = selected.oldPrice;
      priceRow.appendChild(old);
    }
    var price = document.createElement('span');
    price.textContent = selected.price || '';
    priceRow.appendChild(price);
    info.appendChild(priceRow);
 
    if (selected.description) {
      var desc = document.createElement('p');
      desc.className = 'selected-product-desc';
      desc.textContent = selected.description;
      info.appendChild(desc);
    }
 
    var cta = document.createElement('span');
    cta.className = 'selected-product-cta';
    cta.textContent = 'Переглянути повний опис';
    info.appendChild(cta);
 
    link.appendChild(info);
    body.appendChild(link);
 
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'selected-product-reset';
    reset.textContent = 'Скинути вибір';
    reset.addEventListener('click', function () {
      clearSelected();
      renderSelectedBlock();
    });
    body.appendChild(reset);
  }
 
  function initCatalogPage() {
    document.addEventListener('click', onCardActivate, true);
    document.addEventListener('auxclick', onCardActivate, true);
 
    renderSelectedBlock();
    window.addEventListener('load', renderSelectedBlock);
    window.addEventListener('pageshow', renderSelectedBlock); // повернення кнопкою «Назад»
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY) renderSelectedBlock();
    });
  }
 
  /* ---------- Старт ---------- */
 
  if (isProductPage) {
    initProductPage();
  } else {
    initCatalogPage();
  }
 
  // Публічний API
  window.SelectedProduct = {
    get: readSelected,
    clear: function () {
      clearSelected();
      renderSelectedBlock();
    }
  };
})();
 