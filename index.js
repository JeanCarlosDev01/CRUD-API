const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbproductos',
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
  } else {
    console.log('Conexión exitosa a MySQL');
  }
});

// Middleware para parsear JSON
app.use(bodyParser.json());

// Swagger Options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Productos',
      version: '1.0.0',
      description: 'API para gestionar productos',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['index.js'],
};

// Middleware de Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - pr_nombre
 *         - pr_precio
 *         - pr_categoria
 *         - pr_desc
 *       properties:
 *         pr_nombre:
 *           type: string
 *           description: Nombre del producto
 *         pr_precio:
 *           type: number
 *           description: Precio del producto
 *         pr_categoria:
 *           type: string
 *           description: Categoría del producto
 *         pr_desc:
 *           type: string
 *           description: Descripción del producto
 */

// Rutas CRUD

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Endpoints para gestionar productos
 */

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       500:
 *         description: Error del servidor
 */
app.post('/productos', (req, res) => {
    const { pr_nombre, pr_precio, pr_categoria, pr_desc } = req.body;
    const sql = 'INSERT INTO productos (pr_nombre, pr_precio, pr_categoria, pr_desc) VALUES (?, ?, ?, ?)';
    connection.query(sql, [pr_nombre, pr_precio, pr_categoria, pr_desc], (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send({ mensaje: 'Producto creado correctamente', id: result.insertId });
      }
    });
  });

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 *       500:
 *         description: Error del servidor
 */
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    connection.query(sql, (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(results);
      }
    });
});

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
app.get('/productos/:id', (req, res) => {
    const sql = 'SELECT * FROM productos WHERE pr_id = ?';
  connection.query(sql, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else if (results.length === 0) {
      res.status(404).send({ mensaje: 'Producto no encontrado' });
    } else {
      res.status(200).send(results[0]);
    }
  });
});

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
app.put('/productos/:id', (req, res) => {
    const { pr_nombre, pr_precio, pr_categoria, pr_desc } = req.body;
  const sql = 'UPDATE productos SET pr_nombre = ?, pr_precio = ?, pr_categoria = ?, pr_desc = ? WHERE pr_id = ?';
  connection.query(sql, [pr_nombre, pr_precio, pr_categoria, pr_desc, req.params.id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send({ mensaje: 'Producto no encontrado' });
    } else {
      res.status(200).send({ mensaje: 'Producto actualizado correctamente' });
    }
  });
});

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
app.delete('/productos/:id', (req, res) => {
    const sql = 'DELETE FROM productos WHERE pr_id = ?';
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send({ mensaje: 'Producto no encontrado' });
    } else {
      res.status(200).send({ mensaje: 'Producto eliminado correctamente' });
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
