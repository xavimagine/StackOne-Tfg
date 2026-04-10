const ListaController = require("../controllers/listaController");
const { supabase } = require("../db/database");

// El secreto es mockReturnThis() en 'eq' para permitir el encadenamiento .eq().eq()
jest.mock("../db/database", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(),
        insert: jest.fn().mockResolvedValue({ error: null }),
    },
}));

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

        // Simulamos que no existe previo para que intente insertar
        supabase.maybeSingle.mockResolvedValue({ data: null, error: null });

        await ListaController.toggle(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "added",
            }),
        );
    });
});
