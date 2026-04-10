const { registrarLog } = require("../controllers/logController");
const LogDAO = require("../dao/LogDAO");

// Definimos explícitamente qué funciones tiene el DAO
jest.mock("../dao/LogDAO", () => ({
    crearLog: jest.fn(),
}));

const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

describe("LogController", () => {
    beforeEach(() => jest.clearAllMocks());

    test("registrarLog: éxito devuelve 201", async () => {
        const req = { body: { tipo: "INFO", mensaje: "Test exitoso" } };
        const res = mockRes();

        LogDAO.crearLog.mockResolvedValue({ id: 1 });

        await registrarLog(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true }),
        );
    });

    test("registrarLog: error 400 si faltan datos", async () => {
        const req = { body: { tipo: "INFO" } }; // Falta mensaje
        const res = mockRes();

        await registrarLog(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
