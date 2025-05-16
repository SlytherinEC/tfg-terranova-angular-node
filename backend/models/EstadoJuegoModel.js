// backend/models/EstadoJuegoModel.js
const db = require('../config/db');

const EstadoJuegoModel = {
  /**
   * Crear un nuevo estado de juego para una partida
   * @param {number} id_partida - ID de la partida
   * @param {Array} eventos_completados - Lista inicial de eventos completados (opcional)
   * @param {Object} encuentro_actual - Encuentro actual si existe (opcional)
   * @param {Object} logros - Logros desbloqueados (opcional)
   * @returns {Promise<number>} ID del estado de juego creado
   */
  crear: async (id_partida, eventos_completados = [], encuentro_actual = null, logros = {}) => {
    try {
      const [result] = await db.query(
        'INSERT INTO estado_juego (id_partida, eventos_completados, encuentro_actual, logros) VALUES (?, ?, ?, ?)',
        [
          id_partida, 
          JSON.stringify(eventos_completados), 
          encuentro_actual ? JSON.stringify(encuentro_actual) : null, 
          JSON.stringify(logros)
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear estado de juego:', error);
      throw error;
    }
  },

  /**
   * Obtener el estado de juego de una partida
   * @param {number} id_partida - ID de la partida
   * @returns {Promise<Object|null>} Estado de juego o null si no existe
   */
  obtenerPorPartida: async (id_partida) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM estado_juego WHERE id_partida = ?',
        [id_partida]
      );
      
      if (rows.length === 0) return null;
      
      // Parsear los campos JSON
      const estado = rows[0];
      return {
        id_estado: estado.id_estado,
        id_partida: estado.id_partida,
        eventos_completados: JSON.parse(estado.eventos_completados || '[]'),
        encuentro_actual: estado.encuentro_actual ? JSON.parse(estado.encuentro_actual) : null,
        logros: JSON.parse(estado.logros || '{}')
      };
    } catch (error) {
      console.error('Error al obtener estado de juego por partida:', error);
      throw error;
    }
  },

  /**
   * Actualizar eventos completados
   * @param {number} id_partida - ID de la partida
   * @param {Array} eventos_completados - Nueva lista de eventos completados
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarEventosCompletados: async (id_partida, eventos_completados) => {
    try {
      const [result] = await db.query(
        'UPDATE estado_juego SET eventos_completados = ? WHERE id_partida = ?',
        [JSON.stringify(eventos_completados), id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar eventos completados:', error);
      throw error;
    }
  },

  /**
   * Registrar un nuevo evento completado
   * @param {number} id_partida - ID de la partida
   * @param {number} idEvento - ID del evento completado
   * @returns {Promise<boolean>} True si se agregó correctamente
   */
  registrarEventoCompletado: async (id_partida, idEvento) => {
    try {
      // Obtener eventos actuales
      const estado = await EstadoJuegoModel.obtenerPorPartida(id_partida);
      
      if (!estado) {
        throw new Error('Estado de juego no encontrado');
      }
      
      // Verificar si el evento ya está registrado
      if (estado.eventos_completados.includes(idEvento)) {
        return true; // Ya estaba registrado
      }
      
      // Agregar el nuevo evento
      const nuevosEventos = [...estado.eventos_completados, idEvento];
      
      // Actualizar eventos
      return await EstadoJuegoModel.actualizarEventosCompletados(id_partida, nuevosEventos);
    } catch (error) {
      console.error('Error al registrar evento completado:', error);
      throw error;
    }
  },

  /**
   * Actualizar encuentro actual
   * @param {number} id_partida - ID de la partida
   * @param {Object|null} encuentro_actual - Nuevo encuentro actual o null si no hay
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarEncuentroActual: async (id_partida, encuentro_actual) => {
    try {
      const [result] = await db.query(
        'UPDATE estado_juego SET encuentro_actual = ? WHERE id_partida = ?',
        [encuentro_actual ? JSON.stringify(encuentro_actual) : null, id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar encuentro actual:', error);
      throw error;
    }
  },

  /**
   * Actualizar logros
   * @param {number} id_partida - ID de la partida
   * @param {Object} logros - Nuevos logros
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  actualizarLogros: async (id_partida, logros) => {
    try {
      const [result] = await db.query(
        'UPDATE estado_juego SET logros = ? WHERE id_partida = ?',
        [JSON.stringify(logros), id_partida]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar logros:', error);
      throw error;
    }
  },

  /**
   * Desbloquear un logro específico
   * @param {number} id_partida - ID de la partida
   * @param {string} nombreLogro - Nombre del logro a desbloquear
   * @returns {Promise<boolean>} True si se desbloqueó correctamente
   */
  desbloquearLogro: async (id_partida, nombreLogro) => {
    try {
      // Obtener logros actuales
      const estado = await EstadoJuegoModel.obtenerPorPartida(id_partida);
      
      if (!estado) {
        throw new Error('Estado de juego no encontrado');
      }
      
      // Verificar si el logro ya está desbloqueado
      if (estado.logros[nombreLogro]) {
        return true; // Ya estaba desbloqueado
      }
      
      // Actualizar logros
      const nuevosLogros = {
        ...estado.logros,
        [nombreLogro]: true
      };
      
      return await EstadoJuegoModel.actualizarLogros(id_partida, nuevosLogros);
    } catch (error) {
      console.error('Error al desbloquear logro:', error);
      throw error;
    }
  },

  /**
   * Actualizar contador de aliens vencidos (para logros)
   * @param {number} id_partida - ID de la partida
   * @param {string} tipoAlien - Tipo de alien vencido
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  registrarAlienVencido: async (id_partida, tipoAlien) => {
    try {
      // Obtener logros actuales
      const estado = await EstadoJuegoModel.obtenerPorPartida(id_partida);
      
      if (!estado) {
        throw new Error('Estado de juego no encontrado');
      }
      
      // Inicializar logros si no existen
      const logros = { ...estado.logros };
      if (!logros.aliens_derrotados) {
        logros.aliens_derrotados = {};
      }
      
      // Incrementar contador para este tipo de alien
      if (!logros.aliens_derrotados[tipoAlien]) {
        logros.aliens_derrotados[tipoAlien] = 0;
      }
      
      logros.aliens_derrotados[tipoAlien] += 1;
      
      // Verificar logros basados en aliens vencidos
      await verificarLogrosAliens(id_partida, logros);
      
      // Actualizar logros
      return await EstadoJuegoModel.actualizarLogros(id_partida, logros);
    } catch (error) {
      console.error('Error al registrar alien vencido:', error);
      throw error;
    }
  },

  /**
   * Verificar y actualizar todos los logros al final de una partida
   * @param {number} id_partida - ID de la partida
   * @returns {Promise<Object>} Logros actualizados
   */
  verificarTodosLosLogros: async (id_partida) => {
    try {
      // Obtener partida y estado de juego
      const [partidas] = await db.query(
        'SELECT * FROM partidas WHERE id_partida = ?',
        [id_partida]
      );
      
      if (partidas.length === 0) {
        throw new Error('Partida no encontrada');
      }
      
      const partida = partidas[0];
      const estado = await EstadoJuegoModel.obtenerPorPartida(id_partida);
      
      if (!estado) {
        throw new Error('Estado de juego no encontrado');
      }
      
      const logros = { ...estado.logros };
      
      // Verificar logros específicos
      
      // PACIFICADOR: no sacrificar pasajeros
      if (partida.pasajeros_sacrificados === 0) {
        logros.PACIFICADOR = true;
      }
      
      // ACUMULADOR: no usar items
      if (partida.items_usados === 0) {
        logros.ACUMULADOR = true;
      }
      
      // MEMORIAS: completar 10+ eventos
      if (estado.eventos_completados.length >= 10) {
        logros.MEMORIAS = true;
      }
      
      // Logros de dificultad
      switch (partida.dificultad) {
        case 'NORMAL':
          logros.NORMAL = true;
          break;
        case 'DIFICIL':
          logros.NORMAL = true;
          logros.DURO = true;
          break;
        case 'LOCURA':
          logros.NORMAL = true;
          logros.DURO = true;
          logros.LOCO = true;
          break;
      }
      
      // Actualizar logros en base de datos
      await EstadoJuegoModel.actualizarLogros(id_partida, logros);
      
      return logros;
    } catch (error) {
      console.error('Error al verificar todos los logros:', error);
      throw error;
    }
  },

  /**
   * Calcular rango del jugador basado en logros obtenidos
   * @param {Object} logros - Objeto con los logros desbloqueados
   * @returns {string} Rango obtenido
   */
  calcularRango: (logros) => {
    if (!logros) return 'CADETE';
    
    // Contar logros obtenidos
    const totalLogros = Object.values(logros).filter(valor => valor === true).length;
    
    // Determinar rango según cantidad de logros
    if (totalLogros >= 9) return 'GENERAL';
    if (totalLogros >= 8) return 'ALMIRANTE';
    if (totalLogros >= 6) return 'MAYOR';
    if (totalLogros >= 4) return 'CAPITAN';
    if (totalLogros >= 2) return 'OFICIAL';
    return 'CADETE';
  }
};

// Función auxiliar para verificar logros relacionados con aliens
async function verificarLogrosAliens(id_partida, logros) {
  const alienesVencidos = logros.aliens_derrotados || {};
  
  // ARACNOFÓBICO: vencer 10 arañas
  if ((alienesVencidos.arana || 0) >= 10) {
    logros.ARACNOFOBICO = true;
  }
  
  // CAZADOR: vencer 8 sabuesos
  if ((alienesVencidos.sabueso || 0) >= 8) {
    logros.CAZADOR = true;
  }
  
  // RASTREADOR: vencer 6 rastreadores
  if ((alienesVencidos.rastreador || 0) >= 6) {
    logros.RASTREADOR = true;
  }
  
  // GUERRERO: vencer 4 reinas
  if ((alienesVencidos.reina || 0) >= 4) {
    logros.GUERRERO = true;
  }
  
  // EXTERMINADOR: vencer una araña monstruosa
  if ((alienesVencidos.arana_monstruosa || 0) >= 1) {
    logros.EXTERMINADOR = true;
  }
  
  // DOMADOR: vencer un sabueso rabioso
  if ((alienesVencidos.sabueso_rabioso || 0) >= 1) {
    logros.DOMADOR = true;
  }
  
  // OSCURIDAD: vencer una reina negra
  if ((alienesVencidos.reina_negra || 0) >= 1) {
    logros.OSCURIDAD = true;
  }
}

module.exports = EstadoJuegoModel;