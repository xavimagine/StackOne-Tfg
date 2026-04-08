const { supabase } = require("../db/database");

class GameDAO {
    static async listar(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { data, count, error } = await supabase
            .from("games")
            .select(
                "id, id_game, name, cover, genres, rating, game_modes, company",
                { count: "planned" }, // <--- Esto es correcto
            )
            .order("name", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return { games: data, total: count };
    }

    static async buscarConPaginacion(
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
                "id, id_game, name, cover, genres, rating, game_modes, company",
                { count: "planned" }, // <--- CAMBIADO DE "exact" A "planned"
            )
            .order(orden, { ascending: direccion === "asc" });

        if (texto && texto.trim() !== "") {
            query = query.ilike("name", `%${texto.trim()}%`);
        }

        if (genero && genero.trim() !== "") {
            query = query.contains("genres", [genero]);
        }

        if (plataforma && plataforma.trim() !== "") {
            query = query.contains("platforms", [plataforma]);
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

                if (error) {
                    if (
                        error.message.includes("timeout") ||
                        error.code === "57014"
                    ) {
                        throw error;
                    }
                    throw new Error(error.message);
                }

                return { games: data, total: count };
            } catch (err) {
                intentos++;
                console.warn(
                    `Intento ${intentos} fallido para [${texto || "Lista General"}]. Reintentando...`,
                );

                if (intentos >= maxIntentos) {
                    console.error("Error definitivo:", err.message);
                    return { games: [], total: 0 };
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, intentos * 2000),
                );
            }
        }
    }
}

module.exports = GameDAO;
