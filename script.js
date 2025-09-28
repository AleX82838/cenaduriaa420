let carrito = [];
let total = 0;

function agregarAlCarritoMultiple(producto, precio) {
  const cantidadInput = document.getElementById(`cantidad-${producto}`);
  const cantidad = parseInt(cantidadInput.value);

  if (cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  for (let i = 0; i < cantidad; i++) {
    carrito.push({ producto, precio });
    total += precio;
  }

  mostrarCarrito();
  actualizarContador();

  // Mostrar popup central
  mostrarPopup(`${cantidad} x ${producto} agregado al carrito 🛒`);
}

function mostrarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalElemento = document.getElementById("total");

  lista.innerHTML = "";
  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.producto} - $${item.precio} MXN`;

    // Botón eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.classList.add("btn");
    btnEliminar.style.background = "#900";
    btnEliminar.style.color = "#fff";
    btnEliminar.onclick = () => eliminarDelCarrito(index);

    li.appendChild(btnEliminar);
    lista.appendChild(li);
  });

  totalElemento.textContent = `Total: $${total} MXN`;
}

function eliminarDelCarrito(index) {
  total -= carrito[index].precio;
  carrito.splice(index, 1);
  mostrarCarrito();
  actualizarContador();
}

function actualizarContador() {
  const contador = document.getElementById("contador-carrito");
  contador.textContent = carrito.length;
}

// Popup
function mostrarPopup(mensaje) {
  const popup = document.getElementById("popup");
  popup.textContent = mensaje;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 1500);
}

// Modal y WhatsApp siguen igual
function mostrarResumen() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 😅");
    return;
  }
  const modal = document.getElementById("modal");
  const resumen = document.getElementById("resumen");

  resumen.innerHTML = "";
  carrito.forEach(item => {
    const p = document.createElement("p");
    p.textContent = `🍴 ${item.producto} - $${item.precio} MXN`;
    resumen.appendChild(p);
  });

  const totalP = document.createElement("p");
  totalP.innerHTML = `<strong>Total: $${total} MXN</strong>`;
  resumen.appendChild(totalP);

  modal.style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

function enviarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 😅");
    return;
  }

  let mensaje = "¡Hola! Quiero hacer el siguiente pedido:%0A%0A";
  carrito.forEach(item => {
    mensaje += `🍴 ${item.producto} - $${item.precio} MXN%0A`;
  });
  mensaje += `%0ATotal: $${total} MXN`;

  const telefono = "5215654595169"; // tu número
  const url = `https://wa.me/${telefono}?text=${mensaje}`;
  window.open(url, "_blank");
}
