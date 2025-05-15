// backend/routes/partidasRoutes.js
const express = require('express');
const router = express.Router();
const PartidaController = require('../controllers/PartidaController');
const { verificarToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas de gestión de partidas
router.post('/nueva', PartidaController.nuevaPartida);
router.get('/partidas', PartidaController.obtenerPartidas);
router.get('/partidas/:id_partida', PartidaController.obtenerPartida);
router.delete('/partidas/:id_partida', PartidaController.eliminarPartida);

module.exports = router;