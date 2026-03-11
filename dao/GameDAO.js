const { supabase } = require("../db/database");

class GameDAO {
  static async listar(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("games")
      .select("id, name, cover, genres, rating, game_modes, company", {
        count: "exact",
      })
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
  ) {
    const columnasValidas = ["name", "rating", "genres", "platforms"];
    if (!columnasValidas.includes(orden)) orden = "name";
    if (!["asc", "desc"].includes(direccion)) direccion = "asc";

    const offset = (page - 1) * limit;

    // Consulta principal con paginación
    let query = supabase
      .from("games")
      .select("id, name, cover, genres, rating, game_modes, company", {
        count: "exact",
      })
      .order(orden, { ascending: direccion === "asc" })
      .range(offset, offset + limit - 1);

    // Filtro de búsqueda si hay texto
    if (texto.trim() !== "") {
      query = query.ilike("name", `%${texto}%`);
    }

    const { data, count, error } = await query;

    if (error) throw new Error(error.message);

    return { games: data, total: count };
  }
}

module.exports = GameDAO;
