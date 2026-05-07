import { jest } from "@jest/globals";

// 1. MOCK DE SUPABASE CON ENCADENAMIENTO COMPLETO
const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    // maybeSingle debe ser capaz de retornar datos o resolverse como promesa
    maybeSingle: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    // Añadimos then para soportar el await del encadenamiento
    then: jest.fn(function (resolve) {
        return Promise.resolve(this).then(resolve);
    }),
};

jest.unstable_mockModule("../db/database.js", () => ({
    supabase: mockSupabase,
    supabaseAdmin: {},
}));

// Importaciones dinámicas
const { default: ListaController } =
    await import("../controllers/listaController.js");

const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

describe("ListaController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("toggle: debería funcionar el encadenamiento de Supabase", async () => {
        // AJUSTE: Enviamos el usuario tanto en session como en req.usuario
        // para asegurar que el controlador lo encuentre
        const req = {
            body: { game_id: "101", status: "jugando" },
            session: { usuario: { id: 1 } },
            usuario: { id: 1 },
        };

        const res = mockRes();

        // Simulamos que NO existe el juego en la lista (para que lo añada)
        mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

        // Simulamos que el insert posterior tiene éxito
        // Usamos mockImplementationOnce para que el await del insert devuelva éxito
        mockSupabase.then.mockImplementationOnce(function (resolve) {
            return Promise.resolve({ data: { id: 1 }, error: null }).then(
                resolve,
            );
        });

        await ListaController.toggle(req, res);

        // Verificamos que se llamó a res.json con el objeto esperado
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ action: "added" }),
        );

        // Verificación extra: ¿Se llamó al insert?
        expect(mockSupabase.insert).toHaveBeenCalled();
    });

    test("toggle: debería devolver error si faltan datos o sesión", async () => {
        const req = { body: {}, session: {} }; // Petición vacía
        const res = mockRes();

        await ListaController.toggle(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) }),
        );
    });
});
