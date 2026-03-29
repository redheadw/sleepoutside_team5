import ExternalServices from "./ExternalServices.mjs";
import { getCartContents, alertMessage } from "./utils.mjs";

export default class CheckoutProcess {
  constructor(key = "so-cart") {
    this.key = key;
    this.list = [];
    this.services = new ExternalServices();
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  displaySubtotal(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.calculateItemSummary();
  }

  async init() {
    this.list = await getCartContents(this.key);
  }

  calculateItemSummary() {
    this.calculateItemSubTotal();
    this.calculateOrderTotals();
    this.displayOrderTotals();
  }

  calculateItemSubTotal() {
    const price = this.list.map(
      (item) => item.product.FinalPrice * item.cartItem.count
    );
    this.itemTotal = price.reduce((sum, item) => sum + item, 0);
  }

  calculateOrderTotals() {
    const totalItems = this.list.reduce(
      (sum, item) => sum + item.cartItem.count,
      0
    );

    this.tax = this.itemTotal * 0.06;
    const cartShipping = (totalItems - 1) * 2;
    this.shipping = totalItems > 0 ? 10 + cartShipping : 0;
    this.orderTotal = this.itemTotal + this.shipping + this.tax;

    if (totalItems === 0) {
      this.itemTotal = 0;
      this.tax = 0;
      this.shipping = 0;
      this.orderTotal = 0;
    }
  }

  displayOrderTotals() {
    document.querySelector(
      `${this.outputSelector} #order-subtotal`
    ).textContent = `$${this.itemTotal.toFixed(2)}`;
    document.querySelector(
      `${this.outputSelector} #order-tax`
    ).textContent = `$${this.tax.toFixed(2)}`;
    document.querySelector(
      `${this.outputSelector} #order-shipping`
    ).textContent = `$${this.shipping.toFixed(2)}`;
    document.querySelector(
      `${this.outputSelector} #order-total`
    ).textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  packageItems(items) {
    return items.map((item) => ({
      id: item.product.Id,
      name: item.product.Name,
      price: item.product.FinalPrice,
      quantity: item.cartItem.count
    }));
  }

  formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};

    formData.forEach((value, key) => {
      convertedJSON[key] = value;
    });

    return convertedJSON;
  }

  async checkout(form) {
    const order = this.formDataToJSON(form);
    order.orderDate = new Date().toISOString();
    order.items = this.packageItems(this.list);

    try {
      const result = await this.services.checkout(order);

      localStorage.removeItem(this.key);
      window.location.href = "./success.html";

      return result;
    } catch (err) {
      if (err.name === "servicesError" && err.message) {
        if (Array.isArray(err.message)) {
          alertMessage(err.message.join(", "));
        } else if (typeof err.message === "object") {
          alertMessage(Object.values(err.message).join(", "));
        } else {
          alertMessage(err.message);
        }
      } else {
        alertMessage("Checkout failed. Please try again.");
      }

      throw err;
    }
  }
}