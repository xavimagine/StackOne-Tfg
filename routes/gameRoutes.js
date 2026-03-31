const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// Todas las rutas protegidas
router.get("/buscar", gameController.buscarConPaginacion);
router.get("/listar", gameController.listar);

module.exports = router;
