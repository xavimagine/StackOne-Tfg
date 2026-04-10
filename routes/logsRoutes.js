import express from "express";
const router = express.Router();

import { supabase } from "../db/database.js";

router.post("/", async (req, res) => {
    const { tipo, mensaje } = req.body;

    if (!tipo || !mensaje) {
        return res.status(400).json({ error: "Faltan campos" });
    }

    try {
        const { error } = await supabase
            .from("logs")
            .insert([{ tipo, mensaje }]);

        if (error) throw error;

        res.status(201).json({ ok: true, mensaje: "Log guardado" });
    } catch (err) {
        console.error("Error en DB:", err.message);
        res.status(500).json({ error: "No se pudo guardar el log" });
    }
});

export default router;
