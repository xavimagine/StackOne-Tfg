const express = require("express");
const router = express.Router();
const listController = require("../controllers/listController");

// Middleware de protección
function soloLogueados(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.status(401).json({ error: "No autorizado" });
  }
}

router.post("/buscar", soloLogueados, listController.buscar);
router.post("/add", soloLogueados, listController.crear);
