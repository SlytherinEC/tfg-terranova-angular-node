// backend/services/EstadoJuegoService.js
const EstadoJuegoModel = require('../models/EstadoJuegoModel');
const PartidaModel = require('../models/PartidaModel');

const EstadoJuegoService = {

  /**
 * Procesar evento específico
 * @param {number} id_partida - ID de la partida
 * @param {number} id_usuario - ID del usuario
 * @param {number} numeroEvento - Número del evento
 * @param {string} opcionSeleccionada - Opción seleccionada por el jugador
 * @returns {Promise<Object>} Resultado del evento
 */
  procesarEvento: async (id_partida, id_usuario, numeroEvento, opcionSeleccionada) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Aquí implementamos la lógica de procesamiento de eventos
      // que antes estaba en GameService.resolverEventoEspecifico

      let resultado = {
        tipo: 'evento_procesado',
        mensaje: 'Evento procesado correctamente',
        efecto: {}
      };

      // Ejemplos de posibles eventos
      switch (parseInt(numeroEvento)) {
        case 4:
          if (opcionSeleccionada === 'avanzar') {
            // Implementación del evento 14 (ligado al 4)
            if (partida.pasajeros > 0) {
              await PartidaModel.actualizarPasajeros(id_partida, partida.pasajeros - 1);
            }
            resultado = {
              tipo: 'evento_resuelto',
              mensaje: 'Avanzando por la oscuridad uno de tus compañeros emite un chillido mortal y desaparece, corriendo a toda velocidad el grupo logra llegar a la salida de la habitación.'
            };
          } else if (opcionSeleccionada === 'luces') {
            // Implementación del evento 20 (ligado al 4)
            // Crear encuentro con Araña Monstruosa
            const encuentro = {
              alien: 'arana_monstruosa',
              pg: 3,
              alienData: {
                nombre: 'Araña Monstruosa',
                danio: 2,
                objetivo: 4,
                pg: 3
              }
            };

            await EstadoJuegoModel.actualizarEncuentroActual(id_partida, encuentro);

            resultado = {
              tipo: 'encuentro',
              mensaje: 'Encuentras el interruptor y cuando enciendes las luces, un alien salta sobre ti...',
              encuentro
            };
          }
          break;

        case 5:
          if (opcionSeleccionada === 'curar') {
            await PartidaModel.actualizarPasajeros(id_partida, partida.pasajeros + 1);
            resultado = {
              tipo: 'evento_resuelto',
              mensaje: 'Logras estabilizar al tripulante y se une a tu grupo. (+1 Pasajero)'
            };
          } else if (opcionSeleccionada === 'registrar') {
            // Generar item aleatorio
            const item = InventarioService.generarItemAleatorio();
            await InventarioModel.agregarItem(id_partida, item);

            resultado = {
              tipo: 'evento_item',
              mensaje: 'Registras el cuerpo del tripulante y encuentras algo útil.',
              item
            };
          }
          break;

        // Implementar otros eventos según se necesite

        default:
          resultado = {
            tipo: 'evento_generico',
            mensaje: `Evento ${numeroEvento} procesado, opción ${opcionSeleccionada} seleccionada.`
          };
      }

      return resultado;
    } catch (error) {
      console.error('Error en EstadoJuegoService.procesarEvento:', error);
      throw error;
    }
  },

  /**
   * Obtener estado de juego completo con verificación de acceso
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>} Estado de juego completo
   */
  obtenerEstadoJuego: async (id_partida, id_usuario) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Obtener el estado de juego
      const estadoJuego = await EstadoJuegoModel.obtenerPorPartida(id_partida);

      if (!estadoJuego) {
        throw new Error('Estado de juego no encontrado');
      }

      // Calcular el rango actual
      const rango = EstadoJuegoModel.calcularRango(estadoJuego.logros);

      return {
        ...estadoJuego,
        rango
      };
    } catch (error) {
      console.error('Error en EstadoJuegoService.obtenerEstadoJuego:', error);
      throw error;
    }
  },

  /**
   * Iniciar un nuevo encuentro con un alien
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {string} tipoAlien - Tipo de alien para el encuentro
   * @returns {Promise<Object>} Encuentro creado
   */
  iniciarEncuentro: async (id_partida, id_usuario, tipoAlien) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Verificar que no hay un encuentro activo
      const estadoJuego = await EstadoJuegoModel.obtenerPorPartida(id_partida);

      if (!estadoJuego) {
        throw new Error('Estado de juego no encontrado');
      }

      if (estadoJuego.encuentro_actual) {
        throw new Error('Ya hay un encuentro activo');
      }

      // Obtener datos del alien según su tipo
      const datosAlien = obtenerDatosAlien(tipoAlien);

      if (!datosAlien) {
        throw new Error('Tipo de alien no válido');
      }

      // Crear el encuentro
      const encuentro = {
        alien: tipoAlien,
        pg: datosAlien.pg,
        datos: datosAlien
      };

      // Guardar el encuentro
      await EstadoJuegoModel.actualizarEncuentroActual(id_partida, encuentro);

      return encuentro;
    } catch (error) {
      console.error('Error en EstadoJuegoService.iniciarEncuentro:', error);
      throw error;
    }
  },

  /**
   * Resolver un ataque en un encuentro
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {Object} datosAtaque - Datos del ataque (arma, dados, etc.)
   * @returns {Promise<Object>} Resultado del ataque y estado actual del encuentro
   */
  resolverAtaque: async (id_partida, id_usuario, datosAtaque) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Verificar que hay un encuentro activo
      const estadoJuego = await EstadoJuegoModel.obtenerPorPartida(id_partida);

      if (!estadoJuego || !estadoJuego.encuentro_actual) {
        throw new Error('No hay un encuentro activo');
      }

      const encuentro = estadoJuego.encuentro_actual;

      // Obtener el arma seleccionada
      const { armaSeleccionada } = datosAtaque;
      const arma = partida.armas.find(a => a.nombre === armaSeleccionada);

      if (!arma) {
        throw new Error('Arma no encontrada');
      }

      // Verificar munición (excepto Palanca)
      if (arma.nombre !== 'Palanca' && arma.municion <= 0) {
        throw new Error('El arma no tiene munición');
      }

      // Tirar dados para el ataque
      const dados = tirarDados(arma.precision);
      const total = dados.reduce((sum, val) => sum + val, 0);

      // Resultado del ataque
      let exito = false;
      let mensaje = '';

      // Comprobar si el ataque tiene éxito
      if (total >= encuentro.datos.objetivo) {
        exito = true;

        // Restar daño al alien
        encuentro.pg -= arma.danio;
        mensaje = `¡Impacto! Has causado ${arma.danio} puntos de daño.`;
      } else {
        mensaje = 'Has fallado el ataque.';
      }

      // Consumir munición si no es Palanca
      if (arma.nombre !== 'Palanca') {
        arma.municion -= 1;

        // Actualizar armas en partida
        const nuevasArmas = partida.armas.map(a =>
          a.nombre === arma.nombre ? arma : a
        );

        // Actualizar armas en la base de datos
        // (Esta parte puede variar según la estructura de tu aplicación)
        // Por ahora asumimos que hay un modelo o servicio para actualizar las armas
        const InventarioModel = require('../models/InventarioModel');
        await InventarioModel.actualizarArmas(id_partida, nuevasArmas);
      }

      // Comprobar si el alien ha sido derrotado
      let encuentroFinalizado = false;

      if (encuentro.pg <= 0) {
        // Alien derrotado
        mensaje += ' ¡Has derrotado al alien!';
        encuentroFinalizado = true;

        // Registrar alien vencido para logros
        await EstadoJuegoModel.registrarAlienVencido(id_partida, encuentro.alien);

        // Finalizar el encuentro
        await EstadoJuegoModel.actualizarEncuentroActual(id_partida, null);
      } else {
        // El alien sigue con vida, actualizar encuentro
        await EstadoJuegoModel.actualizarEncuentroActual(id_partida, encuentro);
      }

      return {
        exito,
        dados,
        total,
        mensaje,
        encuentroFinalizado,
        pg_restante: Math.max(0, encuentro.pg),
        arma
      };
    } catch (error) {
      console.error('Error en EstadoJuegoService.resolverAtaque:', error);
      throw error;
    }
  },

  /**
   * Finalizar un encuentro (huir o utilizar algún item/habilidad)
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>} Resultado de la acción
   */
  finalizarEncuentro: async (id_partida, id_usuario) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Verificar que hay un encuentro activo
      const estadoJuego = await EstadoJuegoModel.obtenerPorPartida(id_partida);

      if (!estadoJuego || !estadoJuego.encuentro_actual) {
        throw new Error('No hay un encuentro activo');
      }

      // Finalizar el encuentro
      await EstadoJuegoModel.actualizarEncuentroActual(id_partida, null);

      return {
        mensaje: 'Has escapado del encuentro',
        exito: true
      };
    } catch (error) {
      console.error('Error en EstadoJuegoService.finalizarEncuentro:', error);
      throw error;
    }
  },

  /**
   * Registrar un evento completado
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {number} idEvento - ID del evento completado
   * @returns {Promise<Object>} Resultado de la acción
   */
  registrarEventoCompletado: async (id_partida, id_usuario, idEvento) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Registrar evento completado
      await EstadoJuegoModel.registrarEventoCompletado(id_partida, idEvento);

      // Verificar logro MEMORIAS (10+ eventos)
      const estadoJuego = await EstadoJuegoModel.obtenerPorPartida(id_partida);

      if (estadoJuego.eventos_completados.length >= 10) {
        await EstadoJuegoModel.desbloquearLogro(id_partida, 'MEMORIAS');
      }

      return {
        mensaje: 'Evento registrado correctamente',
        eventos_completados: estadoJuego.eventos_completados
      };
    } catch (error) {
      console.error('Error en EstadoJuegoService.registrarEventoCompletado:', error);
      throw error;
    }
  },

  /**
   * Desbloquear un logro específico
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @param {string} nombreLogro - Nombre del logro a desbloquear
   * @returns {Promise<Object>} Resultado de la acción
   */
  desbloquearLogro: async (id_partida, id_usuario, nombreLogro) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Verificar que el logro existe
      if (!esLogroValido(nombreLogro)) {
        throw new Error('Logro no válido');
      }

      // Desbloquear logro
      await EstadoJuegoModel.desbloquearLogro(id_partida, nombreLogro);

      // Obtener estado actualizado
      const estadoJuego = await EstadoJuegoModel.obtenerPorPartida(id_partida);

      // Calcular el rango actual
      const rango = EstadoJuegoModel.calcularRango(estadoJuego.logros);

      return {
        mensaje: `Logro "${nombreLogro}" desbloqueado`,
        logros: estadoJuego.logros,
        rango
      };
    } catch (error) {
      console.error('Error en EstadoJuegoService.desbloquearLogro:', error);
      throw error;
    }
  },

  /**
   * Verificar todos los logros al finalizar una partida
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>} Logros actualizados y rango
   */
  verificarTodosLosLogros: async (id_partida, id_usuario) => {
    try {
      // Verificar que la partida existe y pertenece al usuario
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      // Verificar todos los logros
      const logros = await EstadoJuegoModel.verificarTodosLosLogros(id_partida);

      // Calcular el rango final
      const rango = EstadoJuegoModel.calcularRango(logros);

      return {
        logros,
        rango
      };
    } catch (error) {
      console.error('Error en EstadoJuegoService.verificarTodosLosLogros:', error);
      throw error;
    }
  }
};

// Funciones auxiliares

/**
 * Tirar dados para un ataque
 * @param {number} cantidad - Cantidad de dados a tirar
 * @returns {Array<number>} Resultados de los dados
 */
function tirarDados(cantidad) {
  const resultados = [];
  for (let i = 0; i < cantidad; i++) {
    resultados.push(Math.floor(Math.random() * 6) + 1); // 1-6
  }
  return resultados;
}

/**
 * Obtener datos de un alien según su tipo
 * @param {string} tipoAlien - Tipo de alien
 * @returns {Object|null} Datos del alien o null si no existe
 */
function obtenerDatosAlien(tipoAlien) {
  const aliens = {
    arana: { nombre: 'Araña', danio: 1, objetivo: 3, pg: 1 },
    arana_monstruosa: { nombre: 'Araña Monstruosa', danio: 2, objetivo: 4, pg: 3 },
    sabueso: { nombre: 'Sabueso', danio: 2, objetivo: 5, pg: 2 },
    sabueso_rabioso: { nombre: 'Sabueso Rabioso', danio: 4, objetivo: 7, pg: 6 },
    rastreador: { nombre: 'Rastreador', danio: 3, objetivo: 6, pg: 4 },
    reina: { nombre: 'Reina', danio: 3, objetivo: 8, pg: 8 },
    reina_negra: { nombre: 'Reina Negra', danio: 4, objetivo: 9, pg: 10 }
  };

  return aliens[tipoAlien] || null;
}

/**
 * Verificar si un logro es válido
 * @param {string} nombreLogro - Nombre del logro
 * @returns {boolean} True si es válido
 */
function esLogroValido(nombreLogro) {
  const logrosValidos = [
    'PACIFICADOR',
    'DESCIFRADOR',
    'ARACNOFOBICO',
    'CAZADOR',
    'RASTREADOR',
    'GUERRERO',
    'ACUMULADOR',
    'EXTERMINADOR',
    'DOMADOR',
    'OSCURIDAD',
    'MEMORIAS',
    'NERVIOSO',
    'NORMAL',
    'DURO',
    'LOCO'
  ];

  return logrosValidos.includes(nombreLogro);
}

module.exports = EstadoJuegoService;