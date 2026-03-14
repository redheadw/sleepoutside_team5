// Update the cart badge with the number of items in the cart
function updateCartCountBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const cart = JSON.parse(localStorage.getItem('so-cart')) || [];
    badge.textContent = cart.length > 0 ? cart.length : '';
}

document.addEventListener('DOMContentLoaded', updateCartCountBadge);