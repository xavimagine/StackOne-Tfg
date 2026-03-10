import bcrypt from "bcrypt";
import { supabase } from "../db/database.js";
import UsuarioDAO from "../dao/UsuarioDAO.js";
import LogDAO from "../dao/LogDAO.js";

// --- Registro ---
export const registro = async (req, res) => {
  try {
    const { usuario, email, password } = req.body;
    const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${usuario}`;

    // 1. VALIDACIÓN  con Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ ok: false, mensaje: "El formato del correo no es válido" });
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
export const login = async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const user = await UsuarioDAO.buscarPorUsuario(usuario);

    if (!user) {
      return res.json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    const correcto = await bcrypt.compare(password, user.password);

    if (!correcto) {
      return res.json({ ok: false, mensaje: "Contraseña incorrecta" });
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
    res.json({ ok: true, avatar: user.avatar, nick: user.nick, id: user.id });
  } catch (error) {
    res.status(500).json({ error: "Error en login" });
  }
};

// --- Logout ---
export const logout = (req, res) => {
  const userId = req.session.usuario?.id;
  req.session.destroy(async (err) => {
    if (err) return res.status(500).json({ mensaje: "Error al cerrar sesión" });
    if (userId) {
      await LogDAO.insertar(
        userId,
        "LOGOUT",
        `Cierre de sesión correcto - ID: ${user.id}`,
      );
    }
    res.json({ ok: true, mensaje: "Logout correcto" });
  });
};
