const { supabase } = require("../db/database");
const ListasDAO = require("../dao/listasDAO");
class ListaController {
    static async toggle(req, res) {
        try {
            const user_id = req.session.usuario?.id;
            const { game_id, status } = req.body;

            //  Validación de seguridad
            if (!user_id || !game_id || !status) {
                return res
                    .status(400)
                    .json({ error: "Sesión expirada o faltan datos" });
            }

            const statusLimpio = status.trim().toLowerCase();
            const gameIdNum = parseInt(game_id, 10);

            const { data: existing, error: selectError } = await supabase
                .from("listas_games")
                .select("id, status")
                .eq("user_id", user_id)
                .eq("game_id", gameIdNum)
                .maybeSingle();

            if (selectError) throw selectError;

            if (existing) {
                if (existing.status === statusLimpio) {
                    const { error: deleteError } = await supabase
                        .from("listas_games")
                        .delete()
                        .eq("id", existing.id);

                    if (deleteError) throw deleteError;
                    return res.json({ action: "removed" });
                } else {
                    const { error: updateError } = await supabase
                        .from("listas_games")
                        .update({ status: statusLimpio })
                        .eq("id", existing.id);

                    if (updateError) throw updateError;
                    return res.json({
                        action: "updated",
                        newStatus: statusLimpio,
                    });
                }
            } else {
                const { error: insertError } = await supabase
                    .from("listas_games")
                    .insert({
                        user_id: user_id,
                        game_id: gameIdNum,
                        status: statusLimpio,
                    });

                if (insertError) throw insertError;
                return res.json({ action: "added" });
            }
        } catch (error) {
            console.error("Error detallado en toggle:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async obtenerProgreso(req, res) {
        try {
            const userId = req.session.usuario?.id;

            if (!userId) {
                return res
                    .status(401)
                    .json({ ok: false, mensaje: "Sin sesión" });
            }

            const resultado = await ListasDAO.obtenerConteoPorEstado(userId);

            const totalAcabados = resultado.data?.acabado || 0;

            const XP_MAX_NIVEL = 3000;
            const XP_POR_JUEGO = 100;
            const xpTotal = totalAcabados * XP_POR_JUEGO;

            const nivel = 1 + Math.floor(xpTotal / XP_MAX_NIVEL);
            const xpBarra = xpTotal % XP_MAX_NIVEL;

            return res.json({
                ok: true,
                nivel,
                xpBarra,
                xpMax: XP_MAX_NIVEL,
                totalAcabados,
            });
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    }
}

module.exports = ListaController;
