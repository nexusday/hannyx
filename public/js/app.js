document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    try {
        console.log('Fetching products...');
        const response = await fetch('/api/products');
        const products = await response.json();
        console.log('Products received:', products);
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    console.log('Displaying products:', products.length);
    const container = document.getElementById('products');
    console.log('Container:', container);
    container.innerHTML = '';
    products.forEach(product => {
        console.log('Processing product:', product);
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="text-content">
                <h3>${product.name}</h3>
                <p class="price">Precio: S/ ${product.price}</p>
                <p class="description">${product.description}</p>
            </div>
        `;
        productDiv.addEventListener('click', () => openProductModal(product));
        container.appendChild(productDiv);
    });
    console.log('Products displayed');
}

function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    const image = document.getElementById('modal-product-image');
    const name = document.getElementById('modal-product-name');
    const price = document.getElementById('modal-product-price');
    const description = document.getElementById('modal-product-description');

    image.src = product.image;
    image.alt = product.name;
    name.textContent = product.name;
    price.textContent = `S/ ${product.price}`;
    description.textContent = product.description;

    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('product-modal');
    if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeProductModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartCount();
    showToast(`${product.name} agregado al carrito de compras`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    showCart();
}

function showCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
            <div>
                <h4>${item.name}</h4>
                <p>S/ ${item.price} x ${item.quantity}</p>
                <button onclick="removeFromCart('${item.id}')">Eliminar</button>
            </div>
        `;
        cartItems.appendChild(itemDiv);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = total.toFixed(2);
    document.getElementById('cart-modal').classList.remove('hidden');

    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = cart.length === 0;
}

function hideCart() {
    document.getElementById('cart-modal').classList.add('hidden');
}

// Inicializar
updateCartCount();

// Eventos
document.getElementById('cart-icon').addEventListener('click', showCart);
document.getElementById('cart-modal').addEventListener('click', (e) => {
    console.log('Cart modal close attempt');
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        hideCart();
    }
});
document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const product = {
        id: document.getElementById('modal-product-name').textContent,
        name: document.getElementById('modal-product-name').textContent,
        price: parseFloat(document.getElementById('modal-product-price').textContent.replace('S/ ', '')),
        image: document.getElementById('modal-product-image').src,
        description: document.getElementById('modal-product-description').textContent
    };
    addToCart(product);
});

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return;
    document.getElementById('checkout-modal').classList.remove('hidden');
});

document.getElementById('checkout-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        document.getElementById('checkout-modal').classList.add('hidden');
    }
});

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerData = {
        name: document.getElementById('customer-name').value,
        dni: document.getElementById('customer-dni').value,
        address: document.getElementById('customer-address').value,
        city: document.getElementById('customer-city').value,
        province: document.getElementById('customer-province').value,
        agency: document.getElementById('customer-agency').value,
        phone: document.getElementById('customer-phone').value
    };

    const advisors = await fetchAdvisors();
    if (advisors.length === 0) {
        alert('No hay asesores disponibles');
        return;
    }
    const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];
    const code = Math.floor(1000 + Math.random() * 9000);
    const cartTotal = document.getElementById('cart-total').textContent;
    const message = `Hola ${randomAdvisor.name}, quiero realizar un pago.\n\nDatos del cliente:\nNombre: ${customerData.name}\nDNI: ${customerData.dni}\nDirección: ${customerData.address}\nCiudad: ${customerData.city}\nProvincia: ${customerData.province}\nAgencia: ${customerData.agency}\nTeléfono: ${customerData.phone}\n\nProductos:\n${cart.map(item => `${item.name} - S/ ${item.price} x ${item.quantity}`).join('\n')}\n\nTotal: S/ ${cartTotal}\n\nCódigo único: ${code}`;
    window.open(`https://wa.me/${randomAdvisor.number}?text=${encodeURIComponent(message)}`, '_blank');
    document.getElementById('checkout-modal').classList.add('hidden');
    e.target.reset();
});

document.getElementById('customer-service').addEventListener('click', showAdvisorsModal);
document.getElementById('advisors-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        hideAdvisorsModal();
    }
});

async function showAdvisorsModal() {
    console.log('Showing advisors modal');
    const advisors = await fetchAdvisors();
    displayAdvisors(advisors);
    document.getElementById('advisors-modal').classList.remove('hidden');
}

function displayAdvisors(advisors) {
    console.log('Displaying advisors:', advisors);
    const container = document.getElementById('advisors-list');
    console.log('Advisors container:', container);
    container.innerHTML = '';
    advisors.forEach(advisor => {
        const item = document.createElement('div');
        item.className = 'advisor-item';
        item.innerHTML = `
            <button onclick="contactAdvisor('${advisor.name}', '${advisor.number}')">${advisor.name}</button>
        `;
        container.appendChild(item);
    });
}

function contactAdvisor(name, number) {
    console.log('Contacting advisor:', name, number);
    window.open(`https://wa.me/${number}`, '_blank');
    hideAdvisorsModal();
}

function hideAdvisorsModal() {
    console.log('Hiding advisors modal');
    document.getElementById('advisors-modal').classList.add('hidden');
}

async function fetchAdvisors() {
    try {
        const response = await fetch('/api/advisors');
        const advisors = await response.json();
        return advisors;
    } catch (error) {
        console.error('Error fetching advisors:', error);
        return [];
    }
}
