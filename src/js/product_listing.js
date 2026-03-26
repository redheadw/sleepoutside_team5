import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();

  const category = getParam("category") || "tents";
  const dataSource = new ExternalServices();
  const listElement = document.querySelector(".product-list");

  if (!listElement) {
    console.error("No .product-list element found in product_listing/index.html");
    return;
  }

  const myList = new ProductList(category, dataSource, listElement);
  await myList.init();

  const title = document.querySelector(".products h2");
  if (title) {
    const formattedCategory = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    title.textContent = `Top Products: ${formattedCategory}`;
  }
}

init();