import express from "express";
import cors from "cors";
import session from "express-session";

// NOTA: Asegúrate de que estos archivos terminen en .js y usen "export default"
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import listasRoutes from "./routes/listRaoutes.js"; // Verifica si es "listRoutes.js" o "listRaoutes.js"

const app = express();

// Configuración de CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de Session
app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "secreto_de_respaldo_por_si_falla_el_env",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
    }),
);

app.use(express.static("public"));

// Rutas
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);
app.use("/", listasRoutes);

// Endpoint de Eventos (IGDB + Twitch)
app.post("/events", async (req, res) => {
    try {
        // PASO 1: Obtener token de Twitch
        const authResponse = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            { method: "POST" },
        );

        const authData = await authResponse.json();
        if (!authData.access_token) {
            return res.status(401).json({
                error: "No se obtuvo access_token",
                detalle: authData,
            });
        }

        const accessToken = authData.access_token;
        const clientId = process.env.TWITCH_CLIENT_ID;

        // Timestamp para el inicio de 2026
        const inicioAnio = Math.floor(new Date("2026-01-01").getTime() / 1000);

        // PASO 2: Llamada a IGDB
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
            return res.status(500).json({
                error: "Respuesta inesperada de IGDB",
                detalle: events,
            });
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
