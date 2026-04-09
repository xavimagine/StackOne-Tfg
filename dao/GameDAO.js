const { supabase } = require("../db/database");

class GameDAO {
    static async listar(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { data, count, error } = await supabase
            .from("games")
            .select(
                "id, id_game, name, summary,cover, genres, rating, game_modes, company",
                { count: "planned" },
            )
            .order("name", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return { games: data, total: count };
    }

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
        const columnasValidas = ["name", "rating", "genres", "platforms"];
        if (!columnasValidas.includes(orden)) orden = "name";
        if (!["asc", "desc"].includes(direccion)) direccion = "asc";

        const offset = (page - 1) * limit;

        let query = supabase
            .from("games")
            .select(
                `
                id, 
                id_game, 
                name,
                summary, 
                cover, 
                genres, 
                rating, 
                game_modes, 
                company,
                listas_games!left(status)
            `,
                { count: "planned" },
            )
            .eq("listas_games.user_id", userId)
            .order(orden, { ascending: direccion === "asc" });

        // --- VALIDACIONES SEGURAS PARA .trim() ---
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

        let intentos = 0;
        const maxIntentos = 3;

        while (intentos < maxIntentos) {
            try {
                const { data, count, error } = await query;

                if (error) throw error;

                const gamesConStatus = data.map((game) => ({
                    ...game,
                    user_status: game.listas_games?.[0]?.status || null,
                }));

                return { games: gamesConStatus, total: count };
            } catch (err) {
                intentos++;
                console.warn(`Intento ${intentos} fallido. Reintentando...`);
                if (intentos >= maxIntentos) return { games: [], total: 0 };
                await new Promise((res) => setTimeout(res, intentos * 1000));
            }
        }
    }
}

module.exports = GameDAO;
