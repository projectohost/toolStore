document.addEventListener('DOMContentLoaded', () => {
  let cart = [];
  
  const modalHTML = `
    <div id="cart-modal" class="cart-modal-overlay" style="display: none;">
      <div class="cart-modal-content">
        <div class="cart-modal-header">
          <h3>Кошик покупок</h3>
          <button type="button" id="close-cart" class="close-btn">&times;</button>
        </div>
        <div class="cart-modal-body">
          <ul id="cart-items-list"></ul>
          <div id="cart-empty-msg">Ваш кошик порожній</div>
        </div>
        <div class="cart-modal-footer">
          <div class="cart-total">Загалом: <span id="cart-total-price">0</span> ₴</div>
          <button type="button" class="checkout-btn">Оформити замовлення</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const cartBtn = document.querySelector('.action-btn:nth-child(2)');
  const modal = document.getElementById('cart-modal');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmptyMsg = document.getElementById('cart-empty-msg');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const checkoutBtn = document.querySelector('.checkout-btn');

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#16a34a';
    notification.style.color = '#ffffff';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.style.zIndex = '1000';
    notification.style.fontWeight = 'bold';
    notification.style.transition = 'opacity 0.3s';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
  });

  closeCartBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Ваш кошик порожній!');
      return;
    }
    alert('Дякуємо за замовлення! Менеджер зв\'яжеться з вами найближчим часом.');
    cart = [];
    updateCartUI();
    modal.style.display = 'none';
  });

  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const title = card.querySelector('.product-title').innerText;
      const priceText = card.querySelector('.product-price').innerText;
      const price = parseInt(priceText.replace(/\D/g, ''));

      cart.push({ title, price });
      updateCartUI();
      showNotification(`Товар "${title}" додано до кошика!`);
    });
  });

  function updateCartUI() {
    cartItemsList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      cartEmptyMsg.style.display = 'block';
    } else {
      cartEmptyMsg.style.display = 'none';
      cart.forEach((item, index) => {
        total += item.price;
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <span>${item.title} — <b>${item.price} ₴</b></span>
          <button type="button" class="cart-item-remove" data-index="${index}">Видалити</button>
        `;
        cartItemsList.appendChild(li);
      });
    }

    cartTotalPrice.innerText = total;
    cartBtn.innerText = `🛒 Кошик (${cart.length})`;

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        cart.splice(index, 1);
        updateCartUI();
      });
    });
  }

  // --- СЛАЙДЕР ФОТО З ЗАГЛУШКОЮ ---
  const productImageContainers = document.querySelectorAll('.product-image');

  productImageContainers.forEach(container => {
    const rawImages = container.getAttribute('data-images');
    
    if (!rawImages || rawImages.trim() === '') {
      container.innerHTML = '<span class="product-image-placeholder">Фото товару</span>';
      return;
    }

    const imageList = rawImages.split(',').map(url => url.trim()).filter(url => url.length > 0);
    
    if (imageList.length === 0) {
      container.innerHTML = '<span class="product-image-placeholder">Фото товару</span>';
      return;
    }

    let currentIndex = 0;
    container.innerHTML = '';

    const img = document.createElement('img');
    img.src = imageList[currentIndex];
    img.alt = 'Фото товару';
    
    img.onerror = () => {
      container.innerHTML = '<span class="product-image-placeholder">Фото відсутнє</span>';
    };

    container.appendChild(img);

    if (imageList.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'slider-btn prev';
      prevBtn.innerHTML = '&#10094;';

      const nextBtn = document.createElement('button');
      nextBtn.className = 'slider-btn next';
      nextBtn.innerHTML = '&#10095;';

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
        img.src = imageList[currentIndex];
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % imageList.length;
        img.src = imageList[currentIndex];
      });
    }
  });

  // Фільтрація за ціною та пошук
  const priceInputMin = document.querySelector('.price-inputs input:nth-child(1)');
  const priceInputMax = document.querySelector('.price-inputs input:nth-child(2)');
  const productCards = document.querySelectorAll('.product-card');

  function filterProducts() {
    const min = parseInt(priceInputMin.value) || 0;
    const max = parseInt(priceInputMax.value) || Infinity;

    productCards.forEach(card => {
      const priceText = card.querySelector('.product-price').innerText;
      const price = parseInt(priceText.replace(/\D/g, ''));

      if (price >= min && price <= max) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (priceInputMin && priceInputMax) {
    priceInputMin.addEventListener('input', filterProducts);
    priceInputMax.addEventListener('input', filterProducts);
  }

  const searchButton = document.querySelector('.search-bar button');
  const searchInput = document.querySelector('.search-bar input');

  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    productCards.forEach(card => {
      const title = card.querySelector('.product-title').innerText.toLowerCase();
      if (title.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('input', performSearch);
  }
});