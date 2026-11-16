// Спільне відображення карток та форматування даних.
window.escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
window.formatPrice = value => `${value.toLocaleString('uk-UA')} ₴`;
window.renderProductCards = (container, entries) => {
  container.innerHTML = entries.map(([id, product]) => `
    <article class="product-card" data-product-id="${escapeHTML(id)}">
      <div>
        ${product.badge ? `<div class="product-badge">${escapeHTML(product.badge)}</div>` : ''}
        <div class="product-image" data-images="${escapeHTML(product.images.join(','))}"></div>
        <a class="product-title" href="product.html?id=${encodeURIComponent(id)}">${escapeHTML(product.title)}</a>
      </div>
      <div class="product-footer">
        ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
        <div class="product-price">${formatPrice(product.price)}</div>
        <button type="button" class="add-to-cart" data-product-id="${escapeHTML(id)}">Купити</button>
      </div>
    </article>`).join('');
};
const catalog = document.getElementById('catalog');
if (catalog) renderProductCards(catalog, Object.entries(PRODUCTS));
