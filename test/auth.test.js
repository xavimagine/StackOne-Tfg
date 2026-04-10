const request = require("supertest");
const express = require("express");

// Mock manual para asegurar que todas las funciones existan en el router
const mockAuthCtrl = {
    registro: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    deleteAccount: jest.fn(),
};

jest.mock("../controllers/authController", () => mockAuthCtrl);

// Importamos el router. Si falla por el middleware, asegúrate que la ruta en
// el archivo authRoutes.js sea correcta.
const authRouter = require("../routes/authRoutes");

const app = express();
app.use(express.json());
// Simulamos una sesión básica para que no explote req.session
app.use((req, res, next) => {
    req.session = { destroy: (cb) => cb(null), usuario: { id: 1 } };
    next();
});
app.use("/auth", authRouter);

describe("Auth Routes", () => {
    test("Debería responder 201 en registro", async () => {
        mockAuthCtrl.registro.mockImplementation((req, res) =>
            res.status(201).json({ ok: true }),
        );

        const res = await request(app)
            .post("/auth/registro")
            .send({ usuario: "test" });
        expect(res.statusCode).toBe(201);
    });

    test("Debería responder 200 en logout", async () => {
        mockAuthCtrl.logout.mockImplementation((req, res) =>
            res.status(200).json({ ok: true }),
        );

        const res = await request(app).post("/auth/logout");
        expect(res.statusCode).toBe(200);
    });
});
