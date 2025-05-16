// backend/models/CapitanModel.js
const db = require('../config/db');

const CapitanModel = {
  /**
   * Crear un nuevo capitán para una partida
   * @param {number} id_partida - ID de la partida
   * @param {Object} datosCapitan - Datos iniciales del capitán
   * @returns {Promise<number>} ID del capitán creado
   */
  crear: async (id_partida, datosCapitan = {}) => {
    try {
      const { traje = 6, estres = 0, oxigeno = 10 } = datosCapitan;
      
      const [result] = await db.query(
        'INSERT INTO capitanes (id_partida, traje, estres, oxigeno) VALUES (?, ?, ?, ?)',
        [id_partida, traje, estres, oxigeno]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear capitán:', error);
      throw error;
    }
  },

  /**
   * Obtener un capitán por ID de partida
   * @param {number} id_partida - ID de la partida
   * @returns {Promise<Object|null>} Datos del capitán o null si no existe
   */
  obtenerPorPartida: async (id_partida) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM capitanes WHERE id_partida = ?',
        [id_partida]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al obtener capitán por partida:', error);
      throw error;
    }
  },

  /**
   * Actualizar el valor del traje del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} nuevoValor - Nuevo valor del traje
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarTraje: async (id_partida, nuevoValor) => {
    try {
      const [result] = await db.query(
        'UPDATE capitanes SET traje = ? WHERE id_partida = ?',
        [nuevoValor, id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar traje del capitán:', error);
      throw error;
    }
  },

  /**
   * Actualizar el valor de estrés del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} nuevoValor - Nuevo valor de estrés
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarEstres: async (id_partida, nuevoValor) => {
    try {
      const [result] = await db.query(
        'UPDATE capitanes SET estres = ? WHERE id_partida = ?',
        [nuevoValor, id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar estrés del capitán:', error);
      throw error;
    }
  },

  /**
   * Actualizar el valor de oxígeno del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} nuevoValor - Nuevo valor de oxígeno
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarOxigeno: async (id_partida, nuevoValor) => {
    try {
      const [result] = await db.query(
        'UPDATE capitanes SET oxigeno = ? WHERE id_partida = ?',
        [nuevoValor, id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar oxígeno del capitán:', error);
      throw error;
    }
  },

  /**
   * Actualizar todos los atributos del capitán de una vez
   * @param {number} id_partida - ID de la partida
   * @param {Object} atributos - Objeto con los nuevos valores
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarAtributos: async (id_partida, atributos) => {
    try {
      const { traje, estres, oxigeno } = atributos;
      
      // Construir consulta dinámica según los atributos proporcionados
      let query = 'UPDATE capitanes SET ';
      const params = [];
      const updates = [];
      
      if (traje !== undefined) {
        updates.push('traje = ?');
        params.push(traje);
      }
      
      if (estres !== undefined) {
        updates.push('estres = ?');
        params.push(estres);
      }
      
      if (oxigeno !== undefined) {
        updates.push('oxigeno = ?');
        params.push(oxigeno);
      }
      
      if (updates.length === 0) {
        return true; // No hay nada que actualizar
      }
      
      query += updates.join(', ') + ' WHERE id_partida = ?';
      params.push(id_partida);
      
      const [result] = await db.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar atributos del capitán:', error);
      throw error;
    }
  }
};

module.exports = CapitanModel;