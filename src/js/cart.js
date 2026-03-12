import { getLocalStorage, setLocalStorage } from './utils.mjs';

function renderCartContents() {
  let cartItems = getLocalStorage('so-cart');
  if (!Array.isArray(cartItems)) cartItems = [];
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector('.product-list').innerHTML = htmlItems.join('');

  setupRemoveListeners();

  const cartFooter = document.querySelector('.cart-footer');
  if (cartItems.length > 0) {
    cartFooter.classList.remove('hide');

    let totalPrice = cartItems.reduce((sum, item) => sum + item.FinalPrice, 0);
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
      totalElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
    }
  } else {
    cartFooter.classList.add('hide');
  }
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>

  <button type="button" class="cart-card__remove" data-id="${item.Id}">
    X
  </button>
</li>`;

  return newItem;
}

function removeCartItemFromStorage(id) {
  let cartItems = getLocalStorage('so-cart');
  if (!Array.isArray(cartItems)) cartItems = [];

  const updatedCart = cartItems.filter(item => item.Id !== id);

  setLocalStorage('so-cart', updatedCart);

  renderCartContents();
}

function setupRemoveListeners() {
  const productList = document.querySelectorAll('.cart-card__remove');

  productList.forEach(button => {
    button.addEventListener("click", (e) => {
      const itemId = button.dataset.id;
      removeCartItemFromStorage(itemId);
      button.parentElement.remove();
    })
  });
}

renderCartContents();
