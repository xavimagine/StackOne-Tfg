import express from "express";
import gameController from "../controllers/gameController.js";
import ListaController from "../controllers/listaController.js";
import { verificarJWT } from "./middleware.js";

const router = express.Router();

router.get("/buscar", gameController.buscarConPaginacion);
router.get("/listar", gameController.listar);
router.post("/lista", verificarJWT, ListaController.toggle);
router.get("/lista/:status", verificarJWT, ListaController.obtenerPorEstado);
router.get("/progreso", verificarJWT, ListaController.obtenerProgreso);

export default router;
