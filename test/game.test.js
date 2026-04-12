import { jest } from "@jest/globals";

jest.unstable_mockModule("../dao/GameDAO.js", () => ({
    default: {
        listar: jest.fn(),
        buscarConPaginacion: jest.fn(),
    },
}));

jest.unstable_mockModule("../db/database.js", () => ({
    supabase: {},
    supabaseAdmin: {},
}));

const { default: GameDAO } = await import("../dao/GameDAO.js");
const { default: GameController } =
    await import("../controllers/gameController.js");

const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

const mockReq = (query = {}, sessionUser = { id: 1 }) => ({
    query,
    session: { usuario: sessionUser },
});

describe("GameController", () => {
    beforeEach(() => jest.clearAllMocks());

    test("listar: debería devolver juegos con paginación", async () => {
        const req = mockReq({ page: "1", limit: "10" });
        const res = mockRes();
        GameDAO.listar.mockResolvedValue({
            games: [{ id: 1, name: "Zelda" }],
            total: 1,
        });
        await GameController.listar(req, res);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pagination: expect.objectContaining({ total: 1 }),
            }),
        );
    });

    test("buscarConPaginacion: debería llamar al DAO con filtros", async () => {
        const req = mockReq({ texto: "Mario", rating: "90" });
        const res = mockRes();
        GameDAO.buscarConPaginacion.mockResolvedValue({ games: [], total: 0 });
        await GameController.buscarConPaginacion(req, res);
        expect(GameDAO.buscarConPaginacion).toHaveBeenCalled();
    });
});
