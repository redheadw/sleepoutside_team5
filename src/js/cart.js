import { getLocalStorage, setLocalStorage, loadHeaderFooter, getCartContents } from "./utils.mjs";

const MAX_QTY_PER_ITEM = 200;

function getProductImage(product) {
  return product.Images?.PrimaryMedium || product.Image;
}

async function initCartPage() {
  await loadHeaderFooter();
  await renderCartContents();
}

async function renderCartContents() {
  const cartItems = await getCartContents();

  const htmlItems = cartItems.map((item) =>
    cartItemTemplate(item.product, item.cartItem)
  );
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  setupRemoveListeners();
  setupQuantityChangeListeners();

  await updatePrices();
}

async function updatePrices() {
  const cartItems = await getCartContents();
  const cartFooter = document.querySelector(".cart-footer");

  cartItems.forEach((item) => {
    const costElement = document.querySelector(
      `#_${item.product.Id} .cart-card__price`
    );
    costElement.textContent =
      `$${(item.product.FinalPrice * item.cartItem.count).toFixed(2)}`;
  });

  if (cartItems.length > 0) {
    cartFooter.classList.remove("hide");

    const price = cartItems.map(
      (item) => item.product.FinalPrice * item.cartItem.count
    );
    const totalPrice = price.reduce((sum, item) => sum + item, 0);
    const totalElement = document.querySelector(".cart-total");

    if (totalElement) {
      totalElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
    }

  } else {
    cartFooter.classList.add("hide");
  }
}

function cartItemTemplate(item, inBag) {
  const category = inBag.category || item.Category || "tents";
  return `
    <li class="cart-card divider" id="_${item.Id}">
      <a href="/product_pages/index.html?category=${encodeURIComponent(category)}&product=${item.Id}" class="cart-card__image">
        <img src="${getProductImage(item)}" alt="${item.Name}" />
      </a>
      <a href="/product_pages/index.html?category=${encodeURIComponent(category)}&product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">qty: <input type="number" name="quantity" value="${inBag.count}" data-id="${item.Id}" data-category="${category}" min="1" max="${MAX_QTY_PER_ITEM}"></p>
      <p class="cart-card__price">$${(item.FinalPrice * inBag.count).toFixed(2)}</p>

      <button type="button" class="cart-card__remove" data-id="${item.Id}" data-category="${category}">
        X
      </button>
    </li>
  `;
}

function removeCartItemFromStorage(id, category) {
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) cartItems = [];

  const updatedCart = cartItems.filter(
    (item) => !(item.productId === id && (item.category || "tents") === category)
  );

  setLocalStorage('so-cart', updatedCart);
  renderCartContents();
}

function setupRemoveListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.dataset.id;
      const category = button.dataset.category || "tents";
      removeCartItemFromStorage(itemId, category);
    });
  });
}

function updateCartItemQuantity(id, category, count) {
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) cartItems = [];
  
  const updatedCartItems = cartItems
    .map((item) => {
      if (item.productId !== id || (item.category || "tents") !== category) {
        return item;
      }

      return {
        ...item,
        count
      };
    })
    .filter((item) => Number.parseInt(item.count, 10) > 0);

  setLocalStorage('so-cart', updatedCartItems);
}

function setupQuantityChangeListeners() {
  const quantityInput = document.querySelectorAll(".cart-card__quantity input");

  quantityInput.forEach((button) => {
    button.addEventListener("change", async () => {
      const itemId = button.dataset.id;
      const category = button.dataset.category || "tents";
      if (button.value > MAX_QTY_PER_ITEM) {
        button.value = MAX_QTY_PER_ITEM;
      }
      if (button.value.includes(".")) {
        button.value -= button.value % 1;
      }
      if (isNaN(button.value)) {
        button.value = 1;
      }
      updateCartItemQuantity(itemId, category, parseInt(button.value));
      await renderCartContents();
      await updatePrices();
    });
  });
}

initCartPage();
