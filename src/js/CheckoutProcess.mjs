import { getCartContents } from "./utils.mjs";

export default class CheckoutProcess {
    displaySubtotal(key, outputSelector) {
        this.key = key;
        this.outputSelector = outputSelector;
        this.itemTotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.orderTotal = 0;
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
        this.tax = this.itemTotal * 0.06;
        let totalItems = this.list.reduce((sum, item) => sum + item.cartItem.count, 0);
        const cartShipping = (totalItems - 1) * 2;
        this.shipping = 10 + cartShipping;
        this.orderTotal = this.itemTotal + this.shipping + this.tax;

        if (totalItems === 0) {
            this.itemTotal = 0;
            this.tax = 0;
            this.shipping = 0;
            this.orderTotal = 0;
        }
    }
    displayOrderTotals() {
        document.querySelector(`${this.outputSelector} #order-subtotal`).textContent = `$${this.itemTotal.toFixed(2)}`;
        document.querySelector(`${this.outputSelector} #order-tax`).textContent = `$${this.tax.toFixed(2)}`;
        document.querySelector(`${this.outputSelector} #order-shipping`).textContent = `$${this.shipping.toFixed(2)}`;
        document.querySelector(`${this.outputSelector} #order-total`).textContent = `$${this.orderTotal.toFixed(2)}`;
    }
}
