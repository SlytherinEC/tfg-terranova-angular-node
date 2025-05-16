// backend/controllers/EstadoJuegoController.js
const EstadoJuegoService = require('../services/EstadoJuegoService');

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
  resolverAtaque: async (req, res) => {
    try {
      const { id_partida } = req.params;
      const { armaSeleccionada } = req.body;
      const id_usuario = req.usuario.id_usuario;
      
      // Validaciones básicas
      if (!armaSeleccionada) {
        return res.status(400).json({ mensaje: 'Arma no seleccionada' });
      }
      
      try {
        const resultado = await EstadoJuegoService.resolverAtaque(
          id_partida, 
          id_usuario, 
          { armaSeleccionada }
        );
        
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
        if (error.message === 'Arma no encontrada') {
          return res.status(404).json({ mensaje: 'Arma no encontrada' });
        }
        if (error.message === 'El arma no tiene munición') {
          return res.status(400).json({ mensaje: 'El arma no tiene munición' });
        }
        throw error;
      }
    } catch (error) {
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
  }
};

module.exports = EstadoJuegoController;