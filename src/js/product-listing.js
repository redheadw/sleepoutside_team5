import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

function formatCategory(category) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function initProductListingPage() {
  await loadHeaderFooter();

  const category = getParam("category") || "tents";
  const dataSource = new ExternalServices();
  const listElement = document.querySelector(".product-list");
  const myList = new ProductList(category, dataSource, listElement);
  const categoryName = formatCategory(category);
  const titleElement = document.querySelector(".title");

  if (titleElement) {
    titleElement.textContent = categoryName;
  }

  document.title = `Sleep Outside | ${categoryName}`;
  myList.init();
}

initProductListingPage();
