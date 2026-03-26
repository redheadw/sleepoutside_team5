import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const process = new CheckoutProcess();
await process.init();

process.displaySubtotal("so-cart", ".order-summary");
document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    try {
        const response = await process.checkout(form);

        console.log('Checkout response:', response);

    } catch (error) {
        console.error('Checkout error:', error);
    }
});
