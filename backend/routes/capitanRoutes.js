// backend/routes/capitanRoutes.js
const express = require('express');
const router = express.Router();
const CapitanController = require('../controllers/CapitanController');
const { verificarToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas para el capitán
router.get('/partidas/:id_partida/capitan', CapitanController.obtenerAtributos);
router.put('/partidas/:id_partida/capitan', CapitanController.actualizarAtributos);

// Rutas específicas para acciones del capitán
router.post('/partidas/:id_partida/capitan/traje', CapitanController.repararTraje);
router.post('/partidas/:id_partida/capitan/estres', CapitanController.reducirEstres);
router.post('/partidas/:id_partida/capitan/oxigeno', CapitanController.recuperarOxigeno);

module.exports = router;