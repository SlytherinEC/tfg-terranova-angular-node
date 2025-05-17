// backend/routes/game.js - Actualizado
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const estadoJuegoController = require('../controllers/EstadoJuegoController');
const partidaController = require('../controllers/PartidaController');
const mapaController = require('../controllers/MapaController');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas de gestión de partidas
router.post('/nueva', partidaController.nuevaPartida);
router.get('/partidas', partidaController.obtenerPartidas);
router.get('/partidas/:id_partida', partidaController.obtenerPartida);

// Nuevas rutas para el mapa
// router.get('/mapas/:id_partida', gameController.obtenerMapa);
// router.put('/mapas/:id_partida', gameController.actualizarMapa);

// Exploración y mapas (ahora usando mapaController)
router.post('/partidas/:id_partida/explorar', mapaController.explorarCelda);

// Rutas de acciones de juego
// router.post('/partidas/:id_partida/explorar', gameController.explorarHabitacion);
// router.post('/partidas/:id_partida/combate', gameController.resolverCombate);
// router.post('/partidas/:id_partida/sacrificar', gameController.sacrificarPasajero);
// router.post('/partidas/:id_partida/usar-item', gameController.usarItem);
// router.post('/partidas/:id_partida/resolver-evento', gameController.resolverEvento);
router.post('/partidas/:id_partida/combate', estadoJuegoController.resolverAtaque);
router.post('/partidas/:id_partida/resolver-evento', estadoJuegoController.registrarEvento);
router.post('/partidas/:id_partida/sacrificar', estadoJuegoController.finalizarEncuentro);

// Uso de ítems 
router.post('/partidas/:id_partida/usar-item', require('../controllers/InventarioController').usarItem);

module.exports = router;