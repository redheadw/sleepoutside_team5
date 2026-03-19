import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";
import { qs } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";

const dataSource = new ProductData("tents");
const listElement = qs(".product-list");

const myList = new ProductList("tents", dataSource, listElement);
myList.init();

const alerts = new Alert();
alerts.init();

loadHeaderFooter();
