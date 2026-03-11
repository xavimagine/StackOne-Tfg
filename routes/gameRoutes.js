const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// Todas las rutas protegidas
router.post("/buscar", gameController.buscarConPaginacion);
router.post("/listar", gameController.listar);

module.exports = router;
