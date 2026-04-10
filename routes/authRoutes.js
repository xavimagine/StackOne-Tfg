const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const isAuthenticated = (req, res, next) => {
    if (req.session.usuario) return next();
    res.status(401).json({ ok: false, mensaje: "No autorizado" });
};

// Registro
router.post("/registro", authController.registro);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", isAuthenticated, authController.logout);
//Eliminar cuenta
router.delete("/delete", isAuthenticated, authController.deleteAccount);
module.exports = router;
