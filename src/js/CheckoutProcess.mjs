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
            cardNumber: "1234123412341234",
            expiration: formData.expiration,
            code: "123",
            items: items,
            orderTotal: this.orderTotal.toFixed(2),
            shipping: this.shipping,
            tax: this.tax.toFixed(2)
        };

        const url = "/checkout";
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        };

        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            console.error("Error during checkout:", error);
            throw error;
        }
    }
}
