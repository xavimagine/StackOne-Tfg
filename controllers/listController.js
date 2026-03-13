import { supabase } from "../db/database.js";
import ListasDAO from "../dao/ListasDao.js";
export const obtenerEstadisticasLista = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res
                .status(401)
                .json({ ok: false, mensaje: "No autorizado" });
        }

        const userId = req.session.user.id;
        const resultado = await ListasDAO.obtenerConteoPorEstado(userId);

        if (resultado.ok) {
            return res
                .status(200)
                .json({ ok: true, estadisticas: resultado.data });
        } else {
            return res
                .status(400)
                .json({ ok: false, mensaje: resultado.error });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, mensaje: "Error de servidor" });
    }
};
export const getJuegosDeMiLista = async (req, res) => {
    try {
        const { nombreLista } = req.params;

        const resultado = await ListasDAO.obtenerJuegosPorLista(
            userId,
            nombreLista,
        );

        if (resultado.success) {
            return res.status(200).json({
                ok: true,
                lista: nombreLista,
                juegos: resultado.data,
            });
        } else {
            return res
                .status(400)
                .json({ ok: false, mensaje: resultado.error });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, mensaje: "Error al recuperar la lista" });
    }
};
