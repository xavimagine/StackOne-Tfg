import { supabase } from "../db/database.js";
class GameDAO {
    static async buscarConPaginacion(
        userId = 0,
        texto = "",
        orden = "name",
        direccion = "asc",
        page = 1,
        limit = 10,
        genero = "",
        plataforma = "",
        rating = null,
    ) {
        try {
            const columnasValidas = ["name", "rating", "genres", "platforms"];
            if (!columnasValidas.includes(orden)) orden = "name";
            if (!["asc", "desc"].includes(direccion)) direccion = "asc";

            const offset = (page - 1) * limit;

            let query = supabase
                .from("games")
                .select(
                    "id, id_game, name, summary, cover, genres, rating, game_modes, company",
                    { count: "planned" },
                )
                .order(orden, { ascending: direccion === "asc" });

            // Aplicar filtros
            if (texto?.trim()) {
                query = query.ilike("name", `%${texto.trim()}%`);
            }
            if (genero?.trim()) {
                query = query.contains("genres", [genero.trim()]);
            }
            if (plataforma?.trim()) {
                query = query.contains("platforms", [plataforma.trim()]);
            }
            if (rating !== null && !isNaN(rating)) {
                query = query.gte("rating", Number(rating));
            }

            query = query.range(offset, offset + limit - 1);

            const { data: gamesData, count, error } = await query;

            if (error) throw error;
            if (!gamesData || gamesData.length === 0) {
                return { games: [], total: count || 0 };
            }

            let marcadosMap = {};

            if (userId) {
                const idsEnPagina = gamesData.map((g) => g.id);

                const { data: marcados, error: errorMarcados } = await supabase
                    .from("listas_games")
                    .select("game_id, status")
                    .eq("user_id", userId)
                    .in("game_id", idsEnPagina);

                if (!errorMarcados && marcados) {
                    marcados.forEach((m) => {
                        marcadosMap[m.game_id] = m.status;
                    });
                }
            }

            const games = gamesData.map((game) => ({
                ...game,
                status: marcadosMap[game.id] || null,
            }));

            return { games, total: count };
        } catch (err) {
            console.error("Error en buscarConPaginacion:", err);
            return { games: [], total: 0 };
        }
    }
}
export default GameDAO;
