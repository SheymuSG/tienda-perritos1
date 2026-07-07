const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // ¡Descomentado para usar MySQL real!

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuración del pool de conexiones usando las variables de entorno de Kubernetes
const pool = mysql.createPool({
  host: process.env.DB_HOST || "tienda-db",
  user: process.env.DB_USER || "alumno",
  password: process.env.DB_PASSWORD || "alumno123",
  database: process.env.DB_NAME || "tienda_perritos",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Inicializar conexión a la base de datos
async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ ¡Conectado exitosamente a la base de datos MySQL!");
    connection.release();
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
  }
}

// Helper para manejar errores
function handleError(res, error, message = "Error interno del servidor") {
  console.error(error);
  res.status(500).json({ message });
}

// Obtener todos los productos (READ)
app.get("/api/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    handleError(res, err, "No se pudieron obtener los productos.");
  }
});

// Obtener un producto por ID
app.get("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err, "No se pudo obtener el producto.");
  }
});

// Crear un nuevo producto (CREATE)
app.post("/api/productos", async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ message: "Nombre, precio y stock son obligatorios." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre, descripcion || null, parseInt(precio), parseInt(stock)]
    );
    res.status(201).json({
      id: result.insertId,
      nombre,
      descripcion: descripcion || null,
      precio: parseInt(precio),
      stock: parseInt(stock)
    });
  } catch (err) {
    handleError(res, err, "No se pudo crear el Producto.");
  }
});

// Actualizar un producto (UPDATE)
app.put("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ message: "Nombre, Precio y Stock son obligatorios." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre, descripcion || null, parseInt(precio), parseInt(stock), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    
    res.json({ id: parseInt(id), nombre, descripcion, precio, stock });
  } catch (err) {
    handleError(res, err, "No se pudo actualizar el Producto.");
  }
});

// Eliminar un producto (DELETE)
app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json({ message: "Producto eliminado correctamente." });
  } catch (err) {
    handleError(res, err, "No se pudo eliminar el Producto.");
  }
});

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend de tienda de perritos en ejecución (Conectado a BD MySQL)." });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
  await initDb(); // Inicia la conexión a la base de datos al arrancar
});