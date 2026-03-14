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

// juegos
const gameRoutes = require("./routes/gameRoutes");

//usuarios
const authRoutes = require("./routes/authRoutes");
// logs
const logsRoutes = require("./routes/logsRoutes");

app.use("/game", gameRoutes);
app.use("/", authRoutes);
app.use("/logs", logsRoutes);

app.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000");
});
module.exports = app;
