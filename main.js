let carrito = [];
let informacionUsuario = {};

function agregarEntrada(entrada) {
    Swal.fire({
        title: `Ingrese la cantidad de entradas ${entrada.tipo} a comprar:`,
        input: 'number',
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || value <= 0) {
                return 'La cantidad ingresada no es válida. Por favor, ingrese una cantidad válida.';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const cantidad = parseInt(result.value);
            if (entrada.cantidad < cantidad) {
                Swal.fire('Lo siento, no hay suficientes entradas disponibles en esa ubicación.');
                return;
            }

            const subtotal = entrada.precio * cantidad;
            const entradaExistente = carrito.find((e) => e.tipo === entrada.tipo);

            if (entradaExistente) {
                entradaExistente.cantidad += cantidad;
                entradaExistente.subtotal += subtotal;
            } else {
                carrito.push({ tipo: entrada.tipo, precio: entrada.precio, cantidad, subtotal });
            }

            // ACTUALIZAR STOCK DE ENTRADAS
            entrada.cantidad -= cantidad;
            Swal.fire('Entradas agregadas!', `Se agregaron ${cantidad} entradas ${entrada.tipo} al carrito.`, 'success');

            localStorage.setItem('carrito', JSON.stringify(carrito));
            mostrarCarrito();
        }
    });
}

function mostrarEntradasDisponibles() {
    const container = document.getElementById('entradas-container');
    container.innerHTML = '';

    entradasDisponibles.forEach(entrada => {
        const boton = document.createElement('button');
        boton.textContent = entrada.tipo;
        boton.classList.add('button');
        boton.addEventListener('click', () => agregarEntrada(entrada));
        container.appendChild(boton);
    });
}

function mostrarCarrito() {
    const carritoContenedor = document.getElementById('carrito-container');
    carritoContenedor.innerHTML = '';

    const carritoAlmacenado = JSON.parse(localStorage.getItem('carrito'));
    const informacionUsuarioAlmacenada = JSON.parse(localStorage.getItem('informacionUsuario'));

    if (carritoAlmacenado && carritoAlmacenado.length > 0) {
        let total = 0;
        carritoAlmacenado.forEach(entrada => {
            const entradaElement = document.createElement('p');
            entradaElement.textContent = `${entrada.cantidad} entradas ${entrada.tipo} $${entrada.precio} cada una. Subtotal: $${entrada.subtotal}`;
            carritoContenedor.appendChild(entradaElement);
            total += entrada.subtotal;
        });

        const totalElement = document.createElement('p');
        totalElement.textContent = `Total: $${total}`;
        carritoContenedor.appendChild(totalElement);
    } else {
        carritoContenedor.textContent = 'El carrito está vacío.';
    }
}

function toggleCarrito() {
    const carritoContenedor = document.getElementById('carrito-container');
    carritoContenedor.classList.toggle('hidden');
    if (!carritoContenedor.classList.contains('hidden')) {
        mostrarCarrito();
    }
}

function realizarCompra() {
    if (carrito.length === 0) {
        Swal.fire('El carrito está vacío. No se puede realizar la compra.');
        return;
    }

    const camposUsuarioDiv = document.getElementById('campos-usuario');
    camposUsuarioDiv.style.display = 'block';
}

localStorage.setItem('informacionUsuario', JSON.stringify(informacionUsuario));
localStorage.removeItem('carrito');
carrito = [];
mostrarCarrito();

function confirmarCompra() {
    const nombreInput = document.querySelector('#campos-usuario input[type="text"]');
    const telefonoInput = document.querySelector('#campos-usuario input[type="tel"]');
    const emailInput = document.querySelector('#campos-usuario input[type="email"]');

    const nombre = nombreInput.value;
    const telefono = telefonoInput.value;
    const email = emailInput.value;

    if (nombre === '' || telefono === '' || email === '') {
        Swal.fire('Por favor, complete todos los campos.');
        return;
    }

    informacionUsuario = {
        nombre,
        telefono,
        email
    };

    Swal.fire('Se ha realizado la reserva de entradas satisfactoriamente', 'Por email le estaremos enviando el codigo para proceder con el pago.');

    // RESETEAR CARRITO
    carrito = [];

    // RESETEAR CAMPOS USUARIO Y OCULTARLOS
    nombreInput.value = '';
    telefonoInput.value = '';
    emailInput.value = '';
    document.getElementById('campos-usuario').style.display = 'none';

    //ELIMINAR CARRITO DEL STORAGE
    localStorage.removeItem('carrito');
    mostrarCarrito();
}

let entradasDisponibles = [];

fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        entradasDisponibles = data;
        mostrarEntradasDisponibles();

        const mostrarCarritoButton = document.createElement('button');
        mostrarCarritoButton.textContent = 'Mostrar carrito';
        mostrarCarritoButton.classList.add('buttonCarrito');
        mostrarCarritoButton.addEventListener('click', toggleCarrito);
        document.getElementById('carrito-button-container').appendChild(mostrarCarritoButton);

        const realizarCompraButton = document.createElement('button');
        realizarCompraButton.textContent = 'Realizar compra';
        realizarCompraButton.classList.add('buttonCompra');
        realizarCompraButton.addEventListener('click', () => {
            if (carrito.length > 0) {
                realizarCompra();
            } else {
                Swal.fire('El carrito está vacío. No se puede realizar la compra.');
            }
        });
        document.getElementById('carrito-button-container').appendChild(realizarCompraButton);
    })
    .catch(error => {
        console.error('Error al obtener los datos de data.json:', error);
    });

const confirmarCompraButton = document.getElementById('confirmar-compra-button');
confirmarCompraButton.addEventListener('click', confirmarCompra);

const carritoAlmacenado = JSON.parse(localStorage.getItem('carrito'));
const informacionUsuarioAlmacenada = JSON.parse(localStorage.getItem('informacionUsuario'));

if (carritoAlmacenado) {
    carrito = carritoAlmacenado;
}

if (informacionUsuarioAlmacenada) {
    informacionUsuario = informacionUsuarioAlmacenada;
}

mostrarEntradasDisponibles();