// backend/services/PartidaService.js
const PartidaModel = require('../models/PartidaModel');
const CapitanModel = require('../models/CapitanModel'); // Asumiendo que existe
const MapaModel = require('../models/MapaModel'); // Asumiendo que existe
const InventarioModel = require('../models/InventarioModel'); // Asumiendo que existe
const EstadoJuegoModel = require('../models/EstadoJuegoModel'); // Asumiendo que existe
const MapaService = require('./MapaService');

const PartidaService = {
  /**
   * Iniciar una nueva partida para un usuario
   */
  crearNuevaPartida: async (id_usuario, dificultad) => {
    try {
      // 1. Crear partida básica
      const id_partida = await PartidaModel.crear(id_usuario, dificultad);
      
      // 2. Generar y guardar mapa
      const { mapa, adyacencias } = await MapaService.generarMapaHexagonal();
      await MapaModel.crear(id_partida, mapa, adyacencias);
      
      // 3. Obtener partida completa para devolver
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      return {
        mensaje: 'Partida creada con éxito',
        partida
      };
    } catch (error) {
      console.error('Error en PartidaService.crearNuevaPartida:', error);
      throw new Error('Error al crear nueva partida: ' + error.message);
    }
  },

  /**
   * Obtener todas las partidas de un usuario
   */
  obtenerPartidasUsuario: async (id_usuario) => {
    try {
      return await PartidaModel.obtenerPorUsuario(id_usuario);
    } catch (error) {
      console.error('Error en PartidaService.obtenerPartidasUsuario:', error);
      throw new Error('Error al obtener partidas del usuario: ' + error.message);
    }
  },

  /**
   * Obtener una partida por ID
   */
  obtenerPartida: async (id_partida, id_usuario) => {
    try {
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      return partida;
    } catch (error) {
      console.error('Error en PartidaService.obtenerPartida:', error);
      throw error;
    }
  },

  /**
   * Finalizar una partida (victoria o derrota)
   */
  finalizarPartida: async (id_partida, resultado, mensaje) => {
    try {
      // 1. Actualizar estado de partida
      await PartidaModel.actualizarEstado(id_partida, resultado);
      
      // 2. Verificar y registrar logros finales
      if (resultado === 'VICTORIA') {
        await this.verificarLogrosFinales(id_partida);
      }
      
      // 3. Obtener partida actualizada
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      return {
        exito: true,
        fin: true,
        resultado,
        mensaje,
        partida
      };
    } catch (error) {
      console.error('Error en PartidaService.finalizarPartida:', error);
      throw new Error('Error al finalizar partida: ' + error.message);
    }
  },

  /**
   * Verificar logros finales al completar partida
   */
  verificarLogrosFinales: async (id_partida) => {
    try {
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) return;
      
      const logros = partida.logros || {};
      
      // Verificar logros basados en estadísticas
      
      // Logro PACIFICADOR: no sacrificar pasajeros
      if (partida.pasajeros_sacrificados === 0) {
        logros.PACIFICADOR = true;
      }
      
      // Logro ACUMULADOR: no usar ítems
      if (partida.items_usados === 0) {
        logros.ACUMULADOR = true;
      }
      
      // Verificar logro según dificultad
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
      
      // Actualizar logros en el estado del juego
      await EstadoJuegoModel.actualizarLogros(id_partida, logros);
      
    } catch (error) {
      console.error('Error en PartidaService.verificarLogrosFinales:', error);
      throw error;
    }
  },

  /**
   * Calcular rango final del jugador basado en logros
   */
  calcularRangoFinal: (logros) => {
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

module.exports = PartidaService;