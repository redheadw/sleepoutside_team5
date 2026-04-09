import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const process = new CheckoutProcess();
process.init().then(() => {
    process.displaySubtotal("so-cart", ".order-summary");
})

const checkoutForm = document.forms["checkout"] || document.querySelector("form");

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isValid = checkoutForm.checkValidity();

    checkoutForm.reportValidity();

    if (isValid) {
        await process.checkout(checkoutForm);
    }
});
