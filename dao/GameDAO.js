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

            if (texto && typeof texto === "string" && texto.trim() !== "") {
                query = query.ilike("name", `%${texto.trim()}%`);
            }
            if (genero && typeof genero === "string" && genero.trim() !== "") {
                query = query.contains("genres", [genero.trim()]);
            }
            if (
                plataforma &&
                typeof plataforma === "string" &&
                plataforma.trim() !== ""
            ) {
                query = query.contains("platforms", [plataforma.trim()]);
            }
            if (rating !== null) {
                query = query.gte("rating", rating);
            }

            query = query.range(offset, offset + limit - 1);

            const [{ data, count, error }, { data: marcados }] =
                await Promise.all([
                    query,
                    userId
                        ? supabase
                              .from("listas_games")
                              .select("game_id, status")
                              .eq("user_id", userId)
                        : Promise.resolve({ data: [] }),
                ]);

            if (error) throw error;

            const marcadosMap = {};
            marcados?.forEach((m) => (marcadosMap[m.game_id] = m.status));

            const games = data.map((game) => ({
                ...game,
                status: marcadosMap[game.id] || null,
            }));

            return { games, total: count };
        } catch (err) {
            return { games: [], total: 0 };
        }
    }
}
export default GameDAO;
