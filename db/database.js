require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env"),
});
// const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js"); // Cliente Supabase

// 2. Configuración Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
);

module.exports = { supabase };
