import { renderListWithTemplate } from "./utils.mjs";

function getProductImage(product) {
  return product.Images?.PrimaryMedium || product.Image;
}

function productCardTemplate(product, category) {
  const productCategory = product.Category || category;
  return `
    <li class="product-card">
      <a href="/product_pages/index.html?category=${encodeURIComponent(productCategory)}&product=${product.Id}">
        <img src="${getProductImage(product)}" alt="${product.Name}" />
        <h3>${product.Brand.Name}</h3>
        <h2>${product.NameWithoutBrand || product.Name}</h2>
        <p>$${product.FinalPrice}</p>
      </a>

      <button class="quick-view-btn" data-id="${product.Id}">
        Quick View
      </button>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(
      (product) => productCardTemplate(product, this.category),
      this.listElement,
      list,
      "afterbegin",
      true
    );
  }
}
