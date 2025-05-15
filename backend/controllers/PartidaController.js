// backend/controllers/PartidaController.js
const PartidaService = require('../services/PartidaService');

const PartidaController = {
  /**
   * Crear una nueva partida
   */
  nuevaPartida: async (req, res) => {
    try {
      const id_usuario = req.usuario.id_usuario;
      const { dificultad = 'NORMAL' } = req.body;
      
      // Validar dificultad
      const dificultadesValidas = ['MUY_FACIL', 'NORMAL', 'DIFICIL', 'LOCURA'];
      if (!dificultadesValidas.includes(dificultad)) {
        return res.status(400).json({ mensaje: 'Dificultad no válida' });
      }
      
      const resultado = await PartidaService.crearNuevaPartida(id_usuario, dificultad);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al crear partida:', error);
      res.status(500).json({ mensaje: 'Error al crear partida', error: error.message });
    }
  },

  /**
   * Obtener todas las partidas del usuario
   */
  obtenerPartidas: async (req, res) => {
    try {
      const id_usuario = req.usuario.id_usuario;
      const partidas = await PartidaService.obtenerPartidasUsuario(id_usuario);
      
      res.status(200).json(partidas);
    } catch (error) {
      console.error('Error al obtener partidas:', error);
      res.status(500).json({ mensaje: 'Error al obtener partidas', error: error.message });
    }
  },

  /**
   * Obtener una partida específica
   */
  obtenerPartida: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;
      
      if (!id_partida) {
        return res.status(400).json({ mensaje: 'ID de partida no proporcionado' });
      }
      
      try {
        const partida = await PartidaService.obtenerPartida(id_partida, id_usuario);
        res.status(200).json(partida);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al obtener partida:', error);
      res.status(500).json({ mensaje: 'Error al obtener partida', error: error.message });
    }
  },

  /**
   * Eliminar una partida
   */
  eliminarPartida: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;
      
      if (!id_partida) {
        return res.status(400).json({ mensaje: 'ID de partida no proporcionado' });
      }
      
      // Verificar que la partida pertenece al usuario
      try {
        await PartidaService.obtenerPartida(id_partida, id_usuario);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        throw error;
      }
      
      // Eliminar partida (este método debería implementarse en el servicio)
      await PartidaService.eliminarPartida(id_partida);
      
      res.status(200).json({ mensaje: 'Partida eliminada con éxito' });
    } catch (error) {
      console.error('Error al eliminar partida:', error);
      res.status(500).json({ mensaje: 'Error al eliminar partida', error: error.message });
    }
  }
};

module.exports = PartidaController;