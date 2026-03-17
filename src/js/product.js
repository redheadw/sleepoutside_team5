import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();

  const productId = getParam("product");
  const dataSource = new ProductData();
  const product = await dataSource.findProductById(productId);

  const productDetail = new ProductDetails(product);
  productDetail.renderProductDetails();
}

init();
