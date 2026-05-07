import { jest } from "@jest/globals";

// 1. Mock de los módulos
jest.unstable_mockModule("../dao/GameDAO.js", () => ({
    default: {
        buscarConPaginacion: jest.fn(),
    },
}));

jest.unstable_mockModule("../db/database.js", () => ({
    supabase: {},
    supabaseAdmin: {},
}));

// 2. Importaciones dinámicas para ESM
const { default: GameDAO } = await import("../dao/GameDAO.js");
const { default: GameController } =
    await import("../controllers/gameController.js");

// 3. Helpers para Mocks
const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

const mockReq = (query = {}, usuario = { id: 1 }) => ({
    query,
    usuario, // Tu controlador usa req.usuario.id
});

describe("GameController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("buscarConPaginacion: debería devolver juegos y estructura de paginación", async () => {
        // Arrange
        const req = mockReq({ page: "1", limit: "10" });
        const res = mockRes();

        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: [{ id: 1, name: "Zelda" }],
            total: 1,
        });

        // Act
        await GameController.buscarConPaginacion(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith({
            games: [{ id: 1, name: "Zelda" }],
            pagination: {
                total: 1,
                totalPages: 1,
                currentPage: 1,
                limit: 10,
            },
        });
    });

    test("buscarConPaginacion: debería llamar al DAO con los filtros de búsqueda", async () => {
        // Arrange
        const req = mockReq({
            texto: "Mario",
            rating: "90",
            orden: "rating",
            direccion: "desc",
        });
        const res = mockRes();

        GameDAO.buscarConPaginacion.mockResolvedValue({ games: [], total: 0 });

        // Act
        await GameController.buscarConPaginacion(req, res);

        // Assert
        // Verificamos que se pasen los argumentos correctos al DAO (incluyendo el userId del mockReq)
        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            1, // userId
            "Mario", // texto
            "rating", // orden
            "desc", // direccion
            1, // page (default)
            10, // limit (default)
            "", // genero (default)
            "", // plataforma (default)
            90, // rating (parseado a float)
        );
    });

    test("buscarConPaginacion: debería manejar errores del servidor", async () => {
        // Arrange
        const req = mockReq();
        const res = mockRes();
        GameDAO.buscarConPaginacion.mockRejectedValue(new Error("Error de DB"));

        // Act
        await GameController.buscarConPaginacion(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error de DB" });
    });
});
