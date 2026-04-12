import { supabase } from "../db/database.js";
import LogDAO from "../dao/LogDAO.js";

// --- Registro ---
const registro = async (req, res) => {
    try {
        const { usuario, email, password } = req.body;
        const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${usuario}`;

        // Validaciones
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

        // 1. Crear usuario en Supabase Auth
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

        // 2. Guardar nick y avatar en tu tabla users
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    nick: usuarioLimpio,
                    email: emailLimpio,
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
        // 1. Buscar email por nick en tu tabla
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

        // 2. Verificar contraseña con Supabase Auth
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

        // 3. Crear sesión igual que antes
        req.session.usuario = {
            id: userData.id,
            usuario: userData.nick,
        };

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

// --- Eliminar cuenta ---
const deleteAccount = async (req, res) => {
    try {
        const userId = req.session.usuario?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ ok: false, mensaje: "No hay usuario en sesión" });
        }

        // 1. Obtener email para borrar de Supabase Auth
        const { data: userData } = await supabase
            .from("users")
            .select("email")
            .eq("id", userId)
            .single();

        // 2. Borrar de tu tabla users
        const { error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (deleteError) {
            return res
                .status(500)
                .json({ ok: false, mensaje: deleteError.message });
        }

        // 3. Borrar de Supabase Auth
        if (userData?.email) {
            const { data: authUser } = await supabase.auth.admin.listUsers();
            const user = authUser?.users?.find(
                (u) => u.email === userData.email,
            );
            if (user) {
                await supabase.auth.admin.deleteUser(user.id);
            }
        }

        await LogDAO.insertar(
            userId,
            "INFO",
            `Cuenta eliminada - ID: ${userId}`,
        );

        req.session.destroy((err) => {
            res.clearCookie("connect.sid");
            res.json({ ok: true, mensaje: "Cuenta eliminada correctamente" });
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
};

const authController = { registro, login, logout, deleteAccount };
export default authController;
