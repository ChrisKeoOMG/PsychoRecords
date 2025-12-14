// src/controllers/usuarios.controller.js
const db = require('../db');

/**
 * POST /api/usuarios/registro - Registrar un nuevo Usuario
 */
const registrarUsuario = async (req, res) => {
    const { nombre, apellidoP, apellidoM, correoElectronico, password, telefono, CP, calle, colonia, numCasa, ciudad, estado } = req.body;

    // Consulta SQL para insertar el nuevo usuario
    const queryText = `
        INSERT INTO "usuario" (
            "nombre", "apellidop", "apellidom", "correoelectronico", "password", "telefono", 
            "cp", "calle", "colonia", "numcasa", "ciudad", "estado"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING "idusuario", "correoelectronico"`; // Devolver el ID generado

    const values = [nombre, apellidoP, apellidoM, correoElectronico, password, telefono, CP, calle, colonia, numCasa, ciudad, estado];

    try {
        const result = await db.query(queryText, values);
        const nuevoUsuario = result.rows[0];

        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            idUsuario: nuevoUsuario.idusuario,
            correoElectronico: nuevoUsuario.correoelectronico
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        // Manejo específico para violación de UNIQUE (correoElectronico)
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
};

/**
 * GET /api/usuarios/:id - Obtener perfil del usuario
 */
const getUsuarioById = async (req, res) => {
    const idUsuario = req.params.id;
    const queryText = 'SELECT * FROM "usuario" WHERE "idusuario" = $1';

    try {
        const result = await db.query(queryText, [idUsuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Evita enviar campos sensibles si los tuvieras (ej: contraseña, aunque aquí no está)
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener usuario ${idUsuario}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * POST /api/usuarios/login - Autenticar al usuario
 * Body esperado: { "correoElectronico": "...", "password": "..." }
 */
const loginUsuario = async (req, res) => {
    const { correoElectronico, password } = req.body;

    if (!correoElectronico || !password) {
        return res.status(400).json({ message: 'El correo electrónico y la contraseña son obligatorios.' });
    }

    // Consulta para buscar el usuario por correo y verificar la contraseña
    const queryText = `
        SELECT "idusuario", "nombre", "apellidop", "apellidom", "correoelectronico", "rol"
        FROM "usuario"
        WHERE "correoelectronico" = $1 AND "password" = $2;
    `;

    try {
        const result = await db.query(queryText, [correoElectronico, password]);

        if (result.rows.length === 0) {
            // Credenciales inválidas
            return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
        }

        const usuario = result.rows[0];

        // Autenticación exitosa
        res.status(200).json({
            message: 'Autenticación exitosa.',
            usuario: {
                idUsuario: usuario.idusuario,
                nombre: usuario.nombre,
                correoElectronico: usuario.correoElectronico,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante la autenticación.' });
    }
};

module.exports = {
    registrarUsuario,
    getUsuarioById,
    loginUsuario
};