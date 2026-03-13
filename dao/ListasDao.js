const { supabase } = require("../db/database");

class ListasDAO {
    static async obtenerConteoPorEstado(userId) {
        try {
            const { data, error } = await supabase
                .from("listas_juegos")
                .select("status")
                .eq("user_id", userId);

            if (error) throw error;

            // Procesamos los datos para devolver un objeto con los totales
            const conteo = data.reduce(
                (acc, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1;
                    return acc;
                },
                { jugando: 0, completado: 0, deseado: 0, abandonado: 0 },
            );

            return { ok: true, data: conteo };
        } catch (error) {
            console.error("Error en DAO al contar juegos:", error);
            return { ok: false, error: error.message };
        }
    }
    static async obtenerJuegosPorLista(userId, status) {
        try {
            const { data, error } = await supabase
                .from("listas_juegos")
                .select(
                    `
                    id_relacion,
                    status,
                    fecha_agregado,
                    games (
                        id,
                        name,
                        description,
                        cover,
                        genres
                        platforms,
                        rating,
                        company
                    )
                `,
                )
                .eq("user_id", userId)
                .eq("status", status);

            if (error) throw error;

            // Limpiamos la respuesta para que sea más fácil de usar en el frontend
            const juegosFormateados = data.map((item) => ({
                status: item.status,
                fecha: item.fecha_agregado,
                ...item.games, // Expandimos la info del juego directamente
            }));

            return { success: true, data: juegosFormateados };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = ListasDAO;
