const GameController = require("../controllers/gameController");
const GameDAO = require("../dao/GameDAO");

jest.mock("../dao/GameDAO");

const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

const mockReq = (query = {}) => ({ query });

// ─────────────────────────────────────────────
// GameController.listar
// ─────────────────────────────────────────────
describe("GameController.listar", () => {
    const mockGames = [
        { id: 1, id_game: 101, name: "Elden Ring" },
        { id: 2, id_game: 102, name: "God of War" },
    ];

    beforeEach(() => jest.clearAllMocks());

    test("devuelve juegos con paginación correcta", async () => {
        GameDAO.listar.mockResolvedValue({ games: mockGames, total: 2 });

        const req = mockReq({ page: "1", limit: "10" });
        const res = mockRes();

        await GameController.listar(req, res);

        expect(res.json).toHaveBeenCalledWith({
            games: mockGames,
            pagination: { total: 2, totalPages: 1, currentPage: 1, limit: 10 },
        });
    });

    test("usa valores por defecto si no recibe query params", async () => {
        GameDAO.listar.mockResolvedValue({ games: mockGames, total: 2 });

        const req = mockReq();
        const res = mockRes();

        await GameController.listar(req, res);

        expect(GameDAO.listar).toHaveBeenCalledWith(1, 10);
    });

    test("calcula totalPages correctamente", async () => {
        GameDAO.listar.mockResolvedValue({ games: mockGames, total: 25 });

        const req = mockReq({ page: "1", limit: "10" });
        const res = mockRes();

        await GameController.listar(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pagination: expect.objectContaining({ totalPages: 3 }),
            }),
        );
    });

    test("devuelve 500 si el DAO lanza error", async () => {
        GameDAO.listar.mockRejectedValue(new Error("DB error"));

        const req = mockReq();
        const res = mockRes();

        await GameController.listar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
});

// ─────────────────────────────────────────────
// GameController.buscarConPaginacion
// ─────────────────────────────────────────────
describe("GameController.buscarConPaginacion", () => {
    const mockGames = [{ id: 1, id_game: 101, name: "Elden Ring" }];

    beforeEach(() => jest.clearAllMocks());

    test("pasa todos los parámetros al DAO correctamente", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 1,
        });

        const req = mockReq({
            texto: "Elden",
            orden: "rating",
            direccion: "desc",
            page: "1",
            limit: "10",
            genero: "RPG",
            plataforma: "PC",
            rating: "80",
        });
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            "Elden",
            "rating",
            "desc",
            1,
            10,
            "RPG",
            "PC",
            80,
        );
    });

    test("usa valores por defecto si no recibe query params", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 1,
        });

        const req = mockReq();
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            "",
            "name",
            "asc",
            1,
            10,
            "",
            "",
            null,
        );
    });

    test("rating se convierte a float", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 1,
        });

        const req = mockReq({ rating: "85.5" });
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            "",
            "name",
            "asc",
            1,
            10,
            "",
            "",
            85.5,
        );
    });

    test("rating es null si no se recibe", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 1,
        });

        const req = mockReq();
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            "",
            "name",
            "asc",
            1,
            10,
            "",
            "",
            null,
        );
    });

    test("devuelve paginación correcta", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 50,
        });

        const req = mockReq({ page: "3", limit: "10" });
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(res.json).toHaveBeenCalledWith({
            games: mockGames,
            pagination: { total: 50, totalPages: 5, currentPage: 3, limit: 10 },
        });
    });

    test("solo filtra por genero si se recibe", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 1,
        });

        const req = mockReq({ genero: "RPG" });
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            "",
            "name",
            "asc",
            1,
            10,
            "RPG",
            "",
            null,
        );
    });

    test("solo filtra por plataforma si se recibe", async () => {
        GameDAO.buscarConPaginacion.mockResolvedValue({
            games: mockGames,
            total: 1,
        });

        const req = mockReq({ plataforma: "PC" });
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(GameDAO.buscarConPaginacion).toHaveBeenCalledWith(
            "",
            "name",
            "asc",
            1,
            10,
            "",
            "PC",
            null,
        );
    });

    test("devuelve 500 si el DAO lanza error", async () => {
        GameDAO.buscarConPaginacion.mockRejectedValue(
            new Error("Search error"),
        );

        const req = mockReq({ texto: "Elden" });
        const res = mockRes();

        await GameController.buscarConPaginacion(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Search error" });
    });
});
