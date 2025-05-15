// backend/services/CapitanService.js
const CapitanModel = require('../models/CapitanModel');
const PartidaModel = require('../models/PartidaModel');

const CapitanService = {
  /**
   * Obtener atributos del capitán con verificación de acceso
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>} Atributos del capitán
   */
  obtenerAtributos: async (id_partida, id_usuario) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Obtener los atributos del capitán
      const capitan = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitan) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      return {
        traje: capitan.traje,
        estres: capitan.estres,
        oxigeno: capitan.oxigeno
      };
    } catch (error) {
      console.error('Error en CapitanService.obtenerAtributos:', error);
      throw error;
    }
  },

  /**
   * Actualizar atributos del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {Object} atributos - Nuevos valores de los atributos
   * @returns {Promise<Object>} Atributos actualizados
   */
  actualizarAtributos: async (id_partida, id_usuario, atributos) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Verificar que se proporcionaron atributos para actualizar
      const { traje, estres, oxigeno } = atributos;
      
      if (traje === undefined && estres === undefined && oxigeno === undefined) {
        throw new Error('No se proporcionaron atributos para actualizar');
      }
      
      // Obtener valores actuales
      const capitanActual = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitanActual) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      // Aplicar validaciones de rango
      const nuevosAtributos = {};
      
      if (traje !== undefined) {
        if (traje < 0 || traje > 10) {
          throw new Error('El valor del traje debe estar entre 0 y 10');
        }
        nuevosAtributos.traje = traje;
      }
      
      if (estres !== undefined) {
        if (estres < 0 || estres > 10) {
          throw new Error('El valor de estrés debe estar entre 0 y 10');
        }
        nuevosAtributos.estres = estres;
      }
      
      if (oxigeno !== undefined) {
        if (oxigeno < 0 || oxigeno > 10) {
          throw new Error('El valor de oxígeno debe estar entre 0 y 10');
        }
        nuevosAtributos.oxigeno = oxigeno;
      }
      
      // Actualizar atributos
      await CapitanModel.actualizarAtributos(id_partida, nuevosAtributos);
      
      // Obtener valores actualizados
      const capitanActualizado = await CapitanModel.obtenerPorPartida(id_partida);
      
      return {
        traje: capitanActualizado.traje,
        estres: capitanActualizado.estres,
        oxigeno: capitanActualizado.oxigeno
      };
    } catch (error) {
      console.error('Error en CapitanService.actualizarAtributos:', error);
      throw error;
    }
  },

  /**
   * Reparar el traje del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {number} cantidad - Cantidad a reparar
   * @param {boolean} registrarUsoItem - Si se debe registrar como uso de item
   * @returns {Promise<Object>} Resultado de la reparación
   */
  repararTraje: async (id_partida, id_usuario, cantidad, registrarUsoItem = false) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Validación de cantidad
      if (!cantidad || cantidad <= 0) {
        throw new Error('La cantidad de reparación debe ser mayor que 0');
      }
      
      // Obtener valor actual del traje
      const capitan = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitan) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      // Calcular nuevo valor (máximo 6)
      const nuevoValor = Math.min(6, capitan.traje + cantidad);
      
      // Actualizar valor
      await CapitanModel.actualizarTraje(id_partida, nuevoValor);
      
      // Registrar uso de ítem si corresponde
      if (registrarUsoItem) {
        await PartidaModel.registrarUsoItem(id_partida);
      }
      
      return {
        mensaje: 'Traje reparado con éxito',
        traje: nuevoValor,
        reparacion_real: nuevoValor - capitan.traje
      };
    } catch (error) {
      console.error('Error en CapitanService.repararTraje:', error);
      throw error;
    }
  },

  /**
   * Reducir estrés del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {number} cantidad - Cantidad a reducir
   * @param {boolean} registrarUsoItem - Si se debe registrar como uso de item
   * @returns {Promise<Object>} Resultado de la reducción
   */
  reducirEstres: async (id_partida, id_usuario, cantidad, registrarUsoItem = false) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Validación de cantidad
      if (!cantidad || cantidad <= 0) {
        throw new Error('La cantidad de reducción debe ser mayor que 0');
      }
      
      // Obtener valor actual de estrés
      const capitan = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitan) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      // Calcular nuevo valor (mínimo 0)
      const nuevoValor = Math.max(0, capitan.estres - cantidad);
      
      // Actualizar valor
      await CapitanModel.actualizarEstres(id_partida, nuevoValor);
      
      // Registrar uso de ítem si corresponde
      if (registrarUsoItem) {
        await PartidaModel.registrarUsoItem(id_partida);
      }
      
      return {
        mensaje: 'Estrés reducido con éxito',
        estres: nuevoValor,
        reduccion_real: capitan.estres - nuevoValor
      };
    } catch (error) {
      console.error('Error en CapitanService.reducirEstres:', error);
      throw error;
    }
  },

  /**
   * Recuperar oxígeno del capitán
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {number} cantidad - Cantidad a recuperar
   * @param {boolean} registrarUsoItem - Si se debe registrar como uso de item
   * @returns {Promise<Object>} Resultado de la recuperación
   */
  recuperarOxigeno: async (id_partida, id_usuario, cantidad, registrarUsoItem = false) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Validación de cantidad
      if (!cantidad || cantidad <= 0) {
        throw new Error('La cantidad de oxígeno debe ser mayor que 0');
      }
      
      // Obtener valor actual de oxígeno
      const capitan = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitan) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      // Calcular nuevo valor (máximo 10)
      const nuevoValor = Math.min(10, capitan.oxigeno + cantidad);
      
      // Actualizar valor
      await CapitanModel.actualizarOxigeno(id_partida, nuevoValor);
      
      // Registrar uso de ítem si corresponde
      if (registrarUsoItem) {
        await PartidaModel.registrarUsoItem(id_partida);
      }
      
      return {
        mensaje: 'Oxígeno recuperado con éxito',
        oxigeno: nuevoValor,
        recuperacion_real: nuevoValor - capitan.oxigeno
      };
    } catch (error) {
      console.error('Error en CapitanService.recuperarOxigeno:', error);
      throw error;
    }
  },

  /**
   * Verificar si el capitán tiene suficiente oxígeno para seguir
   * @param {number} id_partida - ID de la partida
   * @returns {Promise<boolean>} True si tiene suficiente oxígeno
   */
  verificarOxigeno: async (id_partida) => {
    try {
      const capitan = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitan) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      return capitan.oxigeno > 0;
    } catch (error) {
      console.error('Error en CapitanService.verificarOxigeno:', error);
      throw error;
    }
  },

  /**
   * Reducir oxígeno (al explorar habitaciones)
   * @param {number} id_partida - ID de la partida
   * @param {number} cantidad - Cantidad a reducir (por defecto 1)
   * @returns {Promise<Object>} Resultado de la reducción
   */
  reducirOxigeno: async (id_partida, cantidad = 1) => {
    try {
      // Obtener valor actual
      const capitan = await CapitanModel.obtenerPorPartida(id_partida);
      
      if (!capitan) {
        throw new Error('Capitán no encontrado para esta partida');
      }
      
      // Calcular nuevo valor
      const nuevoValor = Math.max(0, capitan.oxigeno - cantidad);
      
      // Actualizar valor
      await CapitanModel.actualizarOxigeno(id_partida, nuevoValor);
      
      // Verificar si se quedó sin oxígeno
      const sinOxigeno = nuevoValor <= 0;
      
      if (sinOxigeno) {
        // Marcar partida como perdida
        await PartidaModel.actualizarEstado(id_partida, 'DERROTA');
      }
      
      return {
        oxigeno: nuevoValor,
        reduccion: cantidad,
        sin_oxigeno: sinOxigeno
      };
    } catch (error) {
      console.error('Error en CapitanService.reducirOxigeno:', error);
      throw error;
    }
  }
};

module.exports = CapitanService;