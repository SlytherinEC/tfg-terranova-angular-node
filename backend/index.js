// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Permitir peticiones desde el frontend
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

// Rutas de autenticación y usuarios
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/admin', require('./routes/admin'));

// Nueva estructura más modular de rutas del juego
app.use('/api/game', require('./routes/game')); // Ruta principal del juego
app.use('/api/game', require('./routes/mapaRoutes'));
app.use('/api/game', require('./routes/capitanRoutes'));
app.use('/api/game', require('./routes/inventarioRoutes'));
app.use('/api/game', require('./routes/estadoJuegoRoutes'));

// Ya no es necesario importar partidasRoutes porque está incluido en game.js

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});