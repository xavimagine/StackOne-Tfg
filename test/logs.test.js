import { jest } from "@jest/globals";

jest.unstable_mockModule("../dao/LogDAO.js", () => ({
    default: {
        crearLog: jest.fn(),
        insertar: jest.fn(),
    },
}));

jest.unstable_mockModule("../db/database.js", () => ({
    supabase: {},
    supabaseAdmin: {},
}));

const { default: LogDAO } = await import("../dao/LogDAO.js");
const logController = await import("../controllers/logController.js");
const registrarLog =
    logController.default?.registrarLog || logController.registrarLog;

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
        const req = { body: { tipo: "INFO" } };
        const res = mockRes();
        await registrarLog(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
