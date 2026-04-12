import { jest } from "@jest/globals";

const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    insert: jest.fn().mockResolvedValue({ error: null }),
};

jest.unstable_mockModule("../db/database.js", () => ({
    supabase: mockSupabase,
    supabaseAdmin: {},
}));

const { default: ListaController } =
    await import("../controllers/listaController.js");

const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

describe("ListaController", () => {
    beforeEach(() => jest.clearAllMocks());

    test("toggle: debería funcionar el encadenamiento de Supabase", async () => {
        const req = {
            body: { game_id: "101", status: "jugando" },
            session: { usuario: { id: 1 } },
        };
        const res = mockRes();
        mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
        await ListaController.toggle(req, res);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ action: "added" }),
        );
    });
});
