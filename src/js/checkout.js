import { loadHeaderFooter, alertMessage, getCartContents, setLocalStorage } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const form = document.querySelector("form");
const orderSummary = document.querySelector(".order-summary");

const process = new CheckoutProcess();

process.init().then(() => {
  process.displaySubtotal("so-cart", ".order-summary");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const status = form.checkValidity();
  form.reportValidity();
  if (status) {
    try {
      const response = await process.checkout(form);
    
      if (response.ok) {
        setLocalStorage("so-cart", []);

        window.location.href = "/checkout/success.html";
      } else {
        let errorMessage = "An error occurred during checkout. Please try again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If can't parse JSON, keep generic message
        }
        alertMessage(errorMessage);
      }
    } catch (error) {
      alertMessage(`An error occurred: ${error.message || "Please check your connection."}`);
      console.error('Checkout error:', error);
    }
  }
});