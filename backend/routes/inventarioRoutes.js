// backend/routes/inventarioRoutes.js
const express = require('express');
const router = express.Router();
const InventarioController = require('../controllers/InventarioController');
const { verificarToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas para el inventario
router.get('/partidas/:id_partida/inventario', InventarioController.obtenerInventario);

// Rutas para la mochila
router.post('/partidas/:id_partida/inventario/usar-item', InventarioController.usarItem);
router.post('/partidas/:id_partida/inventario/agregar-item', InventarioController.agregarItem);
router.post('/partidas/:id_partida/inventario/eliminar-item', InventarioController.eliminarItem);

// Rutas para las armas
router.post('/partidas/:id_partida/inventario/recargar-arma', InventarioController.recargarArma);
router.post('/partidas/:id_partida/inventario/recargar-todas', InventarioController.recargarTodasLasArmas);

// Ruta para generar item aleatorio
router.get('/items/aleatorio', InventarioController.generarItemAleatorio);

module.exports = router;