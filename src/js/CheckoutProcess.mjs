import ExternalServices from "./ExternalServices.mjs";
import { alertMessage, getCartContents } from "./utils.mjs";

export default class CheckoutProcess {
    constructor() {
        this.externalServices = new ExternalServices();
    }
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
        //console.log(this.list);
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

    packageItems(items) {
        return items.map(item => ({
            id: item.product.Id,
            name: item.product.Name,
            price: item.product.FinalPrice,
            quantity: item.cartItem.count
        }));
    }
    formDataToJSON(formElement) {
        const formData = new FormData(formElement),
        convertedJSON = {};
        formData.forEach(function (value, key) {
            convertedJSON[key] = value;
        });
        return convertedJSON;
    }
    async checkout(form) {
        try {
            const formData = this.formDataToJSON(form);
            const items = this.packageItems(await getCartContents(this.key));
            const orderData = {
                orderDate: new Date().toISOString(),
                fname: formData.fname,
                lname: formData.lname,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                cardNumber: formData.cardNumber,
                expiration: formData.expiration,
                code: formData.code,
                items: items,
                orderTotal: this.orderTotal.toFixed(2),
                shipping: this.shipping,
                tax: this.tax.toFixed(2)
            };

            const response = await this.externalServices.checkout(orderData);
            localStorage.removeItem("so-cart");
            window.location.assign("/checkout/success.html");
            return response;
        } catch (err) {
            console.error(err);

            const message = typeof err.message === "string"
                ? err.message
                : err.message?.message ||
                  err.message?.Message ||
                  err.message?.error ||
                  "There was a problem placing your order. Please check your information and try again.";

            alertMessage(message);
        }
    }
}
