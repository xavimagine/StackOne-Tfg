import express from "express";
import cookieParser from "cookie-parser";
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import listasRoutes from "./routes/listRaoutes.js";

const app = express();

// CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        process.env.FRONTEND_URL || "https://tu-sitio.vercel.app",
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// RUTAS
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);
app.use("/", listasRoutes);

// Endpoint de Eventos (IGDB + Twitch)
app.post("/events", async (req, res) => {
    try {
        const authResponse = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            { method: "POST" },
        );
        const authData = await authResponse.json();
        if (!authData.access_token) {
            return res
                .status(401)
                .json({
                    error: "No se obtuvo access_token",
                    detalle: authData,
                });
        }
        const accessToken = authData.access_token;
        const clientId = process.env.TWITCH_CLIENT_ID;
        const inicioAnio = Math.floor(new Date("2026-01-01").getTime() / 1000);
        const response = await fetch("https://api.igdb.com/v4/events", {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "text/plain",
                Accept: "application/json",
            },
            body: `fields name, description, start_time, event_logo.url; 
                   where start_time > ${inicioAnio}; 
                   sort start_time asc; 
                   limit 40;`,
        });
        const events = await response.json();
        if (!Array.isArray(events)) {
            return res
                .status(500)
                .json({
                    error: "Respuesta inesperada de IGDB",
                    detalle: events,
                });
        }
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
