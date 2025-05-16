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

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/admin', require('./routes/admin'));
// Nuevas rutas refactorizadas
app.use('/api/game', require('./routes/partidasRoutes'));
app.use('/api/game', require('./routes/mapaRoutes'));
app.use('/api/game', require('./routes/capitanRoutes'));
app.use('/api/game', require('./routes/inventarioRoutes'));
// Nueva ruta para el estado de juego
app.use('/api/game', require('./routes/estadoJuegoRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});