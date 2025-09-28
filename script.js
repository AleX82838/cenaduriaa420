let carrito = [];
let total = 0;
let ubicacionTexto = "";

// ===== Cargar carrito guardado =====
document.addEventListener("DOMContentLoaded", () => {
  const data = localStorage.getItem("carrito");
  const totalGuardado = localStorage.getItem("total");
  if (data) {
    carrito = JSON.parse(data);
    total = parseFloat(totalGuardado);
    mostrarCarrito();
    actualizarContador();
  }
});

// ===== Guardar en localStorage =====
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("total", total);
}

// ===== Agregar al carrito =====
function agregarAlCarrito(producto, precio, inputId) {
  const cantidadInput = document.getElementById(inputId);
  if (!cantidadInput) {
    console.error("❌ No se encontró el input con ID:", inputId);
    return;
  }

  const cantidad = parseInt(cantidadInput.value);

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  let item = carrito.find(p => p.producto === producto);
  if (item) {
    item.cantidad += cantidad;
  } else {
    carrito.push({ producto, precio, cantidad });
  }
  total += precio * cantidad;

  mostrarCarrito();
  actualizarContador();
  guardarCarrito();

  mostrarPopup(`${cantidad} x ${producto} agregado al carrito 🛒`);
}

// ===== Mostrar carrito =====
function mostrarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalElemento = document.getElementById("total");
  lista.innerHTML = "";

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.producto} x${item.cantidad} — $${item.precio * item.cantidad} MXN`;

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

// ===== Eliminar producto =====
function eliminarDelCarrito(index) {
  total -= carrito[index].precio * carrito[index].cantidad;
  carrito.splice(index, 1);
  mostrarCarrito();
  actualizarContador();
  guardarCarrito();
}

// ===== Contador =====
function actualizarContador() {
  document.getElementById("contador-carrito").textContent =
    carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

// ===== Popup =====
function mostrarPopup(mensaje) {
  const popup = document.getElementById("popup");
  popup.textContent = mensaje;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 1500);
}

// ===== Modal Carrito =====
function abrirCarrito() {
  document.getElementById("modal-carrito").style.display = "flex";
}
function cerrarCarrito() {
  document.getElementById("modal-carrito").style.display = "none";
}

// ===== WhatsApp =====
function enviarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 😅");
    return;
  }

  let mensaje = "¡Hola! Quiero hacer el siguiente pedido:%0A%0A";
  carrito.forEach(item => {
    mensaje += `🍴 ${item.producto} x${item.cantidad} - $${item.precio * item.cantidad} MXN%0A`;
  });
  mensaje += `%0ATotal: $${total} MXN`;

  if (ubicacionTexto) {
    mensaje += `%0A📍 Mi ubicación: ${ubicacionTexto}`;
  }

  const telefono = "5215654595169"; // tu número con lada
  const url = `https://wa.me/${telefono}?text=${mensaje}`;
  window.open(url, "_blank");
}

// ===== Búsqueda y filtros =====
function buscarProducto() {
  let input = document.getElementById("busqueda").value.toLowerCase();
  let cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    let nombre = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = nombre.includes(input) ? "block" : "none";
  });
}
function filtrarCategoria(categoria) {
  let cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.style.display = (categoria === "all" || card.classList.contains(categoria)) ? "block" : "none";
  });
}

// ===== Geolocalización =====
function obtenerUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      ubicacionTexto = `https://www.google.com/maps?q=${lat},${lon}`;
      document.getElementById("ubicacion").innerHTML =
        `📍 Ubicación detectada: <a href="${ubicacionTexto}" target="_blank">Ver en mapa</a>`;
    }, () => {
      alert("No pudimos obtener tu ubicación 😅");
    });
  } else {
    alert("Tu navegador no soporta geolocalización.");
  }
}
