import bcrypt from "bcrypt";
import { supabase } from "../db/database.js";
import UsuarioDAO from "../dao/UsuarioDAO.js";
import LogDAO from "../dao/LogDAO.js";

// --- Registro ---
const registro = async (req, res) => {
    try {
        const { usuario, email, password } = req.body;
        const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${usuario}`;

        // 1. VALIDACIÓN  con Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await LogDAO.insertar(
                null,
                "WARNING",
                `Intento con email prohibido: "${usuario}" desde ${email}`,
            );
            return res.status(400).json({
                ok: false,
                mensaje: "El formato del correo no es válido",
            });
        }
        if (!usuario || usuario.trim() === "0" || usuario.trim().length < 3) {
            await LogDAO.insertar(
                null,
                "WARNING",
                `Intento con nick prohibido: "${usuario}" desde ${email}`,
            );

            return res.status(400).json({
                ok: false,
                mensaje:
                    "El nick no puede ser '0' ni tener menos de 3 caracteres",
            });
        }
        // PROTECCIÓN CONTRA SCRIPTS
        // Esto elimina etiquetas <script> o caracteres peligrosos
        const emailLimpio = email.replace(/[<>]/g, "");
        const usuarioLimpio = usuario.replace(/[<>]/g, "");

        const passwordHash = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    nick: usuarioLimpio,
                    email: emailLimpio,
                    password: passwordHash,
                    avatar: avatar,
                },
            ])
            .select();

        if (error) {
            return res.status(400).json({ ok: false, mensaje: error.message });
        }
        await LogDAO.insertar(
            data[0].id,
            "REGISTRO",
            "Nuevo usuario creado con éxito",
        );
        return res.status(201).json({ ok: true, mensaje: "Cuenta creada" });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: "Error interno" });
    }
};

// --- Login ---
const login = async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const user = await UsuarioDAO.buscarPorUsuario(usuario);

        // Si no existe el usuario, enviamos 401 (Unauthorized)
        if (!user) {
            return res.status(401).json({
                ok: false,
                mensaje: "El usuario no existe",
            });
        }

        const correcto = await bcrypt.compare(password, user.password);

        if (!correcto) {
            return res.status(401).json({
                ok: false,
                mensaje: "La contraseña es incorrecta",
            });
        }

        req.session.usuario = {
            id: user.id,
            usuario: user.nick,
        };

        await LogDAO.insertar(
            user.id,
            "LOGIN",
            `Inicio de sesión correcto - ID: ${user.id}`,
        );

        res.json({
            ok: true,
            avatar: user.avatar,
            nick: user.nick,
            id: user.id,
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            ok: false,
            mensaje: "Error interno del servidor al intentar iniciar sesión",
        });
    }
};

// --- Logout ---
const logout = (req, res) => {
    const userId = req.session.usuario?.id;
    req.session.destroy(async (err) => {
        if (err)
            return res.status(500).json({ mensaje: "Error al cerrar sesión" });
        if (userId) {
            await LogDAO.insertar(
                userId,
                "LOGOUT",
                `Cierre de sesión correcto - ID: ${userId}`,
            );
        }
        res.json({ ok: true, mensaje: "Logout correcto" });
    });
};
//Eliminacion cuenta
const deleteAccount = async (req, res) => {
    try {
        const userId = req.session.usuario?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ ok: false, mensaje: "No hay usuario en sesión" });
        }

        const { error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (deleteError) {
            return res
                .status(500)
                .json({ ok: false, mensaje: deleteError.message });
        }

        await LogDAO.insertar(
            userId,
            "INFO",
            `Cuenta eliminada - ID: ${userId}`,
        );

        req.session.destroy((err) => {
            if (err) {
                console.error("Error sesión:", err);
            }
            res.clearCookie("connect.sid");
            res.json({
                ok: true,
                mensaje: "Cuenta eliminada correctamente",
            });
        });
        return;
    } catch (error) {
        console.error("Error deleteAccount:", error);
        res.status(500).json({ ok: false, mensaje: error.message });
    }
};
const authController = {
    registro,
    login,
    logout,
    deleteAccount,
};

export default authController;
