import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();

  const productId = getParam("product");
  const category = getParam("category") || "tents";
  const dataSource = new ExternalServices(category);
  const product = new ProductDetails(productId, dataSource);
  await product.init();

  //const productDetail = new ProductDetails(product);
  product.renderProductDetails();
}

init();
