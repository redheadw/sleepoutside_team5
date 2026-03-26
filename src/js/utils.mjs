// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));

  if (key === "so-cart") {
    updateCartCount();
  }
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

// single template
export function renderWithTemplate(template, parentElement, data, callback) {
  const fragment = document.createRange().createContextualFragment(template);
  parentElement.replaceChildren(fragment);

  if (callback) {
    callback(data);
  }
}

// fetch template file
export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${path} (${response.status})`);
  }
  return await response.text();
}

export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate("/partials/header.html");
    const footerTemplate = await loadTemplate("/partials/footer.html");

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement);
      updateCartCount();
    }

    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
    }
  } catch (error) {
    console.error("Header/footer load failed:", error);
  }
}

export function updateCartCount() {
  const cartCountElement = document.querySelector(".cart-count");

  if (!cartCountElement) {
    return;
  }

  let cartItems = getLocalStorage("so-cart");

  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }

  const validCartItems = cartItems.filter((item) => {
    if (!item || !item.productId) {
      return false;
    }

    const count = Number.parseInt(item.count, 10);
    return !Number.isNaN(count) && count > 0;
  });

  const totalItems = validCartItems.reduce((total, item) => {
    const count = Number.parseInt(item.count, 10);
    return total + count;
  }, 0);

  cartCountElement.textContent = totalItems;
  cartCountElement.classList.remove("hide");
}

import ExternalServices from "./ExternalServices.mjs";
const dataSources = {};

function getDataSource(category = "tents") {
  if (!dataSources[category]) {
    dataSources[category] = new ExternalServices(category);
  }
  return dataSources[category];
}

export async function getCartContents() {
  let cart = getLocalStorage("so-cart");
  if (!Array.isArray(cart)) cart = [];
  const cartItems = await Promise.all(
    cart.map(async (item) => {
      const category = item.category || "tents";
      const product = await getDataSource(category).findProductById(
        item.productId,
        category
      );

      if (!product) {
        return null;
      }

      return {
        product,
        cartItem: item
      };
    })
  );
  const validCartItems = cartItems.filter((item) => !!item);

  if (validCartItems.length !== cart.length) {
    const cleanedCart = validCartItems.map((item) => item.cartItem);
    setLocalStorage("so-cart", cleanedCart);
  }

  return validCartItems;
}

export function alertMessage(message, scroll = true) {
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());

  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.role = 'alert';

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  messageSpan.classList.add('alert-message');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('alert-close');
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close alert');

  alert.appendChild(messageSpan);
  alert.appendChild(closeBtn);

  alert.addEventListener('click', function(e) {
    if(e.target.classList.contains('alert-close') || e.target.classList.contains('alert')) {
       const main = document.querySelector('main');
       if(main) {
           main.removeChild(this);
       }
    }
  });

  // add the alert to the top of main
  const main = document.querySelector('main');
  main.prepend(alert);

  if(scroll) {
      window.scrollTo(0, 0);
  }
}
