import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

const mockAuthCtrl = {
    registro: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    deleteAccount: jest.fn(),
};

jest.unstable_mockModule("../controllers/authController.js", () => ({
    default: mockAuthCtrl,
}));

const { default: authRouter } = await import("../routes/authRoutes.js");

const app = express();
app.use(express.json());
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
