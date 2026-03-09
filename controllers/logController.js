const LogDAO = require("../dao/LogDAO");

const registrarLog = async (req, res) => {
  const { tipo, mensaje } = req.body;

  // Validación básica de entrada
  if (!tipo || !mensaje) {
    return res.status(400).json({
      ok: false,
      mensaje: "El tipo y el mensaje son obligatorios.",
    });
  }

  try {
    const log = await LogDAO.crearLog(tipo, mensaje);

    res.status(201).json({
      ok: true,
      mensaje: "Log registrado correctamente en el sistema.",
    });
  } catch (error) {
    // Aquí es donde el catch del controller captura errores del DAO o de red
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al procesar el log.",
    });
  }
};

module.exports = { registrarLog };
