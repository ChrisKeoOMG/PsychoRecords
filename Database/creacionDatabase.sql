-- Tabla USUARIO
CREATE TABLE Usuario (
    idUsuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidoP VARCHAR(50) NOT NULL,
    apellidoM VARCHAR(50),
    correoElectronico VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    CP VARCHAR(10),
    calle VARCHAR(100),
    colonia VARCHAR(100),
    numCasa VARCHAR(20),
    ciudad VARCHAR(50),
    estado VARCHAR(50),
    rol VARCHAR(50) NOT NULL DEFAULT 'cliente',
    password VARCHAR(100) NOT NULL DEFAULT 'password'
);

--Tabla PRODUCTO
CREATE TABLE Producto (
    idProd SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    artista VARCHAR(100) NOT NULL,
    generoMus VARCHAR(50),
    anioLanzam INT,
    formato VARCHAR(20) CHECK (formato IN ('Vinilo', 'CD', 'Cassette')), -- Validación simple
    condiciones VARCHAR(50), -- Ej: Nuevo, Usado, Seminuevo
    cantStock INT DEFAULT 0,
    precio NUMERIC(10, 2) NOT NULL -- Importante para guardar el precio (10 dígitos, 2 decimales)
);

--Creación de la Tabla PUNTO_ENTREGA (NUEVA)
CREATE TABLE PuntoEntrega (
    idPunto SERIAL PRIMARY KEY,
    nombrePunto VARCHAR(50) NOT NULL, -- Ej: Sucursal Centro
    direccionCompleta TEXT NOT NULL,
    referencias TEXT,
    horarioAtencion VARCHAR(100)
);

--Tabla VENTA (Cabecera del pedido)
CREATE TABLE Venta (
    idVenta SERIAL PRIMARY KEY,
    idUsuario INT NOT NULL,
    idPunto INT NOT NULL, -- Aquí guardamos dónde recogerá el producto
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Se guarda la fecha/hora actual automáticamente
    totalVenta NUMERIC(10, 2) DEFAULT 0.00,
    estadoPedido VARCHAR(20) DEFAULT 'Pagado', -- Ej: Pagado, Entregado, Cancelado
    
    -- Relaciones (Llaves Foráneas)
    CONSTRAINT fk_venta_usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    CONSTRAINT fk_venta_punto FOREIGN KEY (idPunto) REFERENCES PuntoEntrega(idPunto)
);

-- 6. Creación de la Tabla DETALLE_VENTA (Los productos del carrito)
CREATE TABLE DetalleVenta (
    idDetalle SERIAL PRIMARY KEY,
    idVenta INT NOT NULL,
    idProd INT NOT NULL,
    cantidad INT NOT NULL,
    precioUnitario NUMERIC(10, 2) NOT NULL, -- Precio al momento de la compra
    
    -- Relaciones
    CONSTRAINT fk_detalle_venta FOREIGN KEY (idVenta) REFERENCES Venta(idVenta),
    CONSTRAINT fk_detalle_producto FOREIGN KEY (idProd) REFERENCES Producto(idProd)
);

-- --- DATOS DE EJEMPLO (OPCIONALES PARA PROBAR) ---

-- Insertar un Punto de Entrega
INSERT INTO PuntoEntrega (nombrePunto, direccionCompleta, horarioAtencion) 
VALUES ('Plaza Central', 'Av. Madero 123, Centro', 'Lun-Sab 10am-8pm');

-- Insertar un Producto
INSERT INTO Producto (titulo, artista, generoMus, anioLanzam, formato, condiciones, cantStock, precio) 
VALUES ('Abbey Road', 'The Beatles', 'Rock', 1969, 'Vinilo', 'Nuevo', 10, 550.00);

-- Insertar un Usuario
INSERT INTO Usuario (nombre, apellidoP, correoElectronico) 
VALUES ('Juan', 'Perez', 'juan@email.com');

INSERT INTO Usuario (nombre, apellidoP, correoElectronico, "password", rol) 
VALUES ('Kim', 'Marmolejo', 'kim@email.com', 'admin', 'admin');

-- (Nota: Para insertar una venta y su detalle, primero necesitas saber los IDs generados arriba)