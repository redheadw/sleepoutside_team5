import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";
import { qs } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const alerts = new Alert();
alerts.init();
