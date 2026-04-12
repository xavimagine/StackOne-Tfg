import express from "express";
import authController from "../controllers/authController.js";
import { verificarJWT } from "./middleware.js";

const router = express.Router();

router.post("/registro", authController.registro);
router.post("/login", authController.login);
router.post("/logout", verificarJWT, authController.logout);
router.delete("/delete", verificarJWT, authController.deleteAccount);

export default router;
