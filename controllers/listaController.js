const { supabase } = require("../db/database");

class ListaController {
    static async toggle(req, res) {
        try {
            const user_id = req.session.usuario?.id;
            const { game_id, status } = req.body;

            // 1. Validación de seguridad
            if (!user_id || !game_id || !status) {
                return res
                    .status(400)
                    .json({ error: "Sesión expirada o faltan datos" });
            }

            const statusLimpio = status.trim().toLowerCase();
            const gameIdNum = parseInt(game_id, 10);

            // 2. Buscamos si el juego YA está en cualquier lista del usuario
            const { data: existing, error: selectError } = await supabase
                .from("listas_games")
                .select("id, status")
                .eq("user_id", user_id)
                .eq("game_id", gameIdNum) // Buscamos solo por juego, ignoramos el status aquí
                .maybeSingle();

            if (selectError) throw selectError;

            // 3. Lógica de Decisión (Toggle / Update / Insert)
            if (existing) {
                if (existing.status === statusLimpio) {
                    // Caso A: El usuario pulsa el mismo botón -> Quitar de la lista
                    const { error: deleteError } = await supabase
                        .from("listas_games")
                        .delete()
                        .eq("id", existing.id);

                    if (deleteError) throw deleteError;
                    return res.json({ action: "removed" });
                } else {
                    // Caso B: El juego ya estaba (ej. 'jugando') pero pulsa otro (ej. 'acabado') -> Actualizar
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
                // Caso C: El juego no estaba en ninguna lista -> Insertar nuevo
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
            const user_id = req.session.usuario?.id || req.query.user_id;

            if (!user_id) {
                return res
                    .status(400)
                    .json({ error: "Usuario no identificado" });
            }

            // Usamos head:true para no traer datos, solo el conteo
            const { count, error } = await supabase
                .from("listas_games")
                .select("*", { count: "planned", head: true })
                .eq("user_id", user_id)
                .eq("status", "acabado");

            if (error) throw error;

            const XP_POR_JUEGO = 100;
            const XP_MAX_NIVEL = 3000;
            const xpTotal = (count || 0) * XP_POR_JUEGO;
            const nivel = 1 + Math.floor(xpTotal / XP_MAX_NIVEL);
            const xpBarra = xpTotal % XP_MAX_NIVEL;

            return res.json({
                nivel: nivel,
                xpBarra: xpBarra,
                xpMax: XP_MAX_NIVEL,
                totalAcabados: count || 0,
            });
        } catch (error) {
            console.error("Error en obtenerProgreso:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ListaController;
