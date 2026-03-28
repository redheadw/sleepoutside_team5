import {
  getLocalStorage,
  setLocalStorage,
  loadHeaderFooter,
  getCartContents
} from "./utils.mjs";

const CART_KEY = "so-cart";
const MAX_QTY_PER_ITEM = 200;
const DEFAULT_CATEGORY = "tents";

function getProductImage(product) {
  return product?.Images?.PrimaryMedium || product?.Image || "";
}

function getProductColor(product) {
  return product?.Colors?.[0]?.ColorName || "N/A";
}

function getCategory(product, cartItem) {
  return cartItem?.category || product?.Category || DEFAULT_CATEGORY;
}

function buildProductUrl(product, cartItem) {
  const category = getCategory(product, cartItem);
  return `/product_pages/index.html?category=${encodeURIComponent(category)}&product=${product.Id}`;
}

function getStoredCart() {
  const cart = getLocalStorage(CART_KEY);
  return Array.isArray(cart) ? cart : [];
}

function sanitizeQuantity(value) {
  let quantity = Number.parseInt(value, 10);

  if (Number.isNaN(quantity) || quantity < 1) {
    quantity = 1;
  }

  if (quantity > MAX_QTY_PER_ITEM) {
    quantity = MAX_QTY_PER_ITEM;
  }

  return quantity;
}

async function initCartPage() {
  await loadHeaderFooter();
  await renderCartContents();
}

async function renderCartContents() {
  const cartItems = await getCartContents();
  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  const totalElement = document.querySelector(".cart-total");

  if (!productList) return;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    productList.innerHTML = "<li>Your cart is empty.</li>";

    if (cartFooter) {
      cartFooter.classList.add("hide");
    }

    if (totalElement) {
      totalElement.textContent = "Total: $0.00";
    }

    return;
  }

  const htmlItems = cartItems.map(({ product, cartItem }) =>
    cartItemTemplate(product, cartItem)
  );

  productList.innerHTML = htmlItems.join("");

  setupRemoveListeners();
  setupQuantityChangeListeners();
  updatePrices(cartItems);
}

function updatePrices(cartItems) {
  const cartFooter = document.querySelector(".cart-footer");
  const totalElement = document.querySelector(".cart-total");

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    if (cartFooter) {
      cartFooter.classList.add("hide");
    }

    if (totalElement) {
      totalElement.textContent = "Total: $0.00";
    }

    return;
  }

  let totalPrice = 0;

  cartItems.forEach(({ product, cartItem }) => {
    const quantity = Number(cartItem.count) || 1;
    const unitPrice = Number(product.FinalPrice) || 0;
    const lineTotal = unitPrice * quantity;

    totalPrice += lineTotal;

    const priceElement = document.querySelector(
      `#_${product.Id} .cart-card__price`
    );

    if (priceElement) {
      priceElement.textContent = `$${lineTotal.toFixed(2)}`;
    }
  });

  if (cartFooter) {
    cartFooter.classList.remove("hide");
  }

  if (totalElement) {
    totalElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
  }
}

function cartItemTemplate(product, cartItem) {
  const category = getCategory(product, cartItem);
  const productUrl = buildProductUrl(product, cartItem);
  const quantity = Number(cartItem.count) || 1;
  const itemTotal = (Number(product.FinalPrice) || 0) * quantity;

  return `
    <li class="cart-card divider" id="_${product.Id}">
      <a href="${productUrl}" class="cart-card__image">
        <img src="${getProductImage(product)}" alt="${product.Name}" />
      </a>

      <a href="${productUrl}">
        <h2 class="card__name">${product.Name}</h2>
      </a>

      <p class="cart-card__color">${getProductColor(product)}</p>

      <p class="cart-card__quantity">
        qty:
        <input
          type="number"
          name="quantity"
          value="${quantity}"
          data-id="${product.Id}"
          data-category="${category}"
          min="1"
          max="${MAX_QTY_PER_ITEM}"
        >
      </p>

      <p class="cart-card__price">$${itemTotal.toFixed(2)}</p>

      <button
        type="button"
        class="cart-card__remove"
        data-id="${product.Id}"
        data-category="${category}"
        aria-label="Remove ${product.Name} from cart"
      >
        X
      </button>
    </li>
  `;
}

async function removeCartItemFromStorage(id, category) {
  const cartItems = getStoredCart();

  const updatedCart = cartItems.filter(
    (item) =>
      !(item.productId === id && (item.category || DEFAULT_CATEGORY) === category)
  );

  setLocalStorage(CART_KEY, updatedCart);
  await renderCartContents();
}

function setupRemoveListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");

  removeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = button.dataset.id;
      const category = button.dataset.category || DEFAULT_CATEGORY;
      await removeCartItemFromStorage(itemId, category);
    });
  });
}

function updateCartItemQuantity(id, category, count) {
  const cartItems = getStoredCart();

  const updatedCart = cartItems
    .map((item) => {
      const itemCategory = item.category || DEFAULT_CATEGORY;

      if (item.productId === id && itemCategory === category) {
        return {
          ...item,
          count
        };
      }

      return item;
    })
    .filter((item) => Number(item.count) > 0);

  setLocalStorage(CART_KEY, updatedCart);
}

function setupQuantityChangeListeners() {
  const quantityInputs = document.querySelectorAll(".cart-card__quantity input");

  quantityInputs.forEach((input) => {
    input.addEventListener("change", async () => {
      const itemId = input.dataset.id;
      const category = input.dataset.category || DEFAULT_CATEGORY;
      const cleanQuantity = sanitizeQuantity(input.value);

      input.value = cleanQuantity;
      updateCartItemQuantity(itemId, category, cleanQuantity);

      await renderCartContents();
    });
  });
}

initCartPage();