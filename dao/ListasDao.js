const { supabase } = require("../db/database");

class ListasDAO {
    static async obtenerConteoPorEstado(userId) {
        try {
            // IMPORTANTE: Asegúrate de que la tabla sea "listas_games"
            // como en tus controladores anteriores, o "listas_juegos".
            const { data, error } = await supabase
                .from("listas_games")
                .select("status")
                .eq("user_id", userId);

            if (error) throw error;

            const conteo = data.reduce(
                (acc, curr) => {
                    const s = curr.status.toLowerCase();
                    if (acc.hasOwnProperty(s)) {
                        acc[s]++;
                    }
                    return acc;
                },
                { jugando: 0, acabado: 0, deseado: 0, abandonado: 0 },
            );

            return { ok: true, data: conteo };
        } catch (error) {
            console.error("Error en DAO al contar juegos:", error);
            return { ok: false, error: error.message };
        }
    }

    static async obtenerJuegosPorLista(userId, status) {
        try {
            const { data, error } = await supabase
                .from("listas_games")
                .select(
                    `
                    id_relacion,
                    status,
                    fecha_agregado,
                    games (
                        id,
                        id_game,
                        name,
                        cover,
                        genres,
                        platforms,
                        rating,
                        company
                    )
                `,
                )
                .eq("user_id", userId)
                .eq("status", status.toLowerCase());

            if (error) throw error;

            // Limpiamos la respuesta y manejamos posibles nulos
            const juegosFormateados = data
                .filter((item) => item.games !== null) // Evita errores si un juego fue borrado de la tabla principal
                .map((item) => ({
                    id_relacion: item.id_relacion,
                    status: item.status,
                    fecha: item.fecha_agregado,
                    ...item.games,
                }));

            return { success: true, data: juegosFormateados };
        } catch (error) {
            console.error("Error en obtenerJuegosPorLista:", error.message);
            return { success: false, error: error.message };
        }
    }

    static async obtenerProgreso(req, res) {
        const userId = req.session.usuario?.id;
        const resultado = await ListasDAO.obtenerConteoPorEstado(userId);

        if (resultado.ok) {
            // Aquí calculas el nivel con resultado.data.acabado
            // ...
        }
    }
    static async obtenerJuegosPorEstado(userId, status) {
        const { data, error } = await supabase
            .from("listas_games")
            .select(
                `
            game_id,
            status,
            games (
                id, id_game, name, cover, genres, 
                rating, game_modes, company
            )
        `,
            )
            .eq("user_id", userId)
            .eq("status", status);

        if (error) throw error;
        return data.map((item) => ({
            ...item.games,
            user_status: item.status,
        }));
    }
}

module.exports = ListasDAO;
