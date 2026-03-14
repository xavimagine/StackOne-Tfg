const request = require("supertest");
const express = require("express");

// ─── Mock del authController ───────────────────────────────────────────────
jest.mock("../controllers/authController", () => ({
    registro: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
}));

const authController = require("../controllers/authController");
const authRouter = require("../routes/authRoutes");

// ─── App mínima para testing ───────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use("/auth", authRouter);

// ══════════════════════════════════════════════════════════════════════════════
// SUITE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
describe("Auth Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── POST /auth/registro ──────────────────────────────────────────────────
    describe("POST /auth/registro", () => {
        it("debería registrar un usuario y devolver 201", async () => {
            authController.registro.mockImplementation((req, res) => {
                res.status(201).json({
                    message: "Usuario registrado correctamente",
                });
            });

            const res = await request(app).post("/auth/registro").send({
                nombre: "Juan García",
                email: "juan@example.com",
                password: "Password123!",
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty(
                "message",
                "Usuario registrado correctamente",
            );
            expect(authController.registro).toHaveBeenCalledTimes(1);
        });

        it("debería devolver 400 si faltan campos obligatorios", async () => {
            authController.registro.mockImplementation((req, res) => {
                res.status(400).json({
                    error: "Todos los campos son obligatorios",
                });
            });

            const res = await request(app).post("/auth/registro").send({
                email: "juan@example.com",
            });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error");
        });

        it("debería devolver 409 si el email ya existe", async () => {
            authController.registro.mockImplementation((req, res) => {
                res.status(409).json({ error: "El email ya está registrado" });
            });

            const res = await request(app).post("/auth/registro").send({
                nombre: "Juan García",
                email: "existente@example.com",
                password: "Password123!",
            });

            expect(res.statusCode).toBe(409);
            expect(res.body).toHaveProperty(
                "error",
                "El email ya está registrado",
            );
        });

        it("debería devolver 500 si ocurre un error interno", async () => {
            authController.registro.mockImplementation((req, res) => {
                res.status(500).json({ error: "Error interno del servidor" });
            });

            const res = await request(app).post("/auth/registro").send({
                nombre: "Juan",
                email: "juan@example.com",
                password: "Password123!",
            });

            expect(res.statusCode).toBe(500);
        });
    });

    // ── POST /auth/login ─────────────────────────────────────────────────────
    describe("POST /auth/login", () => {
        it("debería iniciar sesión y devolver token con 200", async () => {
            const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock";

            authController.login.mockImplementation((req, res) => {
                res.status(200).json({
                    token: mockToken,
                    message: "Login exitoso",
                });
            });

            const res = await request(app).post("/auth/login").send({
                email: "juan@example.com",
                password: "Password123!",
            });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body.token).toBe(mockToken);
            expect(authController.login).toHaveBeenCalledTimes(1);
        });

        it("debería devolver 401 con credenciales incorrectas", async () => {
            authController.login.mockImplementation((req, res) => {
                res.status(401).json({ error: "Credenciales inválidas" });
            });

            const res = await request(app).post("/auth/login").send({
                email: "juan@example.com",
                password: "WrongPassword",
            });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error", "Credenciales inválidas");
        });

        it("debería devolver 400 si no se envía email o password", async () => {
            authController.login.mockImplementation((req, res) => {
                res.status(400).json({
                    error: "Email y password son requeridos",
                });
            });

            const res = await request(app).post("/auth/login").send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error");
        });

        it("debería devolver 404 si el usuario no existe", async () => {
            authController.login.mockImplementation((req, res) => {
                res.status(404).json({ error: "Usuario no encontrado" });
            });

            const res = await request(app).post("/auth/login").send({
                email: "noexiste@example.com",
                password: "Password123!",
            });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty("error", "Usuario no encontrado");
        });
    });

    // ── POST /auth/logout ────────────────────────────────────────────────────
    describe("POST /auth/logout", () => {
        it("debería cerrar sesión correctamente y devolver 200", async () => {
            authController.logout.mockImplementation((req, res) => {
                res.status(200).json({
                    message: "Sesión cerrada correctamente",
                });
            });

            const res = await request(app)
                .post("/auth/logout")
                .set(
                    "Authorization",
                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock",
                );

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty(
                "message",
                "Sesión cerrada correctamente",
            );
            expect(authController.logout).toHaveBeenCalledTimes(1);
        });

        it("debería devolver 401 si no hay token de autorización", async () => {
            authController.logout.mockImplementation((req, res) => {
                res.status(401).json({ error: "No autorizado" });
            });

            const res = await request(app).post("/auth/logout");

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error", "No autorizado");
        });

        it("debería devolver 400 si el token es inválido", async () => {
            authController.logout.mockImplementation((req, res) => {
                res.status(400).json({ error: "Token inválido" });
            });

            const res = await request(app)
                .post("/auth/logout")
                .set("Authorization", "Bearer token_invalido");

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error", "Token inválido");
        });
    });

    // ── Rutas no existentes ──────────────────────────────────────────────────
    describe("Rutas no definidas", () => {
        it("debería devolver 404 para una ruta desconocida", async () => {
            const res = await request(app).get("/auth/ruta-inexistente");
            expect(res.statusCode).toBe(404);
        });
    });
});
