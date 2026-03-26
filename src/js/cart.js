import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

async function initCartPage() {
  await loadHeaderFooter();
  renderCartContents();
}

function renderCartContents() {
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) cartItems = [];

  const cartFooter = document.querySelector(".cart-footer");
  const productList = document.querySelector(".product-list");

  
  if (cartItems.length === 0) {
    productList.innerHTML = "<li>Your cart is empty.</li>";
    cartFooter.classList.add("hide");
    return;
  }

  
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join("");

  setupRemoveListeners();

  cartFooter.classList.remove("hide");

  const totalPrice = cartItems.reduce((sum, item) => sum + item.FinalPrice, 0);
  const totalElement = document.querySelector(".cart-total");

  if (totalElement) {
    totalElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
  }
}

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <a href="/product_pages/index.html?product=${item.Id}" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>
      <a href="/product_pages/index.html?product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">qty: 1</p>
      <p class="cart-card__price">$${item.FinalPrice}</p>

      <button type="button" class="cart-card__remove" data-id="${item.Id}">
        X
      </button>
    </li>
  `;
}

function removeCartItemFromStorage(id) {
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) cartItems = [];

  const itemIndex = cartItems.findIndex((item) => item.Id === id);

  if (itemIndex !== -1) {
    cartItems.splice(itemIndex, 1);
  }

  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function setupRemoveListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.dataset.id;
      removeCartItemFromStorage(itemId);
    });
  });
}

initCartPage();