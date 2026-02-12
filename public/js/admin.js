let editingProductId = null;
let editingAdvisorId = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    form.addEventListener('submit', handleSubmitProduct);
    fetchAndRenderAdminProducts();

    const advisorForm = document.getElementById('advisor-form');
    advisorForm.addEventListener('submit', handleSubmitAdvisor);
    fetchAndRenderAdminAdvisors();
});

async function handleSubmitAdvisor(event) {
    event.preventDefault();
    const name = document.getElementById('advisor-name').value;
    const number = document.getElementById('advisor-number').value;

    try {
        let response;
        if (editingAdvisorId) {
            response = await fetch(`/api/advisors/${editingAdvisorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, number })
            });
        } else {
            response = await fetch('/api/advisors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, number })
            });
        }

        if (response.ok) {
            alert(editingAdvisorId ? 'Asesor actualizado' : 'Asesor agregado exitosamente');
            event.target.reset();
            editingAdvisorId = null;
            updateAdvisorSubmitButtonLabel();
            fetchAndRenderAdminAdvisors();
        } else {
            alert('Error al guardar asesor');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAndRenderAdminAdvisors() {
    try {
        const response = await fetch('/api/advisors');
        const advisors = await response.json();
        renderAdminAdvisors(advisors);
    } catch (error) {
        console.error('Error al obtener asesores:', error);
    }
}

function renderAdminAdvisors(advisors) {
    const container = document.getElementById('admin-advisors-list');
    container.innerHTML = '';
    advisors.forEach(advisor => {
        const item = document.createElement('div');
        item.className = 'admin-advisor-item';
        item.innerHTML = `
            <div class="admin-advisor-info">
                <strong>${advisor.name}</strong>
                <span>${advisor.number}</span>
            </div>
            <div class="admin-advisor-actions">
                <button type="button" data-action="edit">Editar</button>
                <button type="button" data-action="delete">Eliminar</button>
            </div>
        `;

        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');

        editBtn.addEventListener('click', () => startEditAdvisor(advisor));
        deleteBtn.addEventListener('click', () => deleteAdvisor(advisor.id));

        container.appendChild(item);
    });
}

async function handleSubmitProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        let response;
        if (editingProductId) {
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            response = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });
        }

        if (response.ok) {
            alert(editingProductId ? 'Producto actualizado' : 'Producto agregado exitosamente');
            form.reset();
            editingProductId = null;
            updateSubmitButtonLabel();
            fetchAndRenderAdminProducts();
        } else {
            alert('Error al guardar producto');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAndRenderAdminProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        renderAdminProducts(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
}

function renderAdminProducts(products) {
    const container = document.getElementById('admin-products-list');
    container.innerHTML = '';
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        item.innerHTML = `
            <div class="admin-product-main">
                <div class="admin-product-info">
                    <strong>${product.name}</strong>
                    <span>$${product.price}</span>
                </div>
            </div>
            <div class="admin-product-actions">
                <button type="button" data-action="edit">Editar</button>
                <button type="button" data-action="delete">Eliminar</button>
            </div>
        `;

        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');

        editBtn.addEventListener('click', () => startEditProduct(product));
        deleteBtn.addEventListener('click', () => deleteProduct(product.id));

        container.appendChild(item);
    });
}

function startEditProduct(product) {
    editingProductId = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('image').value = product.image;
    document.getElementById('description').value = product.description;
    updateSubmitButtonLabel();
}

function updateSubmitButtonLabel() {
    const button = document.querySelector('#product-form button[type="submit"]');
    if (!button) return;
    button.textContent = editingProductId ? 'Guardar cambios' : 'Agregar Producto';
}

function startEditAdvisor(advisor) {
    editingAdvisorId = advisor.id;
    document.getElementById('advisor-name').value = advisor.name;
    document.getElementById('advisor-number').value = advisor.number;
    updateAdvisorSubmitButtonLabel();
}

function updateAdvisorSubmitButtonLabel() {
    const button = document.querySelector('#advisor-form button[type="submit"]');
    if (!button) return;
    button.textContent = editingAdvisorId ? 'Guardar cambios' : 'Agregar Asesor';
}

async function deleteAdvisor(id) {
    if (!confirm('¿Seguro que quieres eliminar este asesor?')) return;
    try {
        const response = await fetch(`/api/advisors/${id}`, {
            method: 'DELETE'
        });
        if (response.ok || response.status === 204) {
            fetchAndRenderAdminAdvisors();
        } else {
            alert('Error al eliminar asesor');
        }
    } catch (error) {
        console.error('Error al eliminar asesor:', error);
    }
}
