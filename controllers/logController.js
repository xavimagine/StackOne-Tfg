import LogDAO from "../dao/LogDAO.js";

const registrarLog = async (req, res) => {
    const { tipo, mensaje } = req.body;

    if (!tipo || !mensaje) {
        return res.status(400).json({
            ok: false,
            mensaje: "El tipo y el mensaje son obligatorios.",
        });
    }
    try {
        await LogDAO.crearLog(tipo, mensaje);
        res.status(201).json({
            ok: true,
            mensaje: "Log registrado correctamente en el sistema.",
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error interno al procesar el log.",
        });
    }
};

export default { registrarLog };
