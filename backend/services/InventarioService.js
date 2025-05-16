// backend/services/InventarioService.js
const InventarioModel = require('../models/InventarioModel');
const PartidaModel = require('../models/PartidaModel');
const CapitanModel = require('../models/CapitanModel');

const InventarioService = {
  /**
   * Obtener inventario de una partida con verificación de acceso
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>} Inventario completo
   */
  obtenerInventario: async (id_partida, id_usuario) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Obtener el inventario
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      return inventario;
    } catch (error) {
      console.error('Error en InventarioService.obtenerInventario:', error);
      throw error;
    }
  },

  /**
   * Usar un item del inventario
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {number} indiceItem - Índice del item a usar
   * @returns {Promise<Object>} Resultado de usar el item
   */
  usarItem: async (id_partida, id_usuario, indiceItem) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Obtener el inventario
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Validar índice
      if (indiceItem < 0 || indiceItem >= inventario.mochila.length) {
        throw new Error('Ítem no encontrado');
      }
      
      const item = inventario.mochila[indiceItem];
      
      // Aplicar efecto del item según su tipo
      let mensaje = '';
      let efecto = {};
      
      switch (item.nombre) {
        case 'Kit de Reparación':
          // Reparar 2 puntos de traje
          const trajeActual = partida.capitan.traje;
          const nuevoTraje = Math.min(6, trajeActual + 2);
          await CapitanModel.actualizarTraje(id_partida, nuevoTraje);
          mensaje = `Has reparado ${nuevoTraje - trajeActual} puntos de tu traje`;
          efecto = { tipo: 'traje', valor: nuevoTraje, incremento: nuevoTraje - trajeActual };
          break;
          
        case 'Analgésico':
          // Reducir 2 puntos de estrés
          const estresActual = partida.capitan.estres;
          const nuevoEstres = Math.max(0, estresActual - 2);
          await CapitanModel.actualizarEstres(id_partida, nuevoEstres);
          mensaje = `Has reducido ${estresActual - nuevoEstres} puntos de estrés`;
          efecto = { tipo: 'estres', valor: nuevoEstres, reduccion: estresActual - nuevoEstres };
          break;
          
        case 'Visor':
          // No tiene efecto inmediato, se aplica en combate
          mensaje = 'Has activado el visor para tu próximo ataque';
          efecto = { tipo: 'precision', bonus: 1, duracion: 1 };
          break;
          
        case 'Munición':
          // Recargar 2 municiones a un arma
          // Elegimos la primera arma que no esté completamente cargada
          const armaARecargar = inventario.armas.find(a => 
            a.municion !== null && a.municion < a.municion_max
          );
          
          if (armaARecargar) {
            const municionActual = armaARecargar.municion;
            const nuevaMunicion = Math.min(armaARecargar.municion_max, municionActual + 2);
            await InventarioModel.actualizarMunicionArma(
              id_partida, 
              armaARecargar.nombre, 
              nuevaMunicion
            );
            mensaje = `Has recargado ${nuevaMunicion - municionActual} municiones de ${armaARecargar.nombre}`;
            efecto = { 
              tipo: 'municion', 
              arma: armaARecargar.nombre, 
              valor: nuevaMunicion, 
              incremento: nuevaMunicion - municionActual 
            };
          } else {
            mensaje = 'Todas tus armas están completamente cargadas';
            efecto = { tipo: 'municion', valor: 0, incremento: 0 };
          }
          break;
          
        case 'Tanque de O2':
          // Recuperar 3 puntos de oxígeno
          const oxigenoActual = partida.capitan.oxigeno;
          const nuevoOxigeno = Math.min(10, oxigenoActual + 3);
          await CapitanModel.actualizarOxigeno(id_partida, nuevoOxigeno);
          mensaje = `Has recuperado ${nuevoOxigeno - oxigenoActual} puntos de oxígeno`;
          efecto = { tipo: 'oxigeno', valor: nuevoOxigeno, incremento: nuevoOxigeno - oxigenoActual };
          break;
          
        default:
          mensaje = `Has usado ${item.nombre}`;
          efecto = { tipo: 'desconocido' };
      }
      
      // Usar el item (reduce usos y lo elimina si llega a 0)
      await InventarioModel.usarItem(id_partida, indiceItem);
      
      // Registrar uso de ítem para logros
      await PartidaModel.registrarUsoItem(id_partida);
      
      // Obtener inventario actualizado
      const inventarioActualizado = await InventarioModel.obtenerPorPartida(id_partida);
      
      return {
        mensaje,
        efecto,
        item,
        inventario: inventarioActualizado
      };
    } catch (error) {
      console.error('Error en InventarioService.usarItem:', error);
      throw error;
    }
  },

  /**
   * Recargar un arma específica
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {string} nombreArma - Nombre del arma a recargar
   * @param {number} cantidad - Cantidad de munición a recargar
   * @returns {Promise<Object>} Resultado de la recarga
   */
  recargarArma: async (id_partida, id_usuario, nombreArma, cantidad) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Obtener el inventario
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Buscar el arma
      const arma = inventario.armas.find(a => a.nombre === nombreArma);
      
      if (!arma) {
        throw new Error('Arma no encontrada');
      }
      
      // Validar que el arma usa munición
      if (arma.municion === null) {
        throw new Error('Esta arma no utiliza munición');
      }
      
      // Calcular nueva munición
      const municionActual = arma.municion;
      const nuevaMunicion = Math.min(arma.municion_max, municionActual + cantidad);
      
      // Actualizar munición
      await InventarioModel.actualizarMunicionArma(id_partida, nombreArma, nuevaMunicion);
      
      return {
        mensaje: `Has recargado ${nuevaMunicion - municionActual} municiones de ${nombreArma}`,
        arma: {
          ...arma,
          municion: nuevaMunicion
        },
        incremento: nuevaMunicion - municionActual
      };
    } catch (error) {
      console.error('Error en InventarioService.recargarArma:', error);
      throw error;
    }
  },

  /**
   * Recargar todas las armas
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>} Resultado de la recarga
   */
  recargarTodasLasArmas: async (id_partida, id_usuario) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Recargar todas las armas
      await InventarioModel.recargarTodasLasArmas(id_partida);
      
      // Obtener inventario actualizado
      const inventarioActualizado = await InventarioModel.obtenerPorPartida(id_partida);
      
      return {
        mensaje: 'Has recargado todas tus armas',
        armas: inventarioActualizado.armas
      };
    } catch (error) {
      console.error('Error en InventarioService.recargarTodasLasArmas:', error);
      throw error;
    }
  },

  /**
   * Agregar un item a la mochila
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {Object} item - Item a agregar
   * @returns {Promise<Object>} Resultado de agregar el item
   */
  agregarItem: async (id_partida, id_usuario, item) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Obtener el inventario
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Verificar espacio en mochila
      if (inventario.mochila.length >= 5) {
        return {
          exito: false,
          mensaje: 'Tu mochila está llena',
          mochila: inventario.mochila
        };
      }
      
      // Agregar el item
      await InventarioModel.agregarItem(id_partida, item);
      
      // Obtener inventario actualizado
      const inventarioActualizado = await InventarioModel.obtenerPorPartida(id_partida);
      
      return {
        exito: true,
        mensaje: `Has añadido ${item.nombre} a tu mochila`,
        item,
        mochila: inventarioActualizado.mochila
      };
    } catch (error) {
      console.error('Error en InventarioService.agregarItem:', error);
      throw error;
    }
  },

  /**
   * Eliminar un item de la mochila
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {number} indiceItem - Índice del item a eliminar
   * @returns {Promise<Object>} Resultado de eliminar el item
   */
  eliminarItem: async (id_partida, id_usuario, indiceItem) => {
    try {
      // Verificar acceso
      const partida = await PartidaModel.obtenerPorId(id_partida);
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }
      
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }
      
      // Obtener el inventario
      const inventario = await InventarioModel.obtenerPorPartida(id_partida);
      
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      
      // Validar índice
      if (indiceItem < 0 || indiceItem >= inventario.mochila.length) {
        throw new Error('Ítem no encontrado');
      }
      
      // Obtener el item que se va a eliminar
      const itemEliminado = inventario.mochila[indiceItem];
      
      // Eliminar el item
      await InventarioModel.eliminarItem(id_partida, indiceItem);
      
      // Obtener inventario actualizado
      const inventarioActualizado = await InventarioModel.obtenerPorPartida(id_partida);
      
      return {
        exito: true,
        mensaje: `Has eliminado ${itemEliminado.nombre} de tu mochila`,
        item: itemEliminado,
        mochila: inventarioActualizado.mochila
      };
    } catch (error) {
      console.error('Error en InventarioService.eliminarItem:', error);
      throw error;
    }
  },

  /**
   * Generar un item aleatorio
   * @returns {Object} Item aleatorio
   */
  generarItemAleatorio: () => {
    const items = [
      { nombre: 'Kit de Reparación', efecto: 'Repara 2 puntos de traje', usos: 1 },
      { nombre: 'Analgésico', efecto: 'Reduce 2 puntos de estrés', usos: 1 },
      { nombre: 'Visor', efecto: 'Añade +1 a la precisión del arma', usos: 3 },
      { nombre: 'Munición', efecto: 'Recarga 2 municiones de un arma', usos: 1 },
      { nombre: 'Tanque de O2', efecto: 'Recupera 3 puntos de oxígeno', usos: 1 }
    ];
    
    const indice = Math.floor(Math.random() * items.length);
    return { ...items[indice] }; // Devolver una copia para evitar modificar el original
  }
};

module.exports = InventarioService;