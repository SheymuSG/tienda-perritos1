const express = require("express");
const cors = require("cors");
// const mysql = require("mysql2/promise"); // COMENTADO: Ya no usamos MySQL en EP3

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- MOCK DATA (Base de datos en memoria para la presentación) ---
let productosMock = [
  { id: 1, nombre: "Alimento Premium Cachorro", descripcion: "Sabor pollo, razas pequeñas", precio: 19990, stock: 10 },
  { id: 2, nombre: "Hueso de Juguete Resistente", descripcion: "Goma natural para morder", precio: 5500, stock: 25 },
  { id: 3, nombre: "Cama Ortopédica Grande", descripcion: "Espuma viscoelástica", precio: 34990, stock: 5 }
];
let nextId = 4;
// -----------------------------------------------------------------

/* 
// Inicializar pool de conexiones (COMENTADO PARA EVITAR EL ERROR 504)
async function initDb() { ... } 
*/

// Helper para manejar errores
function handleError(res, error, message = "Error interno del servidor") {
  console.error(error);
  res.status(500).json({ message });
}

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  try {
    // Ordenamos por ID descendente para imitar tu SQL original
    const ordenados = [...productosMock].sort((a, b) => b.id - a.id);
    res.json(ordenados);
  } catch (err) {
    handleError(res, err, "No se pudieron obtener los productos.");
  }
});

// Obtener un producto por ID
app.get("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const producto = productosMock.find(p => p.id === parseInt(id));
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json(producto);
  } catch (err) {
    handleError(res, err, "No se pudo obtener el producto.");
  }
});

// Crear un nuevo producto
app.post("/api/productos", async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ message: "Nombre, precio y stock son obligatorios." });
  }

  try {
    const nuevoProducto = {
      id: nextId++,
      nombre,
      descripcion: descripcion || null,
      precio: parseInt(precio),
      stock: parseInt(stock)
    };
    productosMock.push(nuevoProducto); // Lo guardamos en la memoria temporal
    res.status(201).json(nuevoProducto);
  } catch (err) {
    handleError(res, err, "No se pudo crear el Producto.");
  }
});

// Actualizar un producto
app.put("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ message: "Nombre, Precio y Stock son obligatorios." });
  }

  try {
    const index = productosMock.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    productosMock[index] = {
      ...productosMock[index],
      nombre,
      descripcion: descripcion || null,
      precio: parseInt(precio),
      stock: parseInt(stock)
    };
    res.json(productosMock[index]);
  } catch (err) {
    handleError(res, err, "No se pudo actualizar el Producto.");
  }
});

// Eliminar un producto
app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const index = productosMock.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    productosMock.splice(index, 1); // Lo borramos de la memoria temporal
    res.json({ message: "Producto eliminado correctamente." });
  } catch (err) {
    handleError(res, err, "No se pudo eliminar el Producto.");
  }
});

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend de tienda de perritos en ejecución (MOCK MODE)." });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor backend escuchando en puerto ${PORT} (Sin BD)`);
  // await initDb(); // COMENTADO PARA QUE ARRANQUE DE INMEDIATO
});