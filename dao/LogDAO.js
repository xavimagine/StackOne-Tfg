import { supabase } from "../db/database.js";
class LogDAO {
    static async insertar(userId, tipo, mensaje) {
        try {
            const { data, error } = await supabase
                .from("logs")
                .insert([{ tipo, mensaje }]); // 👈 sin user_id
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            throw error;
        }
    }
}

export default LogDAO;
