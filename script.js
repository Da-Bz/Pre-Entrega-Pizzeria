// DOMContentLoaded: Validación del Formulario
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit-form');
    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, ingrese un email válido.');
                return;
            }

            if (!name || !email || !message) {
                alert('Por favor, complete todos los campos.');
            } else {
                alert('¡Formulario enviado con éxito!');
                document.getElementById('contact-form').submit();
            }
        });
    }
});

// DOMContentLoaded: Funciones del Carrito
document.addEventListener('DOMContentLoaded', () => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let productos = [];

    // Actualizar Icono del Carrito
    function updateCartIcon() {
        const cartCount = carrito.reduce((total, producto) => total + producto.cantidad, 0);
        const cartIcon = document.querySelector('.cart-count');
        if (cartIcon) {
            cartIcon.textContent = cartCount;
        }
        console.log('Total de productos en el carrito:', cartCount);
    }

    // Renderizar Productos
    function renderProductos(productos, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`No se encontró el contenedor: ${containerSelector}`);
            return;
        }

        container.innerHTML = '';
        productos.forEach(producto => {
            console.log('Producto en render:', producto);
            container.innerHTML += `
                <div class="card">
                    <img src="${producto.image}" alt="${producto.title}">
                    <div class="content">
                        <h3>${producto.title}</h3>
                        <p>${producto.description}</p>
                        <h4>$${producto.price}</h4>
                        <button class="btn" data-id="${producto.id}">Agregar al carrito</button>
                    </div>
                </div>
            `;
        });
    }

    // Renderizar Carrito
    function renderCarrito() {
        const cartContainer = document.querySelector('.shopping-cart');
        const cartItems = document.getElementById('cart-items');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const discountRow = document.getElementById('discount-row');
        const discountElement = document.getElementById('discount');
        const emptyMessage = document.getElementById('empty-cart-message');
    
        if (!cartContainer || !cartItems || !subtotalElement || !totalElement || !emptyMessage || !discountRow || !discountElement) {
            console.error('Faltan elementos necesarios en el HTML para renderizar el carrito.');
            return;
        }
    
        // Verificar si el carrito está vacío
        if (carrito.length === 0) {
            cartContainer.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        } else {
            cartContainer.style.display = 'block';
            emptyMessage.style.display = 'none';
        }
    
        cartItems.innerHTML = ''; // Limpia el contenido previo
        let subtotal = 0;
    
        carrito.forEach((producto, index) => {
            const nombre = producto.nombre || producto.title || 'Producto sin nombre';
            const precio = producto.precio || producto.price || 0;
            const cantidad = producto.cantidad || 1;
            const imagen = producto.img || producto.image || 'img/default.png';
            const productoSubtotal = precio * cantidad;
            subtotal += productoSubtotal;
    
            cartItems.innerHTML += `
                <tr>
                    <td class="prod-info">
                        <img src="${imagen}" alt="${nombre}" class="prod-img">
                        <span>${nombre}</span>
                    </td>
                    <td class="prod-price">$${precio.toFixed(2)}</td>
                    <td class="prod-quantity">
                        <input type="number" value="${cantidad}" min="1" data-index="${index}" class="input-quantity">
                    </td>
                    <td class="prod-subtotal">$${productoSubtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn-remove" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
        // Aplicar descuento si hay un cupón válido
        const couponCode = localStorage.getItem('coupon');
        let discount = 0;
    
        if (couponCode === 'DESCUENTO10') {
            discount = subtotal * 0.1; // 10% de descuento
            discountRow.style.display = 'block';
            discountElement.textContent = `-$${discount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
            discountElement.textContent = '$0.00';
        }
    
        const total = subtotal - discount;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Consumir JSON para cargar productos
    fetch('./data/products.json')
        .then(response => response.json())
        .then(data => {
            console.log('Datos cargados desde JSON:', data);

            productos = [...data.Promociones, ...data.NuestraCarta];
            productos.forEach((producto, index) => {
                if (!producto.id) producto.id = index + 1; // Crear un ID único si no existe
            });

            renderProductos(data.Promociones, '.promos-container');
            renderProductos(data.NuestraCarta, '.carta-container');
        })
        .catch(error => console.error('Error al cargar JSON:', error));

    // Manejar cambios en la cantidad
    document.addEventListener('input', (event) => {
        if (event.target.classList.contains('input-quantity')) {
            const index = parseInt(event.target.dataset.index);
            const nuevaCantidad = parseInt(event.target.value);

            if (nuevaCantidad > 0) {
                carrito[index].cantidad = nuevaCantidad;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                renderCarrito();
                updateCartIcon();
            }
        }
    });

    // Manejar eliminación de productos
    document.addEventListener('click', (event) => {
        const btnRemove = event.target.closest('.btn-remove');
        if (btnRemove) {
            const index = parseInt(btnRemove.dataset.index);
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderCarrito();
            updateCartIcon();
        }
    });

    // Manejar cupones de descuento
    document.getElementById('coupon-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const couponCode = document.getElementById('coupon-code').value.trim();

    if (couponCode === 'DESCUENTO10') {
        localStorage.setItem('coupon', couponCode);
        alert('Cupón aplicado con éxito. ¡10% de descuento!');
    } else {
        alert('Cupón no válido.');
        localStorage.removeItem('coupon');
    }
    renderCarrito(); // Volver a renderizar el carrito con el descuento aplicado
});

    // Manejar el botón "Agregar al carrito"
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn')) {
            const productoId = parseInt(event.target.dataset.id);
            console.log('Producto agregado con ID:', productoId);

            const producto = productos.find(p => p.id === productoId);
            if (producto) {
                const productoEnCarrito = carrito.find(p => p.id === productoId);
                if (productoEnCarrito) {
                    productoEnCarrito.cantidad++;
                } else {
                    carrito.push({ ...producto, cantidad: 1 });
                }

                localStorage.setItem('carrito', JSON.stringify(carrito));
                updateCartIcon();
                alert(`${producto.title} agregado al carrito.`);
            } else {
                console.error(`Producto con ID ${productoId} no encontrado.`);
            }
        }
    });

    updateCartIcon();
    renderCarrito();
});
