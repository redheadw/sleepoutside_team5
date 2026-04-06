import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

async function initPage() {
  await loadHeaderFooter();

  const process = new CheckoutProcess();
  await process.init();
  process.displaySubtotal("so-cart", ".order-summary");

  const form = document.querySelector("form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      await process.checkout(form);
    } catch (error) {
      console.error("Checkout error:", error);
    }
  });
}

initPage();