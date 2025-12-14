const express = require('express');
const router = express.Router();
const ventasController = require('../controladores/ventas.controlador');

router.post('/', ventasController.crearVenta);
router.get('/usuario/:idUsuario', ventasController.getVentasByUsuario);

module.exports = router;