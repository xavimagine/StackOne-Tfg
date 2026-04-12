import express from "express";
const router = express.Router();

import gameController from "../controllers/gameController.js";
import ListaController from "../controllers/listaController.js";

router.get("/buscar", gameController.buscarConPaginacion);
router.get("/listar", gameController.listar);
router.post("/lista", ListaController.toggle);
router.get("/progreso", ListaController.obtenerProgreso);

export default router;
