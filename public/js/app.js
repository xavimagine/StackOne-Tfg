// CONEXION PARA EL DEPLOY
// CAMBIAR supabase por db
// const { createClient } = supabase;
// const db = createClient(
//   "https://dpdqoaymzrdoqecfoyylf.supabase.co",
//   "sb_publishable_zGP2SnNGNYPQY-5DDbju8g_KFf_R7ly",
// );

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
        const { data: profile, error: dbError } = await supabase
            .from("users")
            .select("avatar, username")
            .eq("id", user.id)
            .single();

        if (profile) {
            //Ocultar vistas de login
            document.getElementById("logged-out-view").classList.add("hidden");
            document.getElementById("dropdown-menu").classList.add("hidden");
            document
                .getElementById("logged-in-view")
                .classList.remove("hidden");
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
            Swal.fire({
                title: "¡Error!",
                text: "Las contraseñas deber iguales",
                icon: "error",
                confirmButtonText: "Intentar de nuevo",
                confirmButtonColor: "#d33",
                width: "350px",
            });
            return;
        }
        if (data.usuario.trim() === "0") {
            Swal.fire({
                title: "Nick no válido",
                text: "El nombre de usuario no puede ser '0'.",
                icon: "warning",
                confirmButtonColor: "#f39c12",
            });
            return;
        }

        enviarPeticion("http://localhost:3000/registro", data);
    } else {
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
                Swal.fire({
                    title: "¡Cuenta creada!",
                    text: "Ya puedes iniciar sesión",
                    icon: "success",
                    confirmButtonText: "Ir al Login",
                    confirmButtonColor: "#2ecc71",
                    width: "350px",
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "index.html";
                    }
                });

                botonMenu.click();
            } else {
                Swal.fire({
                    title: '<span style="color:#2ecc71">¡Excelente!</span>',
                    text: "Te has registrado con éxito",
                    background: "#fff",
                    color: "#fff",
                    confirmButtonColor: "#2ecc71",
                    icon: "success",
                    width: "300px",
                    iconColor: "#2ecc71",
                });

                // OCULTAR EL MENÚ DESPLEGABLE
                desplegarMenu.classList.add("hidden");

                //INTERCAMBIAR VISTAS EN EL NAVBAR
                document
                    .getElementById("logged-out-view")
                    .classList.add("hidden");
                document
                    .getElementById("logged-in-view")
                    .classList.remove("hidden");

                // Avatar
                const nameSpan = document.getElementById("user-display-name");
                const avatarImg = document.getElementById("user-avatar");
                const avatarProfile = document.getElementById("avatarProfile");
                const userName = document.getElementById("Nombreuser");
                const bienvenida = document.getElementById("bienvenida");

                nameSpan.textContent = resultado.username || "";
                avatarImg.src = resultado.avatar || "assets/default-avatar.png";
                avatarProfile.src =
                    resultado.avatar || "assets/default-avatar.png";
                userName.textContent = resultado.nick;
                bienvenida.textContent = `¡ Bienvenido ${resultado.nick} !`;
            }
        }
    } catch (error) {
        console.log(data);
        const usuarioAfectado = data.usuario || data.email || "Desconocido";
        if (typeof registrarLog === "function") {
            await registrarLog(
                "ERROR",
                `Usuario [${usuarioAfectado}] falló: ${error.message}`,
            );
        }
    }
}
/**
 *
 * LOGOUT
 *
 */

document.addEventListener("DOMContentLoaded", () => {
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
                    document.getElementById("perfil").classList.add("hidden");
                    document
                        .getElementById("buscador")
                        .classList.remove("hidden");

                    // Mostrar vista de no logueado
                    document
                        .getElementById("logged-in-view")
                        .classList.add("hidden");
                    document
                        .getElementById("logged-out-view")
                        .classList.remove("hidden");
                    limpiarSesion();
                }
            } catch (error) {
                // Si el backend falla, limpia el frontend igualmente
                limpiarSesion();
            }
        });
    }
});

function limpiarSesion() {
    document.getElementById("logged-in-view").classList.add("hidden");
    document.getElementById("logged-out-view").classList.remove("hidden");
    document.getElementById("user-display-name").textContent = "";
    document.getElementById("user-avatar").src = "";
    document.getElementById("avatarProfile").src = "";
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
const descubirMobile = document.getElementById("nav-descubrir-mobile");
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
// FUNCIÓN PARA MOSTRAR EL PERFIL EN LA VISTA MOVIL
linkPerfilMobile.addEventListener("click", (e) => {
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
//FUNCIÓN MOSTRAR DESCUBRIR MOBILE
descubirMobile.addEventListener("click", (e) => {
    seccionPerfil.classList.add("hidden");
    seccionBuscador.classList.remove("hidden");
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

/**
 * PINTAR LAS CARDS
 */ // 1. Constantes
const ITEMS_PER_PAGE = 20;
let currentPage = 1;

// 2. Primero la función helper
function isUserLoggedIn() {
    return !document
        .getElementById("logged-in-view")
        .classList.contains("hidden");
}

// createGameCard html
function createGameCard({
    name,
    genres,
    rating,
    company,
    coverImage,
    coverAlt,
    game_mode,
}) {
    const loggedIn = isUserLoggedIn();
    const card = document.createElement("div");
    card.className =
        "game-card relative group rounded-xl overflow-hidden shadow-lg h-64 cursor-pointer bg-gray-900";
    card.innerHTML = `
    <img
      alt="${coverAlt || name}"
      class="game-cover w-full h-full object-cover"
      src="${coverImage}" />

    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60"></div>

    <div class="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded border border-white/20">
      ${rating}
    </div>

    <div class="game-info absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/90 to-primary/80 backdrop-blur-md border-t border-white/10 text-white">
      <h3 class="text-xl font-bold mb-1">${name}</h3>
      <div class="flex items-center gap-3 text-sm text-white/80 mb-3">
        <span class="flex items-center gap-1">
          <span class="material-icons text-xs">star</span> ${rating}
        </span>
        <span>•</span>
        <span>${genres}</span>
      </div>
      <p class="text-xs text-white/70 mb-3 line-clamp-2">${game_mode}</p>
      <div class="text-xs font-medium text-white/90">Released: ${company}</div>

      ${
          loggedIn
              ? `
      <section class="flex flex-row items-center gap-2">
        <a class="flex items-center gap-3 px-4 py-3 bookmark-btn cursor-pointer">
          <span class="material-icons-round text-fuchsia-400">bookmark</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 favorite-btn cursor-pointer">
          <span class="material-icons-round text-pink-500">favorite</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 award-btn cursor-pointer">
          <span class="material-icons-round text-yellow-500">emoji_events</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 close-btn cursor-pointer">
          <span class="material-icons-round text-red-500">close</span>
        </a>
      </section>`
              : ""
      }
    </div>`;

    return card;
}

// renderCards
function renderCards(games) {
    const container = document.getElementById("resultados");
    container.className =
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4";
    container.innerHTML = "";

    games.forEach((game) => {
        const card = createGameCard({
            name: game.name,
            genres: game.genres,
            rating: game.rating ?? "N/A",
            company: game.company,
            coverImage: game.cover,
            coverAlt: game.name,
            game_mode: game.game_modes,
        });
        container.appendChild(card);
    });
}

// renderPagination
function renderPagination({ currentPage, totalPages }) {
    let pagination = document.getElementById("pagination");
    if (!pagination) {
        pagination = document.createElement("div");
        pagination.id = "pagination";
        pagination.className =
            "flex items-center justify-center gap-2 mt-6 flex-wrap";
        document
            .getElementById("resultados")
            .insertAdjacentElement("afterend", pagination);
    }
    pagination.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Anterior";
    prevBtn.disabled = currentPage === 1;
    prevBtn.className = `px-4 py-2 rounded-lg text-sm font-medium transition
        ${
            currentPage === 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-primary cursor-pointer"
        }`;
    prevBtn.onclick = () => fetchGames(currentPage - 1);
    pagination.appendChild(prevBtn);

    const maxVisible = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "text-white/50 px-2";
        pagination.appendChild(dots);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.className = `px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer
            ${
                i === currentPage
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-white hover:bg-primary"
            }`;
        pageBtn.onclick = () => fetchGames(i);
        pagination.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "text-white/50 px-2";
        pagination.appendChild(dots);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Siguiente →";
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.className = `px-4 py-2 rounded-lg text-sm font-medium transition
        ${
            currentPage >= totalPages
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-primary cursor-pointer"
        }`;
    nextBtn.onclick = () => fetchGames(currentPage + 1);
    pagination.appendChild(nextBtn);
}

async function fetchGames(page = 1) {
    try {
        const respuesta = await fetch(
            `http://localhost:3000/games/listar?page=${page}&limit=${ITEMS_PER_PAGE}`,
            { credentials: "include" },
        );

        const resultado = await respuesta.json();
        console.log("Resultado:", resultado);

        if (!respuesta.ok)
            throw new Error(resultado.error || "Error al obtener los juegos");

        currentPage = resultado.pagination.currentPage;
        renderCards(resultado.games);
        renderPagination(resultado.pagination);

        document
            .getElementById("resultados")
            .scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error("Error fetchGames:", error);
        document.getElementById("resultados").innerHTML = `
            <p class="text-red-400 text-center col-span-full">
                ${error.message}
            </p>`;
    }
}

fetchGames(1);
