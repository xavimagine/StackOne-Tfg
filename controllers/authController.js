import { supabase } from "../db/database.js";
import LogDAO from "../dao/LogDAO.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_jwt_respaldo";

// --- Registro ---
const registro = async (req, res) => {
    try {
        const { usuario, email, password } = req.body;
        const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${usuario}`;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El formato del correo no es válido",
            });
        }
        if (!usuario || usuario.trim().length < 3) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nick debe tener al menos 3 caracteres",
            });
        }

        const emailLimpio = email.replace(/[<>]/g, "");
        const usuarioLimpio = usuario.replace(/[<>]/g, "");

        const { data: authData, error: authError } = await supabase.auth.signUp(
            {
                email: emailLimpio,
                password: password,
            },
        );

        if (authError) {
            return res
                .status(400)
                .json({ ok: false, mensaje: authError.message });
        }

        const { data, error } = await supabase
            .from("users")
            .insert([{ nick: usuarioLimpio, email: emailLimpio, avatar }])
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
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, nick, email, avatar")
            .eq("nick", usuario)
            .single();

        if (userError || !userData) {
            return res
                .status(401)
                .json({ ok: false, mensaje: "El usuario no existe" });
        }

        const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
                email: userData.email,
                password: password,
            });

        if (authError) {
            return res
                .status(401)
                .json({ ok: false, mensaje: "La contraseña es incorrecta" });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: userData.id, usuario: userData.nick },
            JWT_SECRET,
            { expiresIn: "1h" },
        );

        // Mandar token en cookie httpOnly
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 3600000,
        });

        await LogDAO.insertar(
            userData.id,
            "LOGIN",
            `Inicio de sesión correcto - ID: ${userData.id}`,
        );

        res.json({
            ok: true,
            avatar: userData.avatar,
            nick: userData.nick,
            id: userData.id,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error interno del servidor",
        });
    }
};
//session
const me = async (req, res) => {
    try {
        const { data: userData, error } = await supabase
            .from("users")
            .select("id, nick, avatar")
            .eq("id", req.usuario.id)
            .single();

        if (error || !userData) {
            return res.status(401).json({ ok: false });
        }

        res.json({
            ok: true,
            nick: userData.nick,
            avatar: userData.avatar,
            id: userData.id,
        });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};
// --- Logout ---
const logout = (req, res) => {
    const userId = req.usuario?.id;
    res.clearCookie("token");
    if (userId) {
        LogDAO.insertar(
            userId,
            "LOGOUT",
            `Cierre de sesión correcto - ID: ${userId}`,
        );
    }
    res.json({ ok: true, mensaje: "Logout correcto" });
};

// --- Eliminar cuenta ---
const deleteAccount = async (req, res) => {
    try {
        const userId = req.usuario?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ ok: false, mensaje: "No autorizado" });
        }

        const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("email")
            .eq("id", userId)
            .single();

        if (fetchError || !userData) {
            return res
                .status(404)
                .json({ ok: false, mensaje: "Usuario no encontrado" });
        }

        await LogDAO.insertar(
            userId,
            "INFO",
            `Iniciando eliminación completa - ID: ${userId}`,
        );

        const { data: authListData, error: listError } =
            await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        const authUser = authListData.users.find(
            (u) => u.email === userData.email,
        );

        if (authUser) {
            const { error: authDeleteError } =
                await supabase.auth.admin.deleteUser(authUser.id);
            if (authDeleteError) throw authDeleteError;
        }

        const { error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (deleteError) throw deleteError;

        // 5. Limpieza de sesión
        res.clearCookie("token");
        return res.json({
            ok: true,
            mensaje: "Cuenta y autenticación eliminadas correctamente",
        });
    } catch (error) {
        return res.status(500).json({ ok: false, mensaje: error.message });
    }
};

const authController = { registro, login, logout, deleteAccount, me };
export default authController;
