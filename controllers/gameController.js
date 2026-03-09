const GameDAO = require("../dao/GameDAO");

// Crear producto
exports.crear = async (req, res) => {
  const titulo = req.body.titulo;
  const empresa = req.body.empresa;
  const year = req.body.year;
  const genero = req.body.genero;
  const plataforma = req.body.plataforma;
  try {
    const game = await GameDAO.crear(titulo, empresa, year, genero, plataforma);
    res.json({ mensaje: "Juego agregado" });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir el juego" });
  }
};

// BUSCAR
exports.buscar = async (req, res) => {
  console.log(req.body);
  //esto pone unos valores por defecto,
  // que son los que se rellenan si no vienen rellenos del front
  const {
    texto = "",
    orden = "titulo",
    direccion = "asc",
    page = 1,
    limit = 10,
  } = req.body;

  try {
    const { productos, total } = await GameDAO.buscarConPaginacion(
      texto,
      orden,
      direccion,
      page,
      limit,
    );

    // totalPages indica CUÁNTAS PÁGINAS hay en total
    // total = número TOTAL de productos que existen en la BD
    // limit = productos que mostramos por página (20)
    // total / limit = número de páginas (puede ser decimal)
    // Math.ceil(...) redondea HACIA ARRIBA para no perder la última página
    res.json({
      productos,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Error al buscar productos" });
  }
};
