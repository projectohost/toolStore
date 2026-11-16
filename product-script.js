(() => {
  const id = new URLSearchParams(location.search).get("id");
  const product = Object.hasOwn(PRODUCTS, id) ? PRODUCTS[id] : null;
  const page = document.getElementById("product-page");
  if (!product) {
    document.title = "Товар не знайдено — ElectroTool";
    page.innerHTML =
      '<section class="product-info-block"><h1>Товар не знайдено</h1><p>Виберіть товар у каталозі.</p><a href="index.html">Повернутися до каталогу</a></section>';
    return;
  }
  document.title = `${product.title} — ElectroTool`;
  document.getElementById("nav-category").textContent = product.category;
  page.innerHTML = `
    <nav class="breadcrumbs" aria-label="Навігація"><a href="index.html">Каталог</a> / <span>${escapeHTML(product.title)}</span></nav>
    <section class="product-detail">
      <div class="product-gallery">
        <div class="main-image-wrapper"><img id="main-product-img" alt="${escapeHTML(product.title)}"><span id="image-placeholder" hidden>Фото відсутнє</span></div>
        <div class="thumbnails">${product.images.map((src, index) => `<button type="button" data-image-index="${index}" aria-label="Фото ${index + 1}" aria-pressed="${index === 0}"><img src="${escapeHTML(src)}" alt="" /></button>`).join("")}</div>
      </div>
      <div class="product-info-block">
        ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ""}
        <p>Код товару: ${escapeHTML(id)}</p>
        <h1>${escapeHTML(product.title)}</h1>
        <p>${escapeHTML(product.category)}</p>
        <div class="price-box">
          ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ""}
          <div class="current-price">${formatPrice(product.price)}</div>
          ${product.oldPrice > product.price ? `<span>Економія ${formatPrice(product.oldPrice - product.price)}</span>` : ""}
        </div>
        <p>${escapeHTML(product.description)}</p>
        <label for="product-qty">Кількість</label>
        <div class="purchase-controls">
          <input type="number" id="product-qty" value="1" min="1" max="99" step="1">
          <button type="button" class="add-to-cart" data-product-id="${escapeHTML(id)}">🛒 Додати в кошик</button>
        </div>
        <a href="index.html">← Повернутися до каталогу</a>
      </div>
    </section>
    <section><h2>Інші товари</h2><div class="catalog" id="related-catalog"></div></section>`;
  const image = document.getElementById("main-product-img");
  const placeholder = document.getElementById("image-placeholder");
  image.onerror = () => {
    image.hidden = true;
    placeholder.hidden = false;
  };
  function selectImage(index) {
    image.hidden = false;
    placeholder.hidden = true;
    image.src = product.images[index];
    page.querySelectorAll("[data-image-index]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.imageIndex) === index),
      );
    });
  }
  page.querySelector(".thumbnails").addEventListener("click", (event) => {
    const button = event.target.closest("[data-image-index]");
    if (button) selectImage(Number(button.dataset.imageIndex));
  });
  selectImage(0);
  renderProductCards(
    document.getElementById("related-catalog"),
    Object.entries(PRODUCTS)
      .filter(([key]) => key !== id)
      .slice(0, 4),
  );
})();
