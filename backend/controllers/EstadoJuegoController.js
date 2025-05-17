// backend/controllers/EstadoJuegoController.js
const EstadoJuegoService = require('../services/EstadoJuegoService');
const InventarioService = require('../services/InventarioService');
const PartidaService = require('../services/PartidaService');
const CapitanService = require('../services/CapitanService');

const EstadoJuegoController = {
  /**
   * Obtener estado de juego completo
   */
  obtenerEstadoJuego: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;

      try {
        const estadoJuego = await EstadoJuegoService.obtenerEstadoJuego(id_partida, id_usuario);
        res.status(200).json(estadoJuego);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Estado de juego no encontrado') {
          return res.status(404).json({ mensaje: 'Estado de juego no encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al obtener estado de juego:', error);
      res.status(500).json({ mensaje: 'Error al obtener estado de juego', error: error.message });
    }
  },

  /**
   * Iniciar un encuentro con un alien
   */
  iniciarEncuentro: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { tipoAlien } = req.body;
      const id_usuario = req.usuario.id_usuario;

      // Validaciones básicas
      if (!tipoAlien) {
        return res.status(400).json({ mensaje: 'Tipo de alien no proporcionado' });
      }

      try {
        const encuentro = await EstadoJuegoService.iniciarEncuentro(id_partida, id_usuario, tipoAlien);
        res.status(200).json({
          mensaje: `Has encontrado un ${encuentro.datos.nombre}`,
          encuentro
        });
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Estado de juego no encontrado') {
          return res.status(404).json({ mensaje: 'Estado de juego no encontrado' });
        }
        if (error.message === 'Ya hay un encuentro activo') {
          return res.status(400).json({ mensaje: 'Ya hay un encuentro activo' });
        }
        if (error.message === 'Tipo de alien no válido') {
          return res.status(400).json({ mensaje: 'Tipo de alien no válido' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al iniciar encuentro:', error);
      res.status(500).json({ mensaje: 'Error al iniciar encuentro', error: error.message });
    }
  },

  /**
   * Resolver un ataque en un encuentro
   */
  // Modificar resolverAtaque para adaptarlo a la funcionalidad de resolverCombate
  resolverAtaque: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { armaSeleccionada, usarItem } = req.body; // Ahora también acepta usarItem
      const id_usuario = req.usuario.id_usuario;

      // Validaciones básicas
      if (!armaSeleccionada) {
        return res.status(400).json({ mensaje: 'Arma no seleccionada' });
      }

      // Si se especifica un ítem para usar
      if (usarItem !== undefined) {
        // Usar el ítem antes del ataque
        try {
          await InventarioService.usarItem(id_partida, id_usuario, usarItem);
        } catch (error) {
          // Si hay error al usar el ítem, continuamos igualmente con el ataque
          console.warn('Error al usar ítem en combate:', error.message);
        }
      }

      // Resolver ataque
      const resultado = await EstadoJuegoService.resolverAtaque(
        id_partida,
        id_usuario,
        { armaSeleccionada }
      );

      // Obtener el estado actualizado de la partida
      const partida = await PartidaService.obtenerPartida(id_partida, id_usuario);

      // Incluir la partida en la respuesta para compatibilidad con el código antiguo
      res.status(200).json({
        ...resultado,
        partida
      });
    } catch (error) {
      // Manejo de errores con verificación de casos específicos
      if (error.message === 'Partida no encontrada') {
        return res.status(404).json({ mensaje: 'Partida no encontrada' });
      }
      if (error.message === 'No tienes permiso para acceder a esta partida') {
        return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
      }
      if (error.message === 'No hay un encuentro activo') {
        return res.status(400).json({ mensaje: 'No hay un encuentro activo' });
      }

      console.error('Error al resolver ataque:', error);
      res.status(500).json({ mensaje: 'Error al resolver ataque', error: error.message });
    }
  },

  /**
   * Finalizar un encuentro (huir)
   */
  finalizarEncuentro: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;

      try {
        const resultado = await EstadoJuegoService.finalizarEncuentro(id_partida, id_usuario);
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'No hay un encuentro activo') {
          return res.status(400).json({ mensaje: 'No hay un encuentro activo' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al finalizar encuentro:', error);
      res.status(500).json({ mensaje: 'Error al finalizar encuentro', error: error.message });
    }
  },

  // Combinación de resolverEvento y registrarEvento
  resolverEvento: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { numeroEvento, opcionSeleccionada } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (!numeroEvento || !opcionSeleccionada) {
        return res.status(400).json({ mensaje: 'Evento y opción son requeridos' });
      }
      
      // Procesar el evento mediante el servicio existente
      const resultado = await EstadoJuegoService.procesarEvento(
        id_partida, 
        id_usuario, 
        numeroEvento,
        opcionSeleccionada
      );
      
      // Registrar el evento como completado
      await EstadoJuegoService.registrarEventoCompletado(
        id_partida, 
        id_usuario, 
        numeroEvento
      );
      
      // Obtener partida actualizada para enviar al cliente
      const partida = await PartidaService.obtenerPartida(id_partida, id_usuario);
      
      res.status(200).json({
        exito: true,
        resultado,
        partida
      });
    } catch (error) {
      // Manejo de errores
      if (error.message === 'Partida no encontrada') {
        return res.status(404).json({ mensaje: 'Partida no encontrada' });
      }
      if (error.message === 'No tienes permiso para acceder a esta partida') {
        return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
      }
      
      console.error('Error al resolver evento:', error);
      res.status(500).json({ mensaje: 'Error al resolver evento', error: error.message });
    }
  },

  /**
   * Registrar un evento completado
   */
  registrarEvento: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { idEvento } = req.body;
      const id_usuario = req.usuario.id_usuario;

      // Validaciones básicas
      if (!idEvento) {
        return res.status(400).json({ mensaje: 'ID de evento no proporcionado' });
      }

      try {
        const resultado = await EstadoJuegoService.registrarEventoCompletado(
          id_partida,
          id_usuario,
          idEvento
        );

        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al registrar evento:', error);
      res.status(500).json({ mensaje: 'Error al registrar evento', error: error.message });
    }
  },

  /**
   * Verificar y actualizar todos los logros
   */
  verificarLogros: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const id_usuario = req.usuario.id_usuario;

      try {
        const resultado = await EstadoJuegoService.verificarTodosLosLogros(id_partida, id_usuario);
        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al verificar logros:', error);
      res.status(500).json({ mensaje: 'Error al verificar logros', error: error.message });
    }
  },

  /**
   * Desbloquear un logro específico
   */
  desbloquearLogro: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { nombreLogro } = req.body;
      const id_usuario = req.usuario.id_usuario;

      // Validaciones básicas
      if (!nombreLogro) {
        return res.status(400).json({ mensaje: 'Nombre de logro no proporcionado' });
      }

      try {
        const resultado = await EstadoJuegoService.desbloquearLogro(
          id_partida,
          id_usuario,
          nombreLogro
        );

        res.status(200).json(resultado);
      } catch (error) {
        if (error.message === 'Partida no encontrada') {
          return res.status(404).json({ mensaje: 'Partida no encontrada' });
        }
        if (error.message === 'No tienes permiso para acceder a esta partida') {
          return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta partida' });
        }
        if (error.message === 'Logro no válido') {
          return res.status(400).json({ mensaje: 'Logro no válido' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al desbloquear logro:', error);
      res.status(500).json({ mensaje: 'Error al desbloquear logro', error: error.message });
    }
  },

  // Método para sacrificar pasajero (absorbido de gameController)
  sacrificarPasajero: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { accion } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validar acción
      if (!accion || !['escapar_encuentro', 'evadir_ataque', 'recuperar_oxigeno'].includes(accion)) {
        return res.status(400).json({ mensaje: 'Acción no válida' });
      }
      
      // Obtener partida
      const partida = await PartidaService.obtenerPartida(id_partida, id_usuario);
      
      // Verificar si tienen pasajeros
      if (partida.pasajeros <= 0) {
        return res.status(400).json({ mensaje: 'No tienes pasajeros para sacrificar' });
      }
      
      // Realizar acción según el tipo
      let resultado;
      
      switch (accion) {
        case 'escapar_encuentro':
          // Finalizar el encuentro actual
          resultado = await EstadoJuegoService.finalizarEncuentro(id_partida, id_usuario);
          break;
          
        case 'evadir_ataque':
          // Agregar flag temporal para evadir el próximo ataque
          // Esta lógica puede necesitar implementación en EstadoJuegoService
          resultado = { mensaje: 'Pasajero sacrificado para evadir el próximo ataque' };
          break;
          
        case 'recuperar_oxigeno':
          // Recuperar oxígeno
          resultado = await CapitanService.recuperarOxigeno(id_partida, id_usuario, 3, false);
          break;
      }
      
      // Registrar sacrificio del pasajero
      await PartidaService.sacrificarPasajero(id_partida, id_usuario);
      
      // Obtener la partida actualizada
      const partidaActualizada = await PartidaService.obtenerPartida(id_partida, id_usuario);
      
      res.status(200).json({
        exito: true,
        resultado,
        partida: partidaActualizada
      });
    } catch (error) {
      // Manejo de errores
      console.error('Error al sacrificar pasajero:', error);
      res.status(500).json({ mensaje: 'Error al sacrificar pasajero', error: error.message });
    }
  }
};

module.exports = EstadoJuegoController;