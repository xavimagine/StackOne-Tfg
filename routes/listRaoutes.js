import express from "express";
import listController from "../controllers/listaController.js";
import { verificarJWT } from "./middleware.js";

const router = express.Router();

router.get("/games/lista/:status", listController.obtenerPorEstado);
router.get("/games/buscar", listController.buscar);
router.post("/games/add", verificarJWT, listController.crear);

export default router;
