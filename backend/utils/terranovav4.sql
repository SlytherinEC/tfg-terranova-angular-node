-- Crear base de datos y seleccionarla
CREATE DATABASE terranovav4;
USE terranovav4;

-- Crear tabla roles
CREATE TABLE roles (
  id_rol INT(11) NOT NULL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

--
-- Volcado de datos para la tabla roles
--
INSERT INTO roles (id_rol, nombre) VALUES
(1, 'admin'),
(2, 'usuario');

-- Crear tabla usuarios
CREATE TABLE usuarios (
  id_usuario INT(11) NOT NULL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  id_rol INT(11) NOT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image VARCHAR(255) NOT NULL DEFAULT 'default_user.png',
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE
);

--
-- Volcado de datos para la tabla usuarios
--
INSERT INTO usuarios (id_usuario, nombre, email, contrasena, id_rol, fecha_registro, image) VALUES
(1, 'SlytherinEC', 'yborges2005@gmail.com', '$2b$10$QUFNqx9wFsOkI8Z0HEx9.uzb29lol8XO61HAy9VF8J/sH3l9r1Swi', 1, '2025-04-13 20:02:15', 'default_user.png');

-- Tabla principal de partidas (normalizada)
CREATE TABLE partidas (
  id_partida INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  dificultad ENUM('MUY_FACIL', 'NORMAL', 'DIFICIL', 'LOCURA') DEFAULT 'NORMAL',
  estado ENUM('EN_CURSO', 'VICTORIA', 'DERROTA') DEFAULT 'EN_CURSO',
  codigos_activacion INT DEFAULT 0,
  pasajeros INT DEFAULT 6,
  pasajeros_sacrificados INT DEFAULT 0,
  items_usados INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de capitanes (normalizada)
CREATE TABLE capitanes (
  id_capitan INT AUTO_INCREMENT PRIMARY KEY,
  id_partida INT NOT NULL,
  traje INT DEFAULT 6,
  estres INT DEFAULT 0,
  oxigeno INT DEFAULT 10,
  FOREIGN KEY (id_partida) REFERENCES partidas(id_partida) ON DELETE CASCADE,
  UNIQUE KEY (id_partida)
);

-- Tabla de mapas (semi-normalizada)
CREATE TABLE mapas (
  id_mapa INT AUTO_INCREMENT PRIMARY KEY,
  id_partida INT NOT NULL,
  posicion_actual_x INT DEFAULT 0,
  posicion_actual_y INT DEFAULT 0,
  -- Estructura compleja como JSON
  estructura_celdas JSON,
  adyacencias JSON,
  FOREIGN KEY (id_partida) REFERENCES partidas(id_partida) ON DELETE CASCADE,
  UNIQUE KEY (id_partida)
);

-- Tabla de habitaciones exploradas (normalizada para búsquedas eficientes)
CREATE TABLE habitaciones_exploradas (
  id_habitacion INT AUTO_INCREMENT PRIMARY KEY,
  id_partida INT NOT NULL,
  coordenada_x INT NOT NULL,
  coordenada_y INT NOT NULL,
  FOREIGN KEY (id_partida) REFERENCES partidas(id_partida) ON DELETE CASCADE,
  UNIQUE KEY (id_partida, coordenada_x, coordenada_y)
);

-- Tabla de inventario (semi-normalizada)
CREATE TABLE inventarios (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY,
  id_partida INT NOT NULL,
  armas JSON,  -- Lista de armas con sus propiedades
  mochila JSON, -- Lista de ítems en mochila
  FOREIGN KEY (id_partida) REFERENCES partidas(id_partida) ON DELETE CASCADE,
  UNIQUE KEY (id_partida)
);

-- Tabla de eventos y estado del juego (semi-normalizada)
CREATE TABLE estado_juego (
  id_estado INT AUTO_INCREMENT PRIMARY KEY,
  id_partida INT NOT NULL,
  eventos_completados JSON, -- Array de IDs de eventos completados
  encuentro_actual JSON,    -- Detalles del encuentro actual si existe
  logros JSON,              -- Mapping de logros y su estado
  FOREIGN KEY (id_partida) REFERENCES partidas(id_partida) ON DELETE CASCADE,
  UNIQUE KEY (id_partida)
);