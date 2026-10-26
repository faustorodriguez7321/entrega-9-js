class Perfume {
   constructor(id, nombre, precio, stock) {
      this.id = id;
      this.nombre = nombre;
      this.precio = precio;
      this.stock = stock;
   }

   vender() {
      if (this.stock > 0) {
         this.stock = this.stock - 1;
         return true;
      } else {
         return false;
      }
   }
}

function crearPerfumesIniciales() {
   const perfume1 = new Perfume(1, "Perfume floral", 45000, 10);
   const perfume2 = new Perfume(2, "Perfume cítrico", 38000, 8);
   const perfume3 = new Perfume(3, "Perfume amaderado", 52000, 5);

   return [perfume1, perfume2, perfume3];
}

const perfumesGuardados = JSON.parse(localStorage.getItem("perfumes"));
let perfumes = perfumesGuardados?.map(({ id, nombre, precio, stock }) => new Perfume(id, nombre, precio, stock)) ?? crearPerfumesIniciales();

const contenedor = document.getElementById("contenedor");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("nombre");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");
const inputBuscador = document.getElementById("buscador");
const aviso = document.getElementById("aviso");

function guardarPerfumes() {
   localStorage.setItem("perfumes", JSON.stringify(perfumes));
}

function obtenerPerfumes(servidorDisponible) {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         servidorDisponible
            ? resolve(perfumes)
            : reject(new Error("Servidor caído"));
      }, 1500);
   });
}

async function cargarPerfumes(servidorDisponible) {
   try {
      mostrarMensaje("Cargando perfumes...", "");
      inputBuscador.disabled = true;

      const perfumesCargados = await obtenerPerfumes(servidorDisponible);

      mostrarPerfumes(perfumesCargados);
      mostrarMensaje(perfumesCargados.length + " perfumes cargados", "exito");
   } catch (error) {
      mostrarMensaje("No se pudieron cargar los perfumes, intentá de nuevo", "error");
   } finally {
      inputBuscador.disabled = false;
   }
}

function mostrarAviso() {
   const unidades = perfumes.reduce((total, { stock }) => total + stock, 0);

   aviso.textContent = "Hoy hay " + perfumes.length + " perfumes en la lista y " + unidades + " unidades en stock";
}

function mostrarMensaje(texto, tipo) {
   mensaje.textContent = texto;
   mensaje.className = tipo;
}

function mostrarPerfumes(lista) {
   contenedor.innerHTML = "";

   lista.forEach(({ id, nombre, precio, stock }) => {
      contenedor.innerHTML += `
         <div class="tarjeta">
            <h3>${nombre}</h3>
            <p>Precio: $${precio}</p>
            <p>Stock: ${stock}</p>
            <button class="btn btn-comprar" value="${id}">Comprar</button>
            <button class="btn btn-eliminar" value="${id}">Eliminar</button>
         </div>`;
   });

   contenedor.querySelectorAll(".btn-comprar").forEach((boton) => {
      boton.addEventListener("click", (event) => comprarPerfume(event.target.value));
   });

   contenedor.querySelectorAll(".btn-eliminar").forEach((boton) => {
      boton.addEventListener("click", (event) => eliminarPerfume(event.target.value));
   });
}

function agregarPerfume() {
   const nombre = inputNombre.value;
   const precio = Number(inputPrecio.value);
   const stock = Number(inputStock.value);

   if (nombre == "" || precio <= 0 || stock <= 0) {
      mostrarMensaje("Complete nombre, precio y stock para agregar un perfume", "error");
      return;
   }

   const ultimoId = perfumes.reduce((mayor, perfume) => perfume.id > mayor ? perfume.id : mayor, 0);
   perfumes.push(new Perfume(ultimoId + 1, nombre, precio, stock));

   guardarPerfumes();
   mostrarPerfumes(perfumes);
   mostrarMensaje("Se agregó " + nombre + " a la lista", "exito");

   inputNombre.value = "";
   inputPrecio.value = "";
   inputStock.value = "";
}

function comprarPerfume(id) {
   const perfume = perfumes.find((p) => p.id == id);
   const vendido = perfume.vender();
   const { nombre, stock } = perfume;

   vendido
      ? mostrarMensaje("Compraste 1 " + nombre + ". Stock restante: " + stock, "exito")
      : mostrarMensaje(nombre + " no tiene stock", "error");

   guardarPerfumes();
   mostrarPerfumes(perfumes);
}

function eliminarPerfume(id) {
   const { nombre } = perfumes.find((p) => p.id == id);

   perfumes = perfumes.filter((p) => p.id != id);

   guardarPerfumes();
   mostrarPerfumes(perfumes);
   mostrarMensaje("Se eliminó " + nombre + " de la lista", "exito");
}

function restablecerPerfumes() {
   localStorage.clear();
   perfumes = crearPerfumesIniciales();

   mostrarPerfumes(perfumes);
   mostrarMensaje("Se restablecieron los perfumes iniciales", "exito");
}

function buscarPorNombre() {
   const texto = inputBuscador.value.toLowerCase();
   const encontrados = perfumes.filter((p) => p.nombre.toLowerCase().includes(texto));

   mostrarPerfumes(encontrados);
}

document.getElementById("btn-agregar").addEventListener("click", agregarPerfume);
document.getElementById("btn-restablecer").addEventListener("click", restablecerPerfumes);
inputBuscador.addEventListener("keyup", buscarPorNombre);

setTimeout(mostrarAviso, 4000);
cargarPerfumes(true);
