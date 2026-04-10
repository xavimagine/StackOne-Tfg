import { supabase } from "../db/database.js";
class UsuarioDAO {
    static async crear(usuario, passwordHash, email) {
        // Generamos el avatar dinámico
        const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${usuario}`;

        // USAMOS EL CLIENTE DE SUPABASE (No SQL directo con pool)
        const { data, error } = await supabase
            .from("users") // Nombre de tu tabla en la imagen
            .insert([
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
            .select("id, nick, password,avatar") // Seleccionamos solo lo que necesitamos
            .eq("nick", usuario) // .eq significa 'equal' (igual a)
            .single(); // Nos devuelve un objeto único

        if (error && error.code !== "PGRST116") {
            // PGRST116 es el código de Supabase para "no se encontró ninguna fila"
            // Lo ignoramos para que el controlador simplemente reciba 'null'
            throw error;
        }

        return data;
    }
}

export default UsuarioDAO;
