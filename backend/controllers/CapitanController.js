// backend/controllers/CapitanController.js
const CapitanService = require('../services/CapitanService');

const CapitanController = {
  /**
   * Obtener atributos del capitán de una partida
   */
  obtenerAtributos: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const atributos = await CapitanService.obtenerAtributos(id_partida, id_usuario);
        res.status(200).json(atributos);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Capitán no encontrado para esta partida') {
          return res.status(404).json({ mensaje: 'Capitán no encontrado para esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al obtener atributos del capitán:', error);
      res.status(500).json({ mensaje: 'Error al obtener atributos del capitán', error: error.message });
    }
  },

  /**
   * Actualizar atributos del capitán
   */
  actualizarAtributos: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { traje, estres, oxigeno } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const atributosActualizados = await CapitanService.actualizarAtributos(
          id_partida, 
          id_usuario, 
          { traje, estres, oxigeno }
        );
        
        res.status(200).json({
          mensaje: 'Atributos del capitán actualizados con éxito',
          ...atributosActualizados
        });
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'No se proporcionaron atributos para actualizar') {
          return res.status(400).json({ mensaje: 'No se proporcionaron atributos para actualizar' });
        }
        if (error.message === 'Capitán no encontrado para esta partida') {
          return res.status(404).json({ mensaje: 'Capitán no encontrado para esta partida' });
        }
        if (error.message.includes('debe estar entre')) {
          return res.status(400).json({ mensaje: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al actualizar atributos del capitán:', error);
      res.status(500).json({ mensaje: 'Error al actualizar atributos del capitán', error: error.message });
    }
  },

  /**
   * Reparar el traje del capitán (usado por ejemplo al usar ítems)
   */
  repararTraje: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { cantidad, registrarUsoItem = false } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const resultado = await CapitanService.repararTraje(
          id_partida,
          id_usuario,
          cantidad,
          registrarUsoItem
        );
        
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'La cantidad de reparación debe ser mayor que 0') {
          return res.status(400).json({ mensaje: error.message });
        }
        if (error.message === 'Capitán no encontrado para esta partida') {
          return res.status(404).json({ mensaje: 'Capitán no encontrado para esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al reparar traje:', error);
      res.status(500).json({ mensaje: 'Error al reparar traje', error: error.message });
    }
  },

  /**
   * Reducir estrés del capitán (usado por ejemplo al usar ítems)
   */
  reducirEstres: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { cantidad, registrarUsoItem = false } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const resultado = await CapitanService.reducirEstres(
          id_partida,
          id_usuario,
          cantidad,
          registrarUsoItem
        );
        
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'La cantidad de reducción debe ser mayor que 0') {
          return res.status(400).json({ mensaje: error.message });
        }
        if (error.message === 'Capitán no encontrado para esta partida') {
          return res.status(404).json({ mensaje: 'Capitán no encontrado para esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al reducir estrés:', error);
      res.status(500).json({ mensaje: 'Error al reducir estrés', error: error.message });
    }
  },

  /**
   * Recuperar oxígeno del capitán (usado por ejemplo al usar ítems o al visitar estaciones de O2)
   */
  recuperarOxigeno: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { cantidad, registrarUsoItem = false } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const resultado = await CapitanService.recuperarOxigeno(
          id_partida,
          id_usuario,
          cantidad,
          registrarUsoItem
        );
        
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'La cantidad de oxígeno debe ser mayor que 0') {
          return res.status(400).json({ mensaje: error.message });
        }
        if (error.message === 'Capitán no encontrado para esta partida') {
          return res.status(404).json({ mensaje: 'Capitán no encontrado para esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al recuperar oxígeno:', error);
      res.status(500).json({ mensaje: 'Error al recuperar oxígeno', error: error.message });
    }
  }
};

module.exports = CapitanController;