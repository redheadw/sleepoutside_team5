import { getParam, loadHeaderFooter } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

async function initProductPage() {
  await loadHeaderFooter();

  const productId = getParam("product");
  const category = getParam("category") || "tents";
  const dataSource = new ProductData(category);
  const product = new ProductDetails(productId, dataSource);

  product.init();
}

initProductPage();
