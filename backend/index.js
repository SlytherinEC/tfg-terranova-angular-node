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
// Nueva ruta para el capitán
app.use('/api/game', require('./routes/capitanRoutes'));
// Nueva ruta para el inventario
app.use('/api/game', require('./routes/inventarioRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
