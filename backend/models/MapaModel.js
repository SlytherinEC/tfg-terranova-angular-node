// backend/models/MapaModel.js
const db = require('../config/db');

const MapaModel = {
  // Crear nuevo mapa para una partida
  crear: async (id_partida, estructura_celdas, adyacencias) => {
    try {
      const [result] = await db.query(
        'INSERT INTO mapas (id_partida, posicion_actual_x, posicion_actual_y, estructura_celdas, adyacencias) VALUES (?, ?, ?, ?, ?)',
        [id_partida, 0, 0, JSON.stringify(estructura_celdas), JSON.stringify(adyacencias)]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear mapa:', error);
      throw error;
    }
  },

  // Obtener mapa por ID de partida
  obtenerPorPartida: async (id_partida) => {
    try {
      const [mapas] = await db.query(
        'SELECT * FROM mapas WHERE id_partida = ?',
        [id_partida]
      );

      if (mapas.length === 0) {
        return null;
      }

      const mapa = mapas[0];

      // Obtener habitaciones exploradas para este mapa
      const [habitaciones] = await db.query(
        'SELECT coordenada_x, coordenada_y FROM habitaciones_exploradas WHERE id_partida = ?',
        [id_partida]
      );

      return {
        id_mapa: mapa.id_mapa,
        posicion_actual: {
          x: mapa.posicion_actual_x,
          y: mapa.posicion_actual_y
        },
        estructura_celdas: JSON.parse(mapa.estructura_celdas || '[]'),
        adyacencias: JSON.parse(mapa.adyacencias || '{}'),
        habitaciones_exploradas: habitaciones.map(h => ({ x: h.coordenada_x, y: h.coordenada_y }))
      };
    } catch (error) {
      console.error('Error al obtener mapa:', error);
      throw error;
    }
  },

  // Actualizar posición actual
  actualizarPosicion: async (id_partida, x, y) => {
    try {
      const [result] = await db.query(
        'UPDATE mapas SET posicion_actual_x = ?, posicion_actual_y = ? WHERE id_partida = ?',
        [x, y, id_partida]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar posición:', error);
      throw error;
    }
  },

  // Actualizar estructura del mapa
  actualizarEstructura: async (id_partida, estructura_celdas) => {
    try {
      const [result] = await db.query(
        'UPDATE mapas SET estructura_celdas = ? WHERE id_partida = ?',
        [JSON.stringify(estructura_celdas), id_partida]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar estructura del mapa:', error);
      throw error;
    }
  },

  // Marcar celda como explorada
  marcarCeldaExplorada: async (id_partida, x, y) => {
    try {
      // Verificar si ya está marcada
      const [existente] = await db.query(
        'SELECT * FROM habitaciones_exploradas WHERE id_partida = ? AND coordenada_x = ? AND coordenada_y = ?',
        [id_partida, x, y]
      );

      if (existente.length > 0) {
        return true; // Ya está explorada
      }

      // Marcar como explorada
      const [result] = await db.query(
        'INSERT INTO habitaciones_exploradas (id_partida, coordenada_x, coordenada_y) VALUES (?, ?, ?)',
        [id_partida, x, y]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar celda como explorada:', error);
      throw error;
    }
  },

  // Verificar si una celda está explorada
  estaExplorada: async (id_partida, x, y) => {
    try {
      const [resultado] = await db.query(
        'SELECT * FROM habitaciones_exploradas WHERE id_partida = ? AND coordenada_x = ? AND coordenada_y = ?',
        [id_partida, x, y]
      );
      return resultado.length > 0;
    } catch (error) {
      console.error('Error al verificar si la celda está explorada:', error);
      throw error;
    }
  },

  // Obtener todas las celdas exploradas
  obtenerCeldasExploradas: async (id_partida) => {
    try {
      const [celdas] = await db.query(
        'SELECT coordenada_x, coordenada_y FROM habitaciones_exploradas WHERE id_partida = ?',
        [id_partida]
      );
      return celdas.map(c => ({ x: c.coordenada_x, y: c.coordenada_y }));
    } catch (error) {
      console.error('Error al obtener celdas exploradas:', error);
      throw error;
    }
  }
};

module.exports = MapaModel;