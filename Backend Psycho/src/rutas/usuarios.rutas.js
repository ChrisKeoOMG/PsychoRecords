const express = require('express');
const router = express.Router();
const usuariosController = require('../controladores/usuarios.controlador');

router.post('/registro', usuariosController.registrarUsuario);
router.get('/:id', usuariosController.getUsuarioById);
router.post('/login', usuariosController.loginUsuario);

module.exports = router;