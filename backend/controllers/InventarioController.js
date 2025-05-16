// backend/controllers/InventarioController.js
const InventarioService = require('../services/InventarioService');

const InventarioController = {
  /**
   * Obtener inventario completo de una partida
   */
  obtenerInventario: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const inventario = await InventarioService.obtenerInventario(id_partida, id_usuario);
        res.status(200).json(inventario);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Inventario no encontrado') {
          return res.status(404).json({ mensaje: 'Inventario no encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({ mensaje: 'Error al obtener inventario', error: error.message });
    }
  },

  /**
   * Usar un item del inventario
   */
  usarItem: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { indiceItem } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (indiceItem === undefined || indiceItem < 0) {
        return res.status(400).json({ mensaje: 'Índice de ítem no válido' });
      }
      
      try {
        const resultado = await InventarioService.usarItem(id_partida, id_usuario, indiceItem);
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Inventario no encontrado') {
          return res.status(404).json({ mensaje: 'Inventario no encontrado' });
        }
        if (error.message === 'Ítem no encontrado') {
          return res.status(404).json({ mensaje: 'Ítem no encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al usar item:', error);
      res.status(500).json({ mensaje: 'Error al usar item', error: error.message });
    }
  },

  /**
   * Recargar un arma específica
   */
  recargarArma: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { nombreArma, cantidad = 1 } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (!nombreArma) {
        return res.status(400).json({ mensaje: 'Nombre de arma no proporcionado' });
      }
      
      if (cantidad <= 0) {
        return res.status(400).json({ mensaje: 'La cantidad debe ser mayor que 0' });
      }
      
      try {
        const resultado = await InventarioService.recargarArma(id_partida, id_usuario, nombreArma, cantidad);
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Inventario no encontrado') {
          return res.status(404).json({ mensaje: 'Inventario no encontrado' });
        }
        if (error.message === 'Arma no encontrada') {
          return res.status(404).json({ mensaje: 'Arma no encontrada' });
        }
        if (error.message === 'Esta arma no utiliza munición') {
          return res.status(400).json({ mensaje: 'Esta arma no utiliza munición' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al recargar arma:', error);
      res.status(500).json({ mensaje: 'Error al recargar arma', error: error.message });
    }
  },

  /**
   * Recargar todas las armas (por ejemplo, en una armería)
   */
  recargarTodasLasArmas: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;
      
      try {
        const resultado = await InventarioService.recargarTodasLasArmas(id_partida, id_usuario);
        res.status(200).json(resultado);
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
      console.error('Error al recargar todas las armas:', error);
      res.status(500).json({ mensaje: 'Error al recargar todas las armas', error: error.message });
    }
  },

  /**
   * Agregar un item a la mochila
   */
  agregarItem: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { item } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (!item || !item.nombre) {
        return res.status(400).json({ mensaje: 'Datos de ítem incompletos' });
      }
      
      try {
        const resultado = await InventarioService.agregarItem(id_partida, id_usuario, item);
        
        if (!resultado.exito) {
          return res.status(400).json(resultado);
        }
        
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Inventario no encontrado') {
          return res.status(404).json({ mensaje: 'Inventario no encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al agregar item:', error);
      res.status(500).json({ mensaje: 'Error al agregar item', error: error.message });
    }
  },

  /**
   * Eliminar un item de la mochila
   */
  eliminarItem: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { indiceItem } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (indiceItem === undefined || indiceItem < 0) {
        return res.status(400).json({ mensaje: 'Índice de ítem no válido' });
      }
      
      try {
        const resultado = await InventarioService.eliminarItem(id_partida, id_usuario, indiceItem);
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Inventario no encontrado') {
          return res.status(404).json({ mensaje: 'Inventario no encontrado' });
        }
        if (error.message === 'Ítem no encontrado') {
          return res.status(404).json({ mensaje: 'Ítem no encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
      res.status(500).json({ mensaje: 'Error al eliminar item', error: error.message });
    }
  },

  /**
   * Generar un item aleatorio (usado principalmente en habitaciones de bahía de carga)
   */
  generarItemAleatorio: async (req, res) => {
    try {
      const item = InventarioService.generarItemAleatorio();
      res.status(200).json(item);
    } catch (error) {
      console.error('Error al generar item aleatorio:', error);
      res.status(500).json({ mensaje: 'Error al generar item aleatorio', error: error.message });
    }
  }
};

module.exports = InventarioController;