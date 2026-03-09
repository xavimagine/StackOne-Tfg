const { supabase } = require("../db/database");

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

module.exports = LogDAO;
