const express = require("express");
const router = express.Router();
const listController = require("../controllers/listaController");

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

module.exports = router;
