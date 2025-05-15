// backend/models/PartidaModel.js
const db = require('../config/db');

const PartidaModel = {
  // Crear una nueva partida
  crear: async (id_usuario, dificultad = 'NORMAL') => {
    try {
      // Comenzar transacción
      await db.query('START TRANSACTION');

      // 1. Crear registro de partida
      const [resultPartida] = await db.query(
        'INSERT INTO partidas (id_usuario, dificultad) VALUES (?, ?)',
        [id_usuario, dificultad]
      );
      const id_partida = resultPartida.insertId;

      // 2. Crear registro de capitán
      const valorTraje = getValorInicialTraje(dificultad);
      const valorEstres = getValorInicialEstres(dificultad);
      await db.query(
        'INSERT INTO capitanes (id_partida, traje, estres, oxigeno) VALUES (?, ?, ?, 10)',
        [id_partida, valorTraje, valorEstres]
      );

      // 3. Generar inventario inicial basado en dificultad
      const armasIniciales = getArmasIniciales(dificultad);
      await db.query(
        'INSERT INTO inventarios (id_partida, armas, mochila) VALUES (?, ?, ?)',
        [id_partida, JSON.stringify(armasIniciales), JSON.stringify([])]
      );

      // 4. Inicializar estado del juego
      await db.query(
        'INSERT INTO estado_juego (id_partida, eventos_completados, encuentro_actual, logros) VALUES (?, ?, ?, ?)',
        [id_partida, JSON.stringify([]), null, JSON.stringify({})]
      );

      // Confirmar transacción
      await db.query('COMMIT');

      return id_partida;
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query('ROLLBACK');
      console.error('Error al crear partida:', error);
      throw error;
    }
  },

  // Obtener una partida por ID con todos sus componentes relacionados
  obtenerPorId: async (id_partida) => {
    try {
      // Obtener datos de la partida
      const [partidas] = await db.query(
        'SELECT * FROM partidas WHERE id_partida = ?',
        [id_partida]
      );

      if (partidas.length === 0) {
        return null;
      }

      const partida = partidas[0];

      // Obtener capitán
      const [capitanes] = await db.query(
        'SELECT * FROM capitanes WHERE id_partida = ?',
        [id_partida]
      );
      
      // Obtener mapa
      const [mapas] = await db.query(
        'SELECT * FROM mapas WHERE id_partida = ?',
        [id_partida]
      );
      
      // Obtener inventario
      const [inventarios] = await db.query(
        'SELECT * FROM inventarios WHERE id_partida = ?',
        [id_partida]
      );
      
      // Obtener estado del juego
      const [estados] = await db.query(
        'SELECT * FROM estado_juego WHERE id_partida = ?',
        [id_partida]
      );
      
      // Obtener habitaciones exploradas
      const [habitaciones] = await db.query(
        'SELECT coordenada_x, coordenada_y FROM habitaciones_exploradas WHERE id_partida = ?',
        [id_partida]
      );

      // Consolidar toda la información en un objeto
      return {
        id_partida: partida.id_partida,
        id_usuario: partida.id_usuario,
        dificultad: partida.dificultad,
        estado: partida.estado,
        codigos_activacion: partida.codigos_activacion,
        pasajeros: partida.pasajeros,
        fecha_creacion: partida.fecha_creacion,
        fecha_actualizacion: partida.fecha_actualizacion,
        capitan: capitanes.length > 0 ? {
          traje: capitanes[0].traje,
          estres: capitanes[0].estres,
          oxigeno: capitanes[0].oxigeno
        } : null,
        mapa: mapas.length > 0 ? {
          posicion_actual: {
            x: mapas[0].posicion_actual_x,
            y: mapas[0].posicion_actual_y
          },
          estructura_celdas: mapas[0].estructura_celdas ? JSON.parse(mapas[0].estructura_celdas) : [],
          adyacencias: mapas[0].adyacencias ? JSON.parse(mapas[0].adyacencias) : {}
        } : null,
        armas: inventarios.length > 0 && inventarios[0].armas ? JSON.parse(inventarios[0].armas) : [],
        mochila: inventarios.length > 0 && inventarios[0].mochila ? JSON.parse(inventarios[0].mochila) : [],
        eventos_completados: estados.length > 0 && estados[0].eventos_completados ? JSON.parse(estados[0].eventos_completados) : [],
        encuentro_actual: estados.length > 0 && estados[0].encuentro_actual ? JSON.parse(estados[0].encuentro_actual) : null,
        logros: estados.length > 0 && estados[0].logros ? JSON.parse(estados[0].logros) : {},
        habitaciones_exploradas: habitaciones.map(h => `${h.coordenada_x},${h.coordenada_y}`)
      };
    } catch (error) {
      console.error('Error al obtener partida:', error);
      throw error;
    }
  },

  // Obtener todas las partidas de un usuario
  obtenerPorUsuario: async (id_usuario) => {
    try {
      const [partidas] = await db.query(
        `SELECT p.*, c.traje, c.oxigeno, c.estres 
         FROM partidas p
         LEFT JOIN capitanes c ON p.id_partida = c.id_partida
         WHERE p.id_usuario = ?
         ORDER BY p.fecha_actualizacion DESC`,
        [id_usuario]
      );

      return partidas;
    } catch (error) {
      console.error('Error al obtener partidas del usuario:', error);
      throw error;
    }
  },

  // Actualizar estado de partida
  actualizarEstado: async (id_partida, nuevoEstado) => {
    try {
      const [result] = await db.query(
        'UPDATE partidas SET estado = ? WHERE id_partida = ?',
        [nuevoEstado, id_partida]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar estado de partida:', error);
      throw error;
    }
  },

  // Actualizar códigos de activación
  actualizarCodigosActivacion: async (id_partida, codigos) => {
    try {
      const [result] = await db.query(
        'UPDATE partidas SET codigos_activacion = ? WHERE id_partida = ?',
        [codigos, id_partida]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar códigos de activación:', error);
      throw error;
    }
  },

  // Actualizar número de pasajeros
  actualizarPasajeros: async (id_partida, pasajeros) => {
    try {
      const [result] = await db.query(
        'UPDATE partidas SET pasajeros = ? WHERE id_partida = ?',
        [pasajeros, id_partida]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar pasajeros:', error);
      throw error;
    }
  },

  // Registrar sacrificio de pasajero
  registrarSacrificio: async (id_partida) => {
    try {
      await db.query(
        'UPDATE partidas SET pasajeros_sacrificados = pasajeros_sacrificados + 1 WHERE id_partida = ?',
        [id_partida]
      );
      await db.query(
        'UPDATE partidas SET pasajeros = pasajeros - 1 WHERE id_partida = ?',
        [id_partida]
      );
      return true;
    } catch (error) {
      console.error('Error al registrar sacrificio:', error);
      throw error;
    }
  },

  // Registrar uso de item
  registrarUsoItem: async (id_partida) => {
    try {
      await db.query(
        'UPDATE partidas SET items_usados = items_usados + 1 WHERE id_partida = ?',
        [id_partida]
      );
      return true;
    } catch (error) {
      console.error('Error al registrar uso de item:', error);
      throw error;
    }
  }
};

// Funciones auxiliares
function getValorInicialTraje(dificultad) {
  switch (dificultad) {
    case 'MUY_FACIL': return 6;
    case 'NORMAL': return 4;
    case 'DIFICIL': return 3;
    case 'LOCURA': return 2;
    default: return 6;
  }
}

function getValorInicialEstres(dificultad) {
  switch (dificultad) {
    case 'MUY_FACIL': return 0;
    case 'NORMAL': return 1;
    case 'DIFICIL': return 2;
    case 'LOCURA': return 3;
    default: return 0;
  }
}

function getArmasIniciales(dificultad) {
  const todasLasArmas = [
    { nombre: 'Palanca', danio: 1, precision: 1, municion: null, municion_max: null }, // Munición ilimitada
    { nombre: 'Pistola de Plasma', danio: 2, precision: 3, municion: 4, municion_max: 4 },
    { nombre: 'Aguijón', danio: 3, precision: 2, municion: 3, municion_max: 3 },
    { nombre: 'Pistola Laser', danio: 3, precision: 3, municion: 2, municion_max: 2 },
    { nombre: 'Blaster', danio: 4, precision: 2, municion: 2, municion_max: 2 }
  ];
  
  switch (dificultad) {
    case 'MUY_FACIL':
      return todasLasArmas;
    case 'NORMAL':
      return todasLasArmas.filter(a => a.nombre !== 'Blaster');
    case 'DIFICIL':
      return todasLasArmas.filter(a => a.nombre !== 'Pistola Laser' && a.nombre !== 'Blaster');
    case 'LOCURA':
      return todasLasArmas.filter(a => a.nombre === 'Palanca' || a.nombre === 'Pistola de Plasma');
    default:
      return todasLasArmas;
  }
}

module.exports = PartidaModel;