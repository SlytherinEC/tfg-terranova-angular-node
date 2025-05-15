// backend/services/MapaService.js
const MapaModel = require('../models/MapaModel');
const PartidaModel = require('../models/PartidaModel');
const CapitanModel = require('../models/CapitanModel'); // Asumimos que existe
const InventarioModel = require('../models/InventarioModel'); // Asumimos que existe
const EstadoJuegoModel = require('../models/EstadoJuegoModel'); // Asumimos que existe

const MapaService = {
  /**
   * Generar estructura completa del mapa hexagonal
   */
  generarMapaHexagonal: () => {
    // Definición del mapa completo con adyacencias explícitas
    const mapDefinition = [
      // Fila 0
      [
        {
          tipo: 'inicio',
          coordenadas: { x: 0, y: 0 },
          adyacentes: [{ x: 0, y: 1 }, { x: 1, y: 1 }]
        }
      ],
      // Fila 1
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 1 },
          adyacentes: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 1 },
          adyacentes: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }]
        }
      ],
      // Fila 2
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 2 },
          adyacentes: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 3 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 2 },
          adyacentes: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 2 },
          adyacentes: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }]
        }
      ],
      // Fila 3
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 3 },
          adyacentes: [{ x: 0, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 0, y: 4 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 3 },
          adyacentes: [{ x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 1, y: 4 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 3 },
          adyacentes: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 4 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 3 },
          adyacentes: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 }]
        }
      ],
      // Fila 4
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 4 },
          adyacentes: [{ x: 0, y: 3 }, { x: 1, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 5 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 4 },
          adyacentes: [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 5 }, { x: 2, y: 5 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 4 },
          adyacentes: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 5 }, { x: 3, y: 5 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 4 },
          adyacentes: [{ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 5 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 4, y: 4 },
          adyacentes: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }]
        }
      ],
      // Fila 5
      [
        {
          tipo: 'evento_aleatorio',
          coordenadas: { x: 0, y: 5 },
          adyacentes: [{ x: 0, y: 4 }, { x: 1, y: 6 }, { x: 1, y: 5 }, { x: 0, y: 6 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 1, y: 5 },
          adyacentes: [{ x: 0, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 1, y: 6 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 5 },
          adyacentes: [{ x: 1, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 2, y: 6 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 5 },
          adyacentes: [{ x: 2, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 3, y: 6 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 4, y: 5 },
          adyacentes: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }]
        },
        {
          tipo: 'evento_aleatorio',
          coordenadas: { x: 5, y: 5 },
          adyacentes: [{ x: 4, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }]
        }
      ],
      // Fila 6
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 6 },
          adyacentes: [{ x: 0, y: 5 }, { x: 1, y: 7 }, { x: 1, y: 6 }, { x: 0, y: 7 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 6 },
          adyacentes: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 7 }, { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 7 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 2, y: 6 },
          adyacentes: [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 7 }, { x: 1, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 7 }]
        },
        {
          tipo: 'puerta_bloqueada',
          coordenadas: { x: 3, y: 6 },
          adyacentes: [{ x: 2, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 7 }, { x: 4, y: 7 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 4, y: 6 },
          adyacentes: [{ x: 3, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 7 }, { x: 5, y: 7 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 5, y: 6 },
          adyacentes: [{ x: 4, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 7 }, { x: 6, y: 7 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 6, y: 6 },
          adyacentes: [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 7 }, { x: 7, y: 7 }]
        }
      ],
      // Fila 7
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 7 },
          adyacentes: [{ x: 0, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 }, { x: 2, y: 8 }]
        },
        {
          tipo: 'estacion_oxigeno',
          coordenadas: { x: 1, y: 7 },
          adyacentes: [{ x: 0, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 7 }, { x: 2, y: 7 }, { x: 2, y: 8 }, { x: 3, y: 8 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 2, y: 7 },
          adyacentes: [{ x: 1, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 7 }, { x: 3, y: 7 }, { x: 3, y: 8 }, { x: 4, y: 8 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 7 },
          adyacentes: [{ x: 2, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 7 }, { x: 4, y: 7 }, { x: 4, y: 8 }, { x: 5, y: 8 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 4, y: 7 },
          adyacentes: [{ x: 3, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 6, y: 8 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 5, y: 7 },
          adyacentes: [{ x: 4, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 7 }, { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 7, y: 8 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 6, y: 7 },
          adyacentes: [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 7 }, { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 8 }]
        },
        {
          tipo: 'puerta_bloqueada',
          coordenadas: { x: 7, y: 7 },
          adyacentes: [{ x: 6, y: 6 }, { x: 6, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 8 }]
        }
      ],
      // Fila 8
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 8 },
          adyacentes: [{ x: 1, y: 8 }, { x: 0, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 8 },
          adyacentes: [{ x: 0, y: 7 }, { x: 0, y: 8 }, { x: 2, y: 8 }, { x: 0, y: 9 }, { x: 1, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 8 },
          adyacentes: [{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 1, y: 8 }, { x: 3, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 9 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 3, y: 8 },
          adyacentes: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 2, y: 8 }, { x: 4, y: 8 }, { x: 2, y: 9 }, { x: 3, y: 9 }]
        },
        {
          tipo: 'armeria',
          coordenadas: { x: 4, y: 8 },
          adyacentes: [{ x: 2, y: 7 }, { x: 3, y: 7 }, { x: 3, y: 8 }, { x: 5, y: 8 }, { x: 3, y: 9 }, { x: 4, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 5, y: 8 },
          adyacentes: [{ x: 3, y: 7 }, { x: 4, y: 7 }, { x: 4, y: 8 }, { x: 6, y: 8 }, { x: 4, y: 9 }, { x: 5, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 6, y: 8 },
          adyacentes: [{ x: 4, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 7, y: 8 }, { x: 5, y: 9 }, { x: 6, y: 9 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 7, y: 8 },
          adyacentes: [{ x: 5, y: 7 }, { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }, { x: 7, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 8, y: 8 },
          adyacentes: [{ x: 6, y: 7 }, { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 9, y: 8 }, { x: 7, y: 9 }, { x: 8, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 9, y: 8 },
          adyacentes: [{ x: 7, y: 7 }, { x: 8, y: 8 }, { x: 10, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 9 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 10, y: 8 },
          adyacentes: [{ x: 9, y: 8 }, { x: 9, y: 9 }]
        }
      ],
      // Fila 9
      [
        {
          tipo: 'puerta_bloqueada',
          coordenadas: { x: 0, y: 9 },
          adyacentes: [{ x: 0, y: 8 }, { x: 1, y: 8 }, { x: 1, y: 9 }, { x: 0, y: 10 }, { x: 1, y: 10 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 9 },
          adyacentes: [{ x: 1, y: 8 }, { x: 2, y: 8 }, { x: 0, y: 9 }, { x: 2, y: 9 }, { x: 1, y: 10 }, { x: 2, y: 10 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 2, y: 9 },
          adyacentes: [{ x: 2, y: 8 }, { x: 3, y: 8 }, { x: 1, y: 9 }, { x: 3, y: 9 }, { x: 2, y: 10 }, { x: 3, y: 10 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 3, y: 9 },
          adyacentes: [{ x: 3, y: 8 }, { x: 4, y: 8 }, { x: 2, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 10 }, { x: 4, y: 10 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 4, y: 9 },
          adyacentes: [{ x: 4, y: 8 }, { x: 5, y: 8 }, { x: 3, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 10 }, { x: 5, y: 10 }]
        },
        {
          tipo: 'evento_aleatorio',
          coordenadas: { x: 5, y: 9 },
          adyacentes: [{ x: 5, y: 8 }, { x: 6, y: 8 }, { x: 4, y: 9 }, { x: 6, y: 9 }, { x: 5, y: 10 }, { x: 6, y: 10 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 6, y: 9 },
          adyacentes: [{ x: 6, y: 8 }, { x: 7, y: 8 }, { x: 5, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 10 }, { x: 7, y: 10 }]
        },
        {
          tipo: 'estacion_oxigeno',
          coordenadas: { x: 7, y: 9 },
          adyacentes: [{ x: 7, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 10 }, { x: 8, y: 10 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 8, y: 9 },
          adyacentes: [{ x: 8, y: 8 }, { x: 9, y: 8 }, { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 10 }, { x: 9, y: 10 }]
        },
        {
          tipo: 'evento_aleatorio',
          coordenadas: { x: 9, y: 9 },
          adyacentes: [{ x: 9, y: 8 }, { x: 10, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }]
        }
      ],
      // Fila 10
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 10 },
          adyacentes: [{ x: 0, y: 9 }, { x: 1, y: 10 }, { x: 0, y: 11 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 1, y: 10 },
          adyacentes: [{ x: 0, y: 9 }, { x: 1, y: 9 }, { x: 0, y: 10 }, { x: 2, y: 10 }, { x: 0, y: 11 }, { x: 1, y: 11 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 2, y: 10 },
          adyacentes: [{ x: 1, y: 9 }, { x: 2, y: 9 }, { x: 1, y: 10 }, { x: 3, y: 10 }, { x: 1, y: 11 }, { x: 2, y: 11 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 10 },
          adyacentes: [{ x: 2, y: 9 }, { x: 3, y: 9 }, { x: 2, y: 10 }, { x: 4, y: 10 }, { x: 2, y: 11 }, { x: 3, y: 11 }]
        },
        {
          tipo: 'bahia_carga',
          coordenadas: { x: 4, y: 10 },
          adyacentes: [{ x: 3, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 10 }, { x: 5, y: 10 }, { x: 3, y: 11 }, { x: 4, y: 11 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 5, y: 10 },
          adyacentes: [{ x: 4, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 10 }, { x: 6, y: 10 }, { x: 4, y: 11 }, { x: 5, y: 11 }]
        },
        {
          tipo: 'control',
          coordenadas: { x: 6, y: 10 },
          adyacentes: [{ x: 5, y: 9 }, { x: 6, y: 9 }, { x: 5, y: 10 }, { x: 7, y: 10 }, { x: 5, y: 11 }, { x: 6, y: 11 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 7, y: 10 },
          adyacentes: [{ x: 6, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 10 }, { x: 8, y: 10 }, { x: 6, y: 11 }, { x: 7, y: 11 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 8, y: 10 },
          adyacentes: [{ x: 7, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 10 }, { x: 9, y: 10 }, { x: 7, y: 11 }, { x: 8, y: 11 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 9, y: 10 },
          adyacentes: [{ x: 8, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 10 }, { x: 10, y: 10 }, { x: 8, y: 11 }, { x: 9, y: 11 }]
        },
        {
          tipo: 'seguridad',
          coordenadas: { x: 10, y: 10 },
          adyacentes: [{ x: 9, y: 9 }, { x: 9, y: 10 }, { x: 9, y: 11 }]
        }
      ],
      // Fila 11
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 11 },
          adyacentes: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 1, y: 11 }]
        },
        {
          tipo: 'evento_aleatorio',
          coordenadas: { x: 1, y: 11 },
          adyacentes: [{ x: 1, y: 10 }, { x: 2, y: 10 }, { x: 0, y: 11 }, { x: 2, y: 11 }, { x: 0, y: 12 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 11 },
          adyacentes: [{ x: 2, y: 10 }, { x: 3, y: 10 }, { x: 1, y: 11 }, { x: 3, y: 11 }, { x: 0, y: 12 }, { x: 1, y: 12 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 11 },
          adyacentes: [{ x: 3, y: 10 }, { x: 4, y: 10 }, { x: 2, y: 11 }, { x: 4, y: 11 }, { x: 1, y: 12 }, { x: 2, y: 12 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 4, y: 11 },
          adyacentes: [{ x: 4, y: 10 }, { x: 5, y: 10 }, { x: 3, y: 11 }, { x: 5, y: 11 }, { x: 2, y: 12 }, { x: 3, y: 12 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 5, y: 11 },
          adyacentes: [{ x: 5, y: 10 }, { x: 6, y: 10 }, { x: 4, y: 11 }, { x: 6, y: 11 }, { x: 3, y: 12 }, { x: 4, y: 12 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 6, y: 11 },
          adyacentes: [{ x: 6, y: 10 }, { x: 7, y: 10 }, { x: 5, y: 11 }, { x: 7, y: 11 }, { x: 4, y: 12 }, { x: 5, y: 12 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 7, y: 11 },
          adyacentes: [{ x: 7, y: 10 }, { x: 8, y: 10 }, { x: 6, y: 11 }, { x: 8, y: 11 }, { x: 5, y: 12 }, { x: 6, y: 12 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 8, y: 11 },
          adyacentes: [{ x: 8, y: 10 }, { x: 9, y: 10 }, { x: 7, y: 11 }, { x: 9, y: 11 }, { x: 6, y: 12 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 9, y: 11 },
          adyacentes: [{ x: 9, y: 10 }, { x: 10, y: 10 }, { x: 8, y: 11 }]
        }
      ],
      // Fila 12
      [
        {
          tipo: 'explorable',
          coordenadas: { x: 0, y: 12 },
          adyacentes: [{ x: 1, y: 11 }, { x: 2, y: 11 }, { x: 1, y: 12 }, { x: 0, y: 13 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 12 },
          adyacentes: [{ x: 2, y: 11 }, { x: 3, y: 11 }, { x: 0, y: 12 }, { x: 2, y: 12 }, { x: 0, y: 13 }, { x: 1, y: 13 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 12 },
          adyacentes: [{ x: 3, y: 11 }, { x: 4, y: 11 }, { x: 1, y: 12 }, { x: 3, y: 12 }, { x: 1, y: 13 }, { x: 2, y: 13 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 12 },
          adyacentes: [{ x: 4, y: 11 }, { x: 5, y: 11 }, { x: 2, y: 12 }, { x: 4, y: 12 }, { x: 2, y: 13 }, { x: 3, y: 13 }]
        },
        {
          tipo: 'estacion_oxigeno',
          coordenadas: { x: 4, y: 12 },
          adyacentes: [{ x: 5, y: 11 }, { x: 6, y: 11 }, { x: 3, y: 12 }, { x: 5, y: 12 }, { x: 3, y: 13 }, { x: 4, y: 13 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 5, y: 12 },
          adyacentes: [{ x: 6, y: 11 }, { x: 7, y: 11 }, { x: 4, y: 12 }, { x: 6, y: 12 }, { x: 4, y: 13 }, { x: 5, y: 13 }]
        },
        {
          tipo: 'armeria',
          coordenadas: { x: 6, y: 12 },
          adyacentes: [{ x: 7, y: 11 }, { x: 8, y: 11 }, { x: 5, y: 12 }, { x: 5, y: 13 }]
        }
      ],
      // Fila 13
      [
        {
          tipo: 'inaccesible',
          coordenadas: { x: 0, y: 13 },
          adyacentes: [{ x: 0, y: 12 }, { x: 1, y: 12 }, { x: 1, y: 13 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 1, y: 13 },
          adyacentes: [{ x: 1, y: 12 }, { x: 2, y: 12 }, { x: 0, y: 13 }, { x: 2, y: 13 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 2, y: 13 },
          adyacentes: [{ x: 2, y: 12 }, { x: 3, y: 12 }, { x: 1, y: 13 }, { x: 3, y: 13 }, { x: 0, y: 14 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 3, y: 13 },
          adyacentes: [{ x: 3, y: 12 }, { x: 4, y: 12 }, { x: 2, y: 13 }, { x: 4, y: 13 }, { x: 0, y: 14 }]
        },
        {
          tipo: 'explorable',
          coordenadas: { x: 4, y: 13 },
          adyacentes: [{ x: 4, y: 12 }, { x: 5, y: 12 }, { x: 3, y: 13 }, { x: 5, y: 13 }]
        },
        {
          tipo: 'inaccesible',
          coordenadas: { x: 5, y: 13 },
          adyacentes: [{ x: 5, y: 12 }, { x: 6, y: 12 }, { x: 4, y: 13 }]
        }
      ],
      // Fila 14
      [
        {
          tipo: 'bahia_escape',
          coordenadas: { x: 0, y: 14 },
          adyacentes: [{ x: 2, y: 13 }, { x: 3, y: 13 }]
        }
      ]
    ];

    // Configuración de las puertas bloqueadas
    const puertasBloqueadas = [
      { y: 6, x: 3, codigos: 4 },
      { y: 7, x: 7, codigos: 1 },
      { y: 9, x: 0, codigos: 3 },
      { y: 14, x: 0, codigos: 6 }
    ];

    // Convertir la definición a la estructura de mapa requerida
    const mapa = [];
    const adyacencias = {};

    for (let y = 0; y < mapDefinition.length; y++) {
      const fila = [];
      const definicionesFila = mapDefinition[y] || [];

      for (let i = 0; i < definicionesFila.length; i++) {
        const def = definicionesFila[i];
        const { tipo, coordenadas, adyacentes } = def;
        const x = coordenadas.x;

        // Verificar si esta celda es una puerta bloqueada
        const esPuerta = tipo === 'puerta_bloqueada' ||
          (tipo === 'bahia_escape' && y === 14 && x === 0);

        let codigosRequeridos = 0;
        if (esPuerta) {
          // Encontrar cuántos códigos requiere esta puerta
          const puerta = puertasBloqueadas.find(p => p.y === y && p.x === x);
          codigosRequeridos = puerta ? puerta.codigos : 0;
        }

        // Crear celda
        const celda = {
          x,
          y,
          tipo,
          explorado: tipo === 'inicio',  // Solo el inicio está explorado inicialmente
          puerta_bloqueada: esPuerta,
          codigos_requeridos: codigosRequeridos
        };

        fila.push(celda);

        // Guardar adyacencias
        const key = `${x},${y}`;
        adyacencias[key] = adyacentes;
      }

      if (fila.length > 0) {
        mapa.push(fila);
      }
    }

    return { mapa, adyacencias };
  },

  /**
   * Verificar si un movimiento es válido
   */
  esMovimientoValido: async (id_partida, coordenadas) => {
    try {
      const mapa = await MapaModel.obtenerPorPartida(id_partida);
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!mapa || !partida) {
        return {
          valido: false,
          mensaje: 'Mapa o partida no encontrados'
        };
      }

      const { x, y } = coordenadas;

      // Verificar si las coordenadas están dentro del mapa
      if (!mapa.estructura_celdas || y < 0 || y >= mapa.estructura_celdas.length) {
        return {
          valido: false,
          mensaje: 'Coordenadas fuera del rango del mapa'
        };
      }

      // Buscar la celda en la fila correspondiente
      const fila = mapa.estructura_celdas[y];
      if (!fila) {
        return {
          valido: false,
          mensaje: 'Fila no encontrada en el mapa'
        };
      }

      const celda = fila.find(c => c.x === x && c.y === y);
      if (!celda) {
        return {
          valido: false,
          mensaje: 'Celda no encontrada en el mapa'
        };
      }

      // Verificar si la celda es inaccesible
      if (celda.tipo === 'inaccesible') {
        return {
          valido: false,
          mensaje: 'La celda es inaccesible'
        };
      }

      // Verificar si hay puerta bloqueada
      if (celda.puerta_bloqueada && partida.codigos_activacion < celda.codigos_requeridos) {
        return {
          valido: false,
          mensaje: `Puerta bloqueada. Se requieren ${celda.codigos_requeridos} códigos de activación.`
        };
      }

      // Verificar si hay un combate activo
      if (partida.encuentro_actual) {
        return {
          valido: false,
          mensaje: 'Hay un combate activo. Resuelve el encuentro antes de moverte.'
        };
      }

      // Obtener celdas adyacentes a la posición actual
      const posActual = mapa.posicion_actual;
      const keyActual = `${posActual.x},${posActual.y}`;
      const adyacentes = mapa.adyacencias[keyActual] || [];

      // Verificar si la celda está en las adyacentes o ya ha sido explorada
      const esAdyacente = adyacentes.some(adj => adj.x === x && adj.y === y);
      const estaExplorada = await MapaModel.estaExplorada(id_partida, x, y);

      if (!esAdyacente && !estaExplorada) {
        return {
          valido: false,
          mensaje: 'La celda no es adyacente ni ha sido explorada previamente'
        };
      }

      return {
        valido: true,
        celda
      };
    } catch (error) {
      console.error('Error al verificar movimiento:', error);
      return {
        valido: false,
        mensaje: 'Error al verificar movimiento: ' + error.message
      };
    }
  },

  /**
   * Explorar una celda
   */
  explorarCelda: async (id_partida, coordenadas) => {
    try {
      // Verificar si el movimiento es válido
      const verificacion = await this.esMovimientoValido(id_partida, coordenadas);
      if (!verificacion.valido) {
        return {
          exito: false,
          mensaje: verificacion.mensaje
        };
      }

      const celda = verificacion.celda;

      // Obtener partida y capitán
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida || !partida.capitan) {
        return {
          exito: false,
          mensaje: 'Datos de partida incompletos'
        };
      }

      // Actualizar posición actual
      await MapaModel.actualizarPosicion(id_partida, coordenadas.x, coordenadas.y);

      // Si la celda ya fue explorada, manejar revisita
      const estaExplorada = await MapaModel.estaExplorada(id_partida, coordenadas.x, coordenadas.y);
      if (estaExplorada) {
        return await this.manejarRevisitaCelda(id_partida, coordenadas);
      }

      // Marcar como explorada
      await MapaModel.marcarCeldaExplorada(id_partida, coordenadas.x, coordenadas.y);

      // Consumir oxígeno
      const nuevoOxigeno = Math.max(0, partida.capitan.oxigeno - 1);
      await CapitanModel.actualizarOxigeno(id_partida, nuevoOxigeno);

      // Verificar si se quedó sin oxígeno
      if (nuevoOxigeno <= 0) {
        await PartidaModel.actualizarEstado(id_partida, 'DERROTA');
        return {
          exito: false,
          resultado: 'derrota',
          mensaje: 'Te has quedado sin oxígeno. Fin del juego.'
        };
      }

      // Procesar según el tipo de celda
      return await this.procesarTipoCelda(id_partida, celda);

    } catch (error) {
      console.error('Error al explorar celda:', error);
      return {
        exito: false,
        mensaje: 'Error al explorar celda: ' + error.message
      };
    }
  },

  /**
   * Manejar revisita a una celda ya explorada
   */
  manejarRevisitaCelda: async (id_partida, coordenadas) => {
    try {
      // Tirar dado para determinar qué sucede al revisitar
      const resultado = Math.floor(Math.random() * 6) + 1; // 1-6

      if (resultado <= 2) {
        // Encuentro con alien (1-2)
        return await this.iniciarEncuentroAleatorio(id_partida);
      }
      else if (resultado <= 5) {
        // Habitación vacía, reduce estrés (3-5)
        const partida = await PartidaModel.obtenerPorId(id_partida);
        if (partida && partida.capitan) {
          const nuevoEstres = Math.max(0, partida.capitan.estres - 1);
          await CapitanModel.actualizarEstres(id_partida, nuevoEstres);
        }

        return {
          exito: true,
          resultado: {
            tipo: 'habitacion_vacia',
            mensaje: 'La habitación está vacía. Te sientes un poco más calmado (-1 Estrés).'
          }
        };
      }
      else {
        // Encuentras un pasajero (6)
        await PartidaModel.actualizarPasajeros(id_partida, (await PartidaModel.obtenerPorId(id_partida)).pasajeros + 1);

        return {
          exito: true,
          resultado: {
            tipo: 'pasajero',
            mensaje: '¡Has encontrado un superviviente! Se une a tu grupo.'
          }
        };
      }
    } catch (error) {
      console.error('Error al manejar revisita:', error);
      throw error;
    }
  },

  /**
   * Procesar acción según el tipo de celda
   */
  procesarTipoCelda: async (id_partida, celda) => {
    try {
      const partida = await PartidaModel.obtenerPorId(id_partida);

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      let resultado;

      switch (celda.tipo) {
        case 'estacion_oxigeno':
          // Recuperar oxígeno
          const nuevoOxigeno = Math.min(10, partida.capitan.oxigeno + 3);
          await CapitanModel.actualizarOxigeno(id_partida, nuevoOxigeno);
          resultado = {
            tipo: 'estacion_oxigeno',
            mensaje: 'Has recuperado 3 puntos de oxígeno'
          };
          break;

        case 'armeria':
          // Recargar todas las armas
          if (partida.armas) {
            const armasRecargadas = partida.armas.map(arma => ({
              ...arma,
              municion: arma.municion_max
            }));
            await InventarioModel.actualizarArmas(id_partida, armasRecargadas);
          }
          resultado = {
            tipo: 'armeria',
            mensaje: 'Has recargado todas tus armas'
          };
          break;

        case 'control':
          // Encontrar código de activación
          const nuevosCA = partida.codigos_activacion + 1;
          await PartidaModel.actualizarCodigosActivacion(id_partida, nuevosCA);
          resultado = {
            tipo: 'control',
            mensaje: 'Has encontrado un código de activación',
            codigos_activacion: nuevosCA
          };
          break;

        case 'bahia_carga':
          // Encontrar ítem aleatorio
          const itemAleatorio = this.obtenerItemAleatorio();
          if (partida.mochila && partida.mochila.length < 5) {
            await InventarioModel.agregarItem(id_partida, itemAleatorio);
          }
          resultado = {
            tipo: 'bahia_carga',
            mensaje: `Has encontrado: ${itemAleatorio.nombre}`,
            item: itemAleatorio
          };
          break;

        case 'evento_aleatorio':
          // Procesar evento aleatorio
          resultado = await this.procesarEventoAleatorio(id_partida);
          break;

        case 'bahia_escape':
          // Verificar victoria
          if (partida.codigos_activacion >= 6) {
            await PartidaModel.actualizarEstado(id_partida, 'VICTORIA');
            resultado = {
              tipo: 'victoria',
              mensaje: '¡Has desbloqueado la bahía de escape y escapado con éxito!'
            };
          } else {
            resultado = {
              tipo: 'bahia_escape',
              mensaje: `Necesitas ${6 - partida.codigos_activacion} códigos de activación más para desbloquear la puerta.`
            };
          }
          break;

        case 'explorable':
        default:
          // Explorar habitación normal
          resultado = await this.explorarHabitacionNormal(id_partida);
          break;
      }

      return {
        exito: true,
        resultado,
        partida: await PartidaModel.obtenerPorId(id_partida)
      };
    } catch (error) {
      console.error('Error al procesar tipo de celda:', error);
      throw error;
    }
  },

  // Métodos adicionales necesarios (implementación depende de la lógica específica del juego)
  iniciarEncuentroAleatorio: async (id_partida) => {
    // TODO: Implementar lógica de encuentros
    return {
      exito: true,
      resultado: {
        tipo: 'encuentro',
        mensaje: 'Implementación pendiente: encuentro aleatorio'
      }
    };
  },

  explorarHabitacionNormal: async (id_partida) => {
    // TODO: Implementar lógica de exploración normal
    return {
      exito: true,
      resultado: {
        tipo: 'habitacion_vacia',
        mensaje: 'Implementación pendiente: exploración normal'
      }
    };
  },

  procesarEventoAleatorio: async (id_partida) => {
    // TODO: Implementar lógica de eventos
    return {
      exito: true,
      resultado: {
        tipo: 'evento',
        mensaje: 'Implementación pendiente: evento aleatorio'
      }
    };
  },

  obtenerItemAleatorio: () => {
    const items = [
      { nombre: 'Kit de Reparación', efecto: 'Repara 2 puntos de traje', usos: 1 },
      { nombre: 'Analgésico', efecto: 'Reduce 2 puntos de estrés', usos: 1 },
      { nombre: 'Visor', efecto: 'Añade +1 a la precisión del arma', usos: 3 },
      { nombre: 'Munición', efecto: 'Recarga 2 municiones de un arma', usos: 1 },
      { nombre: 'Tanque de O2', efecto: 'Recupera 3 puntos de oxígeno', usos: 1 }
    ];

    const indice = Math.floor(Math.random() * items.length);
    return { ...items[indice] }; // Crear copia para no modificar el original
  },

// Agregar estas funciones al archivo MapaService.js existente

/**
 * Verificar acceso del usuario a una partida
 * @param {number} id_partida - ID de la partida
 * @param {number} id_usuario - ID del usuario
 * @throws {Error} Si la partida no existe o el usuario no tiene acceso
 */
verificarAccesoUsuario: async (id_partida, id_usuario) => {
    try {
      // Obtener partida para verificar el propietario
      const [partidas] = await db.query(
        'SELECT id_usuario FROM partidas WHERE id_partida = ?',
        [id_partida]
      );

      if (partidas.length === 0) {
        throw new Error('Partida no encontrada');
      }

      const partida = partidas[0];

      // Verificar que el usuario sea el propietario de la partida
      if (partida.id_usuario !== id_usuario) {
        throw new Error('No tienes permiso para acceder a esta partida');
      }

      return true;
    } catch (error) {
      console.error('Error al verificar acceso de usuario:', error);
      throw error;
    }
  },

  /**
   * Obtener mapa de una partida con verificación de acceso
   * @param {number} id_partida - ID de la partida
   * @param {number} id_usuario - ID del usuario
   * @returns {Object} Mapa de la partida
   * @throws {Error} Si la partida no existe, no tiene mapa, o el usuario no tiene acceso
   */
  obtenerMapaConVerificacion: async (id_partida, id_usuario) => {
    try {
      // Primero verificar acceso
      await MapaService.verificarAccesoUsuario(id_partida, id_usuario);

      // Obtener mapa
      const mapa = await MapaModel.obtenerPorPartida(id_partida);

      if (!mapa) {
        throw new Error('Mapa no encontrado para la partida');
      }

      return mapa;
    } catch (error) {
      console.error('Error al obtener mapa con verificación:', error);
      throw error;
    }
  },

  /**
   * Actualizar posición del jugador en el mapa
   * @param {number} id_partida - ID de la partida
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {boolean} True si la actualización fue exitosa
   */
  actualizarPosicion: async (id_partida, x, y) => {
    try {
      return await MapaModel.actualizarPosicion(id_partida, x, y);
    } catch (error) {
      console.error('Error al actualizar posición:', error);
      throw error;
    }
  }
};

module.exports = MapaService;