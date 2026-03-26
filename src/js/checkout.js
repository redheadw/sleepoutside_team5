import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const process = new CheckoutProcess();
await process.init();

process.displaySubtotal("so-cart", ".order-summary");
