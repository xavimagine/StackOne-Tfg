const express = require("express");

//Importamos el módulo que sabe crear y gestionar sesiones en Express
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "secreto_de_respaldo_por_si_falla_el_env",
        resave: false,
        saveUninitialized: false,
        cookie: {
            // 1 hora de duración (en milisegundos)
            maxAge: 3600000,
            // 'secure' debe ser true en Netlify (HTTPS), pero false en local (HTTP)
            secure: process.env.NODE_ENV === "production",
            // Ayuda a prevenir ataques XSS
            httpOnly: true,
            // Protege contra ataques CSRF
            sameSite: "lax",
        },
    }),
);

app.use(express.static("public"));
app.use((req, res, next) => {
    console.log(
        `${new Date().toLocaleTimeString()} - Petición: ${req.method} ${req.url}`,
    );
    next();
});

// juegos
const gameRoutes = require("./routes/gameRoutes");

//usuarios
const authRoutes = require("./routes/authRoutes");
// logs
const logsRoutes = require("./routes/logsRoutes");

app.use("/games", gameRoutes);
app.use("/", authRoutes);
app.use("/logs", logsRoutes);
// En tu servidor Node.js
app.post("/events", async (req, res) => {
    try {
        // PASO 1: Obtener token
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
        const inicioAnio = Math.floor(new Date("2026-01-01").getTime() / 1000);
        // PASO 3: Llamada a IGDB
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
app.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000");
});
module.exports = app;
