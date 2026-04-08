const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const ListaController = require("../controllers/listaController");
// Todas las rutas protegidas
router.get("/buscar", gameController.buscarConPaginacion);
router.get("/listar", gameController.listar);
router.post("/lista", ListaController.toggle);
router.get("/progreso", ListaController.obtenerProgreso);
module.exports = router;
