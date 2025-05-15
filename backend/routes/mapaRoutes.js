// backend/routes/mapaRoutes.js
const express = require('express');
const router = express.Router();
const MapaController = require('../controllers/MapaController');
const { verificarToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas de gestión de mapas
router.get('/partidas/:id_partida/mapa', MapaController.obtenerMapa);
router.post('/partidas/:id_partida/explorar', MapaController.explorarCelda);
router.put('/partidas/:id_partida/posicion', MapaController.actualizarPosicion);

module.exports = router;