const request = require("supertest");
const express = require("express");

// ─── Mock de Supabase ──────────────────────────────────────────────────────
const mockInsert = jest.fn();

jest.mock("../db/database", () => ({
    supabase: {
        from: jest.fn(() => ({
            insert: mockInsert,
        })),
    },
}));

const logsRouter = require("../routes/logsRoutes");

// ─── App mínima para testing ───────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use("/logs", logsRouter);

// ══════════════════════════════════════════════════════════════════════════════
// SUITE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
describe("Logs Routes - POST /logs", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {}); // silencia logs en tests
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    // ── Casos de éxito ───────────────────────────────────────────────────────
    describe("Casos exitosos", () => {
        it("debería guardar un log y devolver 201", async () => {
            mockInsert.mockResolvedValue({ error: null });

            const res = await request(app).post("/logs").send({
                tipo: "info",
                mensaje: "Usuario inició sesión",
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ ok: true, mensaje: "Log guardado" });
        });

        it("debería llamar a supabase.from('logs') con los datos correctos", async () => {
            mockInsert.mockResolvedValue({ error: null });

            const { supabase } = require("../db/database");

            await request(app).post("/logs").send({
                tipo: "error",
                mensaje: "Fallo en autenticación",
            });

            expect(supabase.from).toHaveBeenCalledWith("logs");
            expect(mockInsert).toHaveBeenCalledWith([
                { tipo: "error", mensaje: "Fallo en autenticación" },
            ]);
        });

        it("debería aceptar distintos tipos de log", async () => {
            mockInsert.mockResolvedValue({ error: null });

            const tipos = ["info", "warning", "error", "debug"];

            for (const tipo of tipos) {
                const res = await request(app)
                    .post("/logs")
                    .send({
                        tipo,
                        mensaje: `Log de tipo ${tipo}`,
                    });
                expect(res.statusCode).toBe(201);
            }
        });
    });

    // ── Validación de campos ─────────────────────────────────────────────────
    describe("Validación de campos", () => {
        it("debería devolver 400 si falta 'tipo'", async () => {
            const res = await request(app).post("/logs").send({
                mensaje: "Mensaje sin tipo",
            });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error", "Faltan campos");
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it("debería devolver 400 si falta 'mensaje'", async () => {
            const res = await request(app).post("/logs").send({
                tipo: "info",
            });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error", "Faltan campos");
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it("debería devolver 400 si el body está vacío", async () => {
            const res = await request(app).post("/logs").send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error", "Faltan campos");
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it("debería devolver 400 si no se envía body", async () => {
            const res = await request(app)
                .post("/logs")
                .set("Content-Type", "application/json")
                .send("{}");

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error", "Faltan campos");
        });
    });

    // ── Errores de base de datos ─────────────────────────────────────────────
    describe("Errores de base de datos", () => {
        it("debería devolver 500 si Supabase devuelve un error", async () => {
            mockInsert.mockResolvedValue({
                error: { message: "duplicate key value" },
            });

            const res = await request(app).post("/logs").send({
                tipo: "info",
                mensaje: "Log con error en DB",
            });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty(
                "error",
                "No se pudo guardar el log",
            );
        });

        it("debería devolver 500 si la promesa de Supabase es rechazada", async () => {
            mockInsert.mockRejectedValue(new Error("Connection timeout"));

            const res = await request(app).post("/logs").send({
                tipo: "error",
                mensaje: "Log con excepción",
            });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty(
                "error",
                "No se pudo guardar el log",
            );
        });

        it("no debería exponer detalles internos del error en la respuesta", async () => {
            mockInsert.mockRejectedValue(new Error("Detalle interno sensible"));

            const res = await request(app).post("/logs").send({
                tipo: "warning",
                mensaje: "Test de seguridad",
            });

            expect(res.body).not.toHaveProperty("stack");
            expect(JSON.stringify(res.body)).not.toContain(
                "Detalle interno sensible",
            );
        });
    });
});
