/**
 * Despligue de menu movil
 */
async function fetchUserData() {
  // 1. Obtenemos el usuario autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (user) {
    // 2. Consultamos la tabla 'users' usando el ID del usuario
    const { data: profile, error: dbError } = await supabase
      .from("users")
      .select("avatar, username") // username o el campo que uses para el nombre
      .eq("id", user.id)
      .single();

    if (profile) {
      //Ocultar vistas de login
      document.getElementById("logged-out-view").classList.add("hidden");
      document.getElementById("dropdown-menu").classList.add("hidden");
      document.getElementById("logged-in-view").classList.remove("hidden");
    }
  }
}
/**
 * LOGING
 */

const menuBtn = document.getElementById("menu-btn");
const desplegarMenu = document.getElementById("dropdown-menu");
const botonMenu = document.getElementById("toggle-view");
const verifyField = document.getElementById("verify-field");
const verifyEmail = document.getElementById("verify-email");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const formUsuario = document.getElementById("usuario-form");
const logemail = document.getElementById("logemail");

// 1. Mostrar/Ocultar Menú
menuBtn.addEventListener("click", () => {
  desplegarMenu.classList.toggle("hidden");
});

//  Login y Registro
let isRegister = false;

botonMenu.addEventListener("click", () => {
  isRegister = !isRegister;

  if (isRegister) {
    formTitle.innerText = "Crear Cuenta";
    submitBtn.innerText = "Registrarse";
    botonMenu.innerText = "¿Ya tienes cuenta? Inicia sesión";
    verifyEmail.classList.remove("hidden");
    logemail.required = true;
    verifyField.classList.remove("hidden"); // Muestra campo de verificación
  } else {
    formTitle.innerText = "Iniciar Sesión";
    submitBtn.innerText = "Entrar";
    botonMenu.innerText = "¿No tienes cuenta? Regístrate";
    verifyEmail.classList.add("hidden");
    logemail.required = false;
    verifyField.classList.add("hidden"); // Oculta campo de verificación
  }
});

// Cerrar si se hace click fuera
window.addEventListener("click", (e) => {
  if (!document.getElementById("dropdown-container").contains(e.target)) {
    desplegarMenu.classList.add("hidden");
  }
});

formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(formUsuario);
  // Lo convierte a un objeto
  const data = Object.fromEntries(formData.entries());

  // AQUÍ DETECTAMOS EL MODO
  if (isRegister) {
    // --- Lógica de REGISTRO ---
    if (data.password !== data.confirmPassword) {
      alert("Las contraseñas deben ser iguales");
      return;
    }

    enviarPeticion("http://localhost:3000/registro", data);
  } else {
    // --- Lógica de LOGIN ---
    //Eliminar la confirmacion de la password del form porque no voy a necesitarla
    delete data.confirmPassword;
    delete data.email;

    enviarPeticion("http://localhost:3000/login", data);
  }
});
async function enviarPeticion(ruta, data) {
  try {
    const respuesta = await fetch(ruta, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      // IMPORTANTE: Para que Express-Session guarde la cookie en el navegador
      credentials: "include",
    });

    const resultado = await respuesta.json();
    if (respuesta.ok && resultado.ok !== false) {
      // 1. Limpiamos los campos
      formUsuario.reset();
      seccionPerfil.classList.add("hidden");
      seccionBuscador.classList.remove("hidden");
      if (isRegister) {
        alert("¡Cuenta creada correctamente! Ya puedes iniciar sesión.");

        botonMenu.click();
      } else {
        alert("¡Bienvenido/a!");

        // OCULTAR EL MENÚ DESPLEGABLE
        desplegarMenu.classList.add("hidden");

        //INTERCAMBIAR VISTAS EN EL NAVBAR
        document.getElementById("logged-out-view").classList.add("hidden");
        document.getElementById("logged-in-view").classList.remove("hidden");

        // Avatar
        const nameSpan = document.getElementById("user-display-name");
        const avatarImg = document.getElementById("user-avatar");
        const avatarProfile = document.getElementById("avatarProfile");
        const userName = document.getElementById("Nombreuser");
        const bienvenida = document.getElementById("bienvenida");

        nameSpan.textContent = resultado.username || "";
        avatarImg.src = resultado.avatar || "assets/default-avatar.png";
        avatarProfile.src = resultado.avatar || "assets/default-avatar.png";
        userName.textContent = resultado.nick;
        bienvenida.textContent = `¡ Bienvenido ${resultado.nick} !`;
      }
    } else {
      alert("Atención: " + (resultado.mensaje || "Error en el servidor"));
    }
  } catch (error) {
    const usuarioAfectado = data.id || "Desconocido";
    if (typeof registrarLog === "function") {
      await registrarLog(
        "ERROR",
        `Usuario [${usuarioAfectado}] falló: ${error.message}`,
      );
    }

    alert("No se ha podido conectar con el servidor. Inténtalo más tarde.");
  }
}
/**
 *
 * LOGOUT
 *
 */

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      const respuesta = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      const resultado = await respuesta.json();

      if (respuesta.ok && resultado.ok) {
        // 1. Intercambiar vistas
        document.getElementById("logged-in-view").classList.add("hidden");
        document.getElementById("logged-out-view").classList.remove("hidden");

        // 2. Limpiar datos de usuario
        document.getElementById("user-display-name").textContent = "";
        document.getElementById("user-avatar").src = "";
        document.getElementById("avatarProfile").src = "";
      } else {
        alert("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      }
    } catch (error) {
      if (typeof registrarLog === "function") {
        await registrarLog("LOGIN_FALLIDO", `LOGIN_FALLIDO: ${error.message}`);
      }
      alert("No se pudo conectar con el servidor.");
    }
  });
}
async function registrarLog(tipo, mensaje) {
  try {
    await fetch("http://localhost:3000/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, mensaje }),
    });
  } catch (err) {}
}

// Control del Menú Móvil
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    // Alterna la clase 'hidden' para mostrar/ocultar
    mobileMenu.classList.toggle("hidden");
  });
}

/**
 * PERFIL OCULTADO Y MOSTRADO
 */
// Referencias a los botones del Nav
const linkDescubrir = document.getElementById("nav-descubrir");
const linkPerfil = document.getElementById("nav-perfil");
const linkPerfilMobile = document.getElementById("nav-perfil-mobile");
// Referencias a las secciones
const seccionBuscador = document.getElementById("buscador");
const seccionPerfil = document.getElementById("perfil");

// --- FUNCIÓN PARA MOSTRAR DESCUBRIR ---
linkDescubrir.addEventListener("click", (e) => {
  e.preventDefault();
  seccionBuscador.classList.remove("hidden");
  seccionPerfil.classList.add("hidden");
});
linkPerfilMobile.addEventListener("click", (e) => {
  e.preventDefault();
  seccionBuscador.classList.remove("hidden");
  seccionPerfil.classList.add("hidden");
});

// --- FUNCIÓN PARA MOSTRAR PERFIL (CON FILTRO DE SESIÓN) ---
linkPerfil.addEventListener("click", (e) => {
  e.preventDefault();
  const isLoggedIn = !document
    .getElementById("logged-in-view")
    .classList.contains("hidden");

  if (isLoggedIn) {
    seccionBuscador.classList.add("hidden");
    seccionPerfil.classList.remove("hidden");
  } else {
    desplegarMenu.classList.remove("hidden");
  }
});
