const GameDAO = require("../dao/GameDAO");

class GameController {
    static async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const { games, total } = await GameDAO.listar(page, limit);

            res.json({
                games,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                    limit,
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async buscarConPaginacion(req, res) {
        try {
            const userId = req.session.usuario?.id || 0;

            const texto = req.query.texto || "";
            const orden = req.query.orden || "name";
            const direccion = req.query.direccion || "asc";
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const genero = req.query.genero || "";
            const plataforma = req.query.plataforma || "";
            const rating = req.query.rating
                ? parseFloat(req.query.rating)
                : null;

            const { games, total } = await GameDAO.buscarConPaginacion(
                userId,
                texto,
                orden,
                direccion,
                page,
                limit,
                genero,
                plataforma,
                rating,
            );

            res.json({
                games,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                    limit,
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = GameController;
