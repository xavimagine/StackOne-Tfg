const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// Middleware de protección
function soloLogueados(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ error: "No autorizado" });
    }
}

// Todas las rutas protegidas
router.post("/buscar", soloLogueados, gameController.buscar);
router.post("/crear", soloLogueados, gameController.crear);

module.exports = router;
