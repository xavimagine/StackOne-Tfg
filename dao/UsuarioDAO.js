import { supabase } from "../db/database.js";
class UsuarioDAO {
    static async crear(usuario, passwordHash, email) {
        // Generamos el avatar dinámico
        const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${usuario}`;

        const { data, error } = await supabase.from("users").insert([
            {
                nick: usuario,
                email: email,
                password: passwordHash,
                avatar: avatar,
            },
        ]);

        if (error) {
            // Lanzamos el error para que el Controller lo capture (el famoso 23505)
            throw error;
        }

        return data;
    }

    static async buscarPorUsuario(usuario) {
        // Buscamos en la tabla 'users' donde la columna 'nick' coincida con el usuario
        const { data, error } = await supabase
            .from("users")
            .select("id, nick, password,avatar")
            .eq("nick", usuario)
            .single();
        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return data;
    }
}

export default UsuarioDAO;
