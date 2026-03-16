const { supabase } = require("../db/database");

class GameDAO {
    static async listar(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { data, count, error } = await supabase
            .from("games")
            .select(
                "id,id_game, name, cover, genres, rating, game_modes, company",
                { count: "exact" },
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
                "id,id_game, name, cover, genres, rating, game_modes, company",
                { count: "exact" },
            )
            .order(orden, { ascending: direccion === "asc" });

        if (texto.trim() !== "") {
            query = query.ilike("name", `%${texto}%`);
        }

        if (genero.trim() !== "") {
            query = query.contains("genres", JSON.stringify([genero]));
        }

        if (plataforma.trim() !== "") {
            query = query.contains("platforms", JSON.stringify([plataforma]));
        }

        if (rating !== null) {
            query = query.gte("rating", rating);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw new Error(error.message);
        return { games: data, total: count };
    }
}

module.exports = GameDAO;
