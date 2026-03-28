import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

function formatCategory(category) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function showModal(product) {
  const modal = document.getElementById("quickViewModal");

  document.getElementById("modalBrand").textContent =
    product.Brand?.Name || "";
  document.getElementById("modalName").textContent =
    product.NameWithoutBrand || product.Name;
  document.getElementById("modalImage").src = product.Image;
  document.getElementById("modalImage").alt = product.Name;
  document.getElementById("modalPrice").textContent = `$${product.FinalPrice}`;
  document.getElementById("modalColor").textContent =
    product.Colors?.[0]?.ColorName || "";
  document.getElementById("modalDescription").innerHTML =
    product.DescriptionHtmlSimple || "";

  modal.classList.remove("hide");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = document.getElementById("quickViewModal");
  modal.classList.add("hide");
  modal.setAttribute("aria-hidden", "true");
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

  await myList.init();

  listElement.addEventListener("click", async (e) => {
    const button = e.target.closest(".quick-view-btn");
    if (!button) return;

    const productId = button.dataset.id;
    const products = await dataSource.getData(category);
    const product = products.find((item) => item.Id === productId);

    if (product) {
      showModal(product);
    }
  });

  const closeButton = document.querySelector(".modal-close");
  const modal = document.getElementById("quickViewModal");

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

initProductListingPage();