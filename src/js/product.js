
import { setLocalStorage } from './utils.mjs';
import ProductData from './ProductData.mjs';

const dataSource = new ProductData('tents');

const params = new URLSearchParams(window.location.search);
const productId = params.get("product");

function addProductToCart(product) {
  let cart = JSON.parse(localStorage.getItem('so-cart')) || [];
  cart.push(product);
  setLocalStorage('so-cart', cart);
}

async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

document.getElementById("addToCart").dataset.id = productId;

document
  .getElementById('addToCart')
  .addEventListener('click', addToCartHandler);

