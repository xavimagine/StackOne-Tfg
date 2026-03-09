const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Registro
router.post("/registro", authController.registro);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
