const express = require("express");
const router = express.Router();
const { supabase } = require("../db/database"); // Tu config de Supabase

router.post("/", async (req, res) => {
  const { tipo, mensaje } = req.body;

  // Validación básica
  if (!tipo || !mensaje) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  try {
    const { error } = await supabase.from("logs").insert([{ tipo, mensaje }]);

    if (error) throw error;

    res.status(201).json({ ok: true, mensaje: "Log guardado" });
  } catch (err) {
    console.error("Error en DB:", err.message);
    res.status(500).json({ error: "No se pudo guardar el log" });
  }
});

module.exports = router;
