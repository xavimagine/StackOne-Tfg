const pool = require("../db/database");

class GameDAO {
  static async crear(titulo, empresa, year, genero, plataforma) {
    const sql = `INSERT INTO games (titulo, empresa, year, genero, plataforma) VALUES (?, ? ,?, ?,?)`;
    const [result] = await pool.execute(sql, [
      titulo,
      empresa,
      year,
      genero,
      plataforma,
    ]);
    return result.insertId;
  }

  static async listar() {
    const sql = `SELECT i.id,i.titulo,i.descripcion,i.estado,i.usuario_id FROM incidencias i JOIN usuarios u ON i.usuario_id = u.id;`;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async buscarConPaginacion(texto, orden, direccion, page, limit) {
    // OJO EL MÉTODO NORMAL NO IMPIDE USO DE INYECCIÓN DE SQL PARA ORDER BY!!!!
    // Aquí decimos, si en el orden entra algo que no sea exactamente nombre o precio,
    // ponemos nombre, y si en la dirección entra algo que no es asc o desc ponemos asc
    const columnasValidas = [
      "titulo",
      "year",
      "empresa",
      "genero",
      "plataforma",
    ];
    if (!columnasValidas.includes(orden)) orden = "titulo";

    if (!["asc", "desc"].includes(direccion)) direccion = "asc";

    // Calculamos desde qué registro empezar según la página actual

    const offset = (page - 1) * limit;
    // Consulta principal que obtiene SOLO los productos de la página actual
    const sql = `
        SELECT id, titulo, empresa, year,genero,plataforma
        FROM games
        WHERE titulo LIKE ?
        ORDER BY ${orden} ${direccion}
        LIMIT ? OFFSET ?
    `;

    // Consulta auxiliar que cuenta cuántos productos hay en total
    const countSql = `
        SELECT COUNT(*) as total
        FROM games
        WHERE titulo LIKE ?
    `;

    // Ejecutamos la consulta principal pasando texto, límite y offset
    const [rows] = await pool.execute(sql, [
      `%${texto}%`,
      // TIENE QUE PASARSE POR STRING NO VALE UN NUMERO
      limit.toString(),
      offset.toString(),
    ]);

    // Ejecutamos la consulta de conteo y extraemos el total de productos
    const [[{ total }]] = await pool.execute(countSql, [`%${texto}%`]);

    // Devolvemos los productos de la página y el total para calcular páginas
    return { productos: rows, total };
  }
}

module.exports = GameDAO;
