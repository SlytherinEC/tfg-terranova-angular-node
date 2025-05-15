// backend/controllers/MapaController.js
const MapaService = require('../services/MapaService');

const MapaController = {
  /**
   * Obtener mapa de una partida
   */
  obtenerMapa: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;
      
      if (!id_partida) {
        return res.status(400).json({ mensaje: 'ID de partida no proporcionado' });
      }
      
      // Verificar que el usuario puede acceder a la partida
      const mapa = await MapaService.obtenerMapaConVerificacion(id_partida, id_usuario);
      
      res.status(200).json({ mapa });
    } catch (error) {
      console.error('Error al obtener mapa:', error);
      
      if (error.message === 'Partida no encontrada') {
        return res.status(404).json({ mensaje: 'Partida no encontrada' });
      }
      
      if (error.message === 'No tienes permiso para acceder a esta partida') {
        return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
      }
      
      res.status(500).json({ mensaje: 'Error al obtener mapa', error: error.message });
    }
  },

  /**
   * Explorar celda del mapa
   */
  explorarCelda: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { coordenadas } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (!id_partida) {
        return res.status(400).json({ mensaje: 'ID de partida no proporcionado' });
      }
      
      if (!coordenadas || typeof coordenadas.x !== 'number' || typeof coordenadas.y !== 'number') {
        return res.status(400).json({ mensaje: 'Coordenadas inválidas' });
      }
      
      // Verificar acceso del usuario
      try {
        await MapaService.verificarAccesoUsuario(id_partida, id_usuario);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        throw error;
      }
      
      // Explorar celda
      const resultado = await MapaService.explorarCelda(id_partida, coordenadas);
      
      if (!resultado.exito) {
        // Si es derrota por falta de oxígeno u otra razón, devolver código apropiado
        if (resultado.resultado === 'derrota') {
          return res.status(200).json(resultado);
        }
        return res.status(400).json({ mensaje: resultado.mensaje });
      }
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al explorar celda:', error);
      res.status(500).json({ mensaje: 'Error al explorar celda', error: error.message });
    }
  },

  /**
   * Actualizar posición actual
   */
  actualizarPosicion: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { x, y } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (!id_partida) {
        return res.status(400).json({ mensaje: 'ID de partida no proporcionado' });
      }
      
      if (typeof x !== 'number' || typeof y !== 'number') {
        return res.status(400).json({ mensaje: 'Coordenadas inválidas' });
      }
      
      // Verificar acceso del usuario
      try {
        await MapaService.verificarAccesoUsuario(id_partida, id_usuario);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        throw error;
      }
      
      // Verificar si el movimiento es válido
      const verificacion = await MapaService.esMovimientoValido(id_partida, { x, y });
      if (!verificacion.valido) {
        return res.status(400).json({ mensaje: verificacion.mensaje });
      }
      
      // Actualizar posición
      await MapaService.actualizarPosicion(id_partida, x, y);
      
      res.status(200).json({ mensaje: 'Posición actualizada con éxito' });
    } catch (error) {
      console.error('Error al actualizar posición:', error);
      res.status(500).json({ mensaje: 'Error al actualizar posición', error: error.message });
    }
  }
};

module.exports = MapaController;