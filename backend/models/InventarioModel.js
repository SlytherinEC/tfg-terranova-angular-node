// backend/models/InventarioModel.js
const db = require('../config/db');

const InventarioModel = {
  /**
   * Crear un nuevo inventario para una partida
   * @param {number} id_partida - ID de la partida
   * @param {Array} armas - Lista inicial de armas
   * @param {Array} mochila - Lista inicial de items en mochila
   * @returns {Promise<number>} ID del inventario creado
   */
  crear: async (id_partida, armas = [], mochila = []) => {
    try {
      const [result] = await db.query(
        'INSERT INTO inventarios (id_partida, armas, mochila) VALUES (?, ?, ?)',
        [id_partida, JSON.stringify(armas), JSON.stringify(mochila)]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear inventario:', error);
      throw error;
    }
  },

  /**
   * Obtener el inventario de una partida
   * @param {number} id_partida - ID de la partida
   * @returns {Promise<Object|null>} Datos del inventario o null si no existe
   */
  obtenerPorPartida: async (id_partida) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM inventarios WHERE id_partida = ?',
        [id_partida]
      );
      
      if (rows.length === 0) return null;
      
      // Parsear los campos JSON
      const inventario = rows[0];
      return {
        id_inventario: inventario.id_inventario,
        id_partida: inventario.id_partida,
        armas: JSON.parse(inventario.armas || '[]'),
        mochila: JSON.parse(inventario.mochila || '[]')
      };
    } catch (error) {
      console.error('Error al obtener inventario por partida:', error);
      throw error;
    }
  },

  /**
   * Actualizar las armas del inventario
   * @param {number} id_partida - ID de la partida
   * @param {Array} armas - Nueva lista de armas
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarArmas: async (id_partida, armas) => {
    try {
      const [result] = await db.query(
        'UPDATE inventarios SET armas = ? WHERE id_partida = ?',
        [JSON.stringify(armas), id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar armas del inventario:', error);
      throw error;
    }
  },

  /**
   * Actualizar la mochila del inventario
   * @param {number} id_partida - ID de la partida
   * @param {Array} mochila - Nueva lista de items en mochila
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarMochila: async (id_partida, mochila) => {
    try {
      const [result] = await db.query(
        'UPDATE inventarios SET mochila = ? WHERE id_partida = ?',
        [JSON.stringify(mochila), id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar mochila del inventario:', error);
      throw error;
    }
  },

  /**
   * Agregar un item a la mochila
   * @param {number} id_partida - ID de la partida
   * @param {Object} item - Item a agregar
   * @returns {Promise<boolean>} True si se agregó correctamente
   */
  agregarItem: async (id_partida, item) => {
    try {
      // Obtener mochila actual
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Validar límite de mochila (5 items)
      if (inventario.mochila.length >= 5) {
        return false;
      }
      
      // Agregar el nuevo item
      const nuevaMochila = [...inventario.mochila, item];
      
      // Actualizar mochila
      return await InventarioModel.actualizarMochila(id_partida, nuevaMochila);
    } catch (error) {
      console.error('Error al agregar item a la mochila:', error);
      throw error;
    }
  },

  /**
   * Eliminar un item de la mochila por índice
   * @param {number} id_partida - ID de la partida
   * @param {number} indice - Índice del item a eliminar
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  eliminarItem: async (id_partida, indice) => {
    try {
      // Obtener mochila actual
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Validar índice
      if (indice < 0 || indice >= inventario.mochila.length) {
        return false;
      }
      
      // Eliminar el item
      const nuevaMochila = [...inventario.mochila];
      nuevaMochila.splice(indice, 1);
      
      // Actualizar mochila
      return await InventarioModel.actualizarMochila(id_partida, nuevaMochila);
    } catch (error) {
      console.error('Error al eliminar item de la mochila:', error);
      throw error;
    }
  },

  /**
   * Actualizar munición de un arma
   * @param {number} id_partida - ID de la partida
   * @param {string} nombreArma - Nombre del arma
   * @param {number} nuevaMunicion - Nueva cantidad de munición
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  actualizarMunicionArma: async (id_partida, nombreArma, nuevaMunicion) => {
    try {
      // Obtener armas actuales
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Buscar el arma
      const armas = [...inventario.armas];
      const indiceArma = armas.findIndex(arma => arma.nombre === nombreArma);
      
      if (indiceArma === -1) {
        return false;
      }
      
      // Actualizar munición (si no es Palanca, que tiene munición ilimitada)
      if (armas[indiceArma].municion !== null) {
        armas[indiceArma].municion = Math.min(
          armas[indiceArma].municion_max,
          nuevaMunicion
        );
      }
      
      // Actualizar armas
      return await InventarioModel.actualizarArmas(id_partida, armas);
    } catch (error) {
      console.error('Error al actualizar munición de arma:', error);
      throw error;
    }
  },

  /**
   * Recargar todas las armas a su munición máxima
   * @param {number} id_partida - ID de la partida
   * @returns {Promise<boolean>} True si se recargaron correctamente
   */
  recargarTodasLasArmas: async (id_partida) => {
    try {
      // Obtener armas actuales
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Recargar cada arma
      const armasRecargadas = inventario.armas.map(arma => ({
        ...arma,
        municion: arma.municion_max
      }));
      
      // Actualizar armas
      return await InventarioModel.actualizarArmas(id_partida, armasRecargadas);
    } catch (error) {
      console.error('Error al recargar todas las armas:', error);
      throw error;
    }
  },

  /**
   * Usar un item de la mochila (reducir usos y eliminarlo si llega a 0)
   * @param {number} id_partida - ID de la partida
   * @param {number} indice - Índice del item a usar
   * @returns {Promise<Object|false>} El item usado o false si falló
   */
  usarItem: async (id_partida, indice) => {
    try {
      // Obtener mochila actual
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Validar índice
      if (indice < 0 || indice >= inventario.mochila.length) {
        return false;
      }
      
      // Obtener el item
      const item = {...inventario.mochila[indice]};
      
      // Reducir usos
      item.usos -= 1;
      
      // Crear nueva mochila
      const nuevaMochila = [...inventario.mochila];
      
      // Si no quedan usos, eliminar el item
      if (item.usos <= 0) {
        nuevaMochila.splice(indice, 1);
      } else {
        // Actualizar el item
        nuevaMochila[indice] = item;
      }
      
      // Actualizar mochila
      const actualizado = await InventarioModel.actualizarMochila(id_partida, nuevaMochila);
      
      return actualizado ? item : false;
    } catch (error) {
      console.error('Error al usar item:', error);
      throw error;
    }
  }
};

module.exports = InventarioModel;