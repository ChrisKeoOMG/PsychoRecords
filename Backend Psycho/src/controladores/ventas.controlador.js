// src/controllers/ventas.controller.js
const db = require('../db');

/**
 * POST /api/ventas - Crea una nueva venta y sus detalles (Checkout)
 * * Body esperado (ejemplo):
 * {
 * "idUsuario": 1,
 * "idPunto": 1,
 * "productos": [
 * { "idProd": 1, "cantidad": 2, "precioUnitario": 550.00 },
 * { "idProd": 2, "cantidad": 1, "precioUnitario": 120.00 }
 * ]
 * }
 */
const crearVenta = async (req, res) => {
    const { idusuario, idpunto, productos } = req.body;

    console.log(idusuario, idpunto, productos);

    // 1. Obtener un cliente para la transacción
    const client = await db.getClient();

    try {
        // --- INICIO DE LA TRANSACCIÓN ---
        await client.query('BEGIN');

        // Calcular el total de la venta
        const totalVenta = productos.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

        // 2. Insertar en la tabla Venta
        const ventaQuery = `
            INSERT INTO "venta" ("idusuario", "idpunto", "totalventa", "estadopedido")
            VALUES ($1, $2, $3, 'Pagado')
            RETURNING "idventa", "fecha"`; // RETURNING nos da el ID y la fecha generados

        const resultVenta = await client.query(ventaQuery, [idusuario, idpunto, totalVenta]);
        const idVenta = resultVenta.rows[0].idventa;
        const fechaVenta = resultVenta.rows[0].fecha;

        // 3. Insertar en DetalleVenta y actualizar Stock
        for (const item of productos) {
            const { idprod, cantidad, precioUnitario } = item;

            // 3a. Verificar y actualizar Stock (Query importante)
            const stockCheckQuery = `
                UPDATE "producto"
                SET "cantstock" = "cantstock" - $1
                WHERE "idprod" = $2 AND "cantstock" >= $1
                RETURNING "cantstock"`; // Retorna el nuevo stock o nada si falla la condición

            const stockResult = await client.query(stockCheckQuery, [cantidad, idprod]);

            if (stockResult.rows.length === 0) {
                // Si la fila no se actualizó, significa que no había stock suficiente o el producto no existe
                throw new Error(`Stock insuficiente o producto no encontrado para idProd: ${idprod}.`);
            }

            // 3b. Insertar en DetalleVenta
            const detalleQuery = `
                INSERT INTO "detalleventa" ("idventa", "idprod", "cantidad", "preciounitario")
                VALUES ($1, $2, $3, $4)`;

            await client.query(detalleQuery, [idVenta, idprod, cantidad, precioUnitario]);
        }

        // 4. Si todo salió bien: COMMIT (confirmar la transacción)
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Venta creada exitosamente y stock actualizado.',
            idVenta,
            fechaVenta,
            totalVenta
        });

    } catch (error) {
        // 5. Si algo falló: ROLLBACK (deshacer todos los cambios)
        await client.query('ROLLBACK');

        console.error('Error en la transacción de venta:', error);
        res.status(500).json({
            message: 'Falló la creación de la venta. Se revirtieron los cambios.',
            error: error.message
        });

    } finally {
        // 6. Liberar el cliente del pool
        client.release();
    }
};

/**
 * GET /api/ventas/usuario/:idUsuario - Obtener historial de ventas de un usuario
 */
const getVentasByUsuario = async (req, res) => {
    const idUsuario = req.params.idUsuario;

    // Consulta compleja para obtener la venta, el punto de entrega y los detalles de la venta
    // las funciones de json_agg y json_build_object son para crear un json con los datos de la venta
    const queryText = `
        SELECT 
            V."idventa", V."fecha", V."totalventa", V."estadopedido",
            PE."nombrepunto", PE."direccioncompleta",
            json_agg(
                json_build_object(
                    'iddetalle', DV."iddetalle",
                    'titulo', P."titulo",
                    'artista', P."artista",
                    'cantidad', DV."cantidad",
                    'precioUnitario', DV."preciounitario"
                )
            ) AS detalles
        FROM "venta" V
        JOIN "puntoentrega" PE ON V."idpunto" = PE."idpunto"
        JOIN "detalleventa" DV ON V."idventa" = DV."idventa"
        JOIN "producto" P ON DV."idprod" = P."idprod"
        WHERE V."idusuario" = $1
        GROUP BY V."idventa", PE."idpunto"
        ORDER BY V."fecha" DESC;
    `;

    try {
        const result = await db.query(queryText, [idUsuario]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: 'El usuario no tiene ventas registradas.',
                ventas: []
            });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Error al obtener ventas del usuario ${idUsuario}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al consultar historial de ventas.' });
    }
};

module.exports = {
    crearVenta,
    getVentasByUsuario
};