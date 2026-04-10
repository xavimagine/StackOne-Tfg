import express from "express";
const router = express.Router();

import listController from "../controllers/listaController.js";

// Middleware de protección
function soloLogueados(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ error: "No autorizado" });
    }
}

router.get("/games/lista/:status", listController.obtenerPorEstado);
router.post("/buscar", soloLogueados, listController.buscar);
router.post("/add", soloLogueados, listController.crear);

export default router;
