// backend/routes/estadoJuegoRoutes.js
const express = require('express');
const router = express.Router();
const EstadoJuegoController = require('../controllers/EstadoJuegoController');
const { verificarToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas para el estado de juego
router.get('/partidas/:id_partida/estado', EstadoJuegoController.obtenerEstadoJuego);

// Rutas para encuentros
router.post('/partidas/:id_partida/encuentros', EstadoJuegoController.iniciarEncuentro);
router.post('/partidas/:id_partida/encuentros/ataque', EstadoJuegoController.resolverAtaque);
router.post('/partidas/:id_partida/encuentros/finalizar', EstadoJuegoController.finalizarEncuentro);

// Rutas para eventos
router.post('/partidas/:id_partida/eventos', EstadoJuegoController.registrarEvento);

// Rutas para logros
router.post('/partidas/:id_partida/logros', EstadoJuegoController.desbloquearLogro);
router.post('/partidas/:id_partida/logros/verificar', EstadoJuegoController.verificarLogros);

module.exports = router;