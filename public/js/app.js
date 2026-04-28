const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://stackone-tfg.onrender.com";
//para el deploy
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
}
document.addEventListener("DOMContentLoaded", () => {
    const ITEMS_PER_PAGE = 20;
    let currentPage = 1;
    let currentUserId = null;
    let activeFilters = {
        texto: "",
        genero: "",
        plataforma: "",
        rating: null,
    };
    //botones de mostra contraseña
    const btnPass = document.getElementById("passvisibility");
    const inputPass = document.querySelector('[name="password"]');
    const iconPass = btnPass.querySelector(".material-icons");

    btnPass.addEventListener("mousedown", () => {
        inputPass.type = "text";
        iconPass.textContent = "visibility_off";
    });
    btnPass.addEventListener("mouseup", () => {
        inputPass.type = "password";
        iconPass.textContent = "visibility";
    });
    btnPass.addEventListener("mouseleave", () => {
        inputPass.type = "password";
        iconPass.textContent = "visibility";
    });
    btnPass.addEventListener("touchstart", (e) => {
        e.preventDefault();
        inputPass.type = "text";
        iconPass.textContent = "visibility_off";
    });
    btnPass.addEventListener("touchend", () => {
        inputPass.type = "password";
        iconPass.textContent = "visibility";
    });

    const btnVerif = document.getElementById("passVerifVisibility");
    const inputVerif = document.getElementById("passVerif");
    const iconVerif = btnVerif.querySelector(".material-icons");

    btnVerif.addEventListener("mousedown", () => {
        inputVerif.type = "text";
        iconVerif.textContent = "visibility_off";
    });
    btnVerif.addEventListener("mouseup", () => {
        inputVerif.type = "password";
        iconVerif.textContent = "visibility";
    });
    btnVerif.addEventListener("mouseleave", () => {
        inputVerif.type = "password";
        iconVerif.textContent = "visibility";
    });
    btnVerif.addEventListener("touchstart", (e) => {
        e.preventDefault();
        inputVerif.type = "text";
        iconVerif.textContent = "visibility_off";
    });
    btnVerif.addEventListener("touchend", () => {
        inputVerif.type = "password";
        iconVerif.textContent = "visibility";
    });
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            const isDark = document.documentElement.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
    const menuBtn = document.getElementById("menu-btn");
    const desplegarMenu = document.getElementById("dropdown-menu");
    const botonMenu = document.getElementById("toggle-view");
    const verifyField = document.getElementById("verify-field");
    const verifyEmail = document.getElementById("verify-email");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const formUsuario = document.getElementById("usuario-form");
    const logemail = document.getElementById("logemail");
    const logoutBtn = document.getElementById("logout-btn");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const linkDescubrir = document.getElementById("nav-descubrir");
    const linkPerfil = document.getElementById("nav-perfil");
    const descubirMobile = document.getElementById("nav-descubrir-mobile");
    const linkPerfilMobile = document.getElementById("nav-perfil-mobile");
    const seccionBuscador = document.getElementById("buscador");
    const seccionPerfil = document.getElementById("perfil");
    const searchInput = document.getElementById("search-input");
    const filterGenre = document.getElementById("filter-genre");
    const filterPlatform = document.getElementById("filter-platform");
    const filterRating = document.getElementById("filter-rating");
    const btnReset = document.getElementById("reset-filters");
    const btnSearch = document.getElementById("btn-search");
    const sectionDescubrir = document.getElementById("buscador");
    const sectionEventos = document.getElementById("eventos-section");
    const navEventoMobile = document.getElementById("nav-eventos-mobile");
    const btnEventos = document.getElementById("nav-eventos");
    const iconostack = document.getElementById("iconostack");
    const lemastack = document.getElementById("lemastack");

    function isUserLoggedIn() {
        return !document
            .getElementById("logged-in-view")
            .classList.contains("hidden");
    }

    async function registrarLog(tipo, mensaje) {
        try {
            await fetch(`${API_URL}/logs`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo, mensaje }),
            });
        } catch (err) {}
    }

    function limpiarSesion() {
        document.getElementById("logged-in-view").classList.add("hidden");
        document.getElementById("logged-out-view").classList.remove("hidden");
        document.getElementById("user-display-name").textContent = "";
        document.getElementById("user-avatar").src = "";
        document.getElementById("avatarProfile").src = "";
        currentUserId = null;
        linkPerfil.classList.add("hidden");
        linkPerfilMobile.classList.add("hidden");
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        mobileMenu.addEventListener("mouseleave", () => {
            mobileMenu.classList.add("hidden");
        });
    }

    menuBtn.addEventListener("click", () => {
        desplegarMenu.classList.toggle("hidden");
    });

    let isRegister = false;

    botonMenu.addEventListener("click", () => {
        isRegister = !isRegister;
        if (isRegister) {
            formTitle.innerText = "Crear Cuenta";
            submitBtn.innerText = "Registrarse";
            botonMenu.innerText = "¿Ya tienes cuenta? Inicia sesión";
            verifyEmail.classList.remove("hidden");
            logemail.required = true;
            verifyField.classList.remove("hidden");
        } else {
            formTitle.innerText = "Iniciar Sesión";
            submitBtn.innerText = "Entrar";
            botonMenu.innerText = "¿No tienes cuenta? Regístrate";
            verifyEmail.classList.add("hidden");
            logemail.required = false;
            verifyField.classList.add("hidden");
        }
    });

    window.addEventListener("click", (e) => {
        if (
            !document.getElementById("dropdown-container").contains(e.target) &&
            !document.getElementById("theme-toggle").contains(e.target)
        ) {
            desplegarMenu.classList.add("hidden");
        }
    });

    formUsuario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(formUsuario);
        const data = Object.fromEntries(formData.entries());
        if (data.usuario) {
            data.usuario = data.usuario.toLowerCase().trim();
        }
        if (data.email) {
            data.email = data.email.toLowerCase().trim();
        }
        if (isRegister) {
            if (data.password !== data.confirmPassword) {
                Swal.fire({
                    title: "¡Error!",
                    text: "Las contraseñas deben ser iguales",
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
                    text: "El nombre de usuario debe de tener más de 3 caracteres .",
                    icon: "warning",
                    confirmButtonColor: "#f39c12",
                });
                return;
            }
            enviarPeticion(`${API_URL}/auth/registro`, data);
        } else {
            delete data.confirmPassword;
            delete data.email;
            enviarPeticion(`${API_URL}/auth/login`, data);
        }
    });
    // Volver atras en detalles de juego
    function volverAtras() {
        document.getElementById("game-detail").classList.add("hidden");

        if (lastView === "perfil") {
            document.getElementById("perfil").classList.remove("hidden");
        } else if (lastView === "eventos") {
            document
                .getElementById("eventos-section")
                .classList.remove("hidden");
        } else {
            document.getElementById("buscador").classList.remove("hidden");
        }
    }
    // Mostra detalles de un juego
    let lastView = "buscador";
    function mostrarDetalleJuego(game) {
        lastView = document
            .getElementById("perfil")
            .classList.contains("hidden")
            ? "buscador"
            : "perfil";

        const detail = document.getElementById("game-detail");
        detail.innerHTML = `
        <button id="back-btn" class="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
            ← Volver
        </button>

        <div class="grid md:grid-cols-2 gap-8 items-start">
            <img
                src="${game.cover || "assets/default/default-cover.png"}"
                alt="${game.name}"
                class="w-full rounded-2xl shadow-xl object-cover"
            />

            <div class="space-y-4 text-black">
                <h2 class="text-4xl font-bold dark:text-white">${game.name}</h2>
                <p class="text-black/80 dark:text-white">${game.summary || "Sin descripción disponible."}</p>
                <div class="dark:text-white"><strong>Géneros:</strong> ${game.genres || "-"}</div>
                <div class="dark:text-white"><strong>Plataformas:</strong> ${game.platforms || "-"}</div>
                <div class="dark:text-white"><strong>Rating:</strong> ${game.rating ?? "N/A"}</div>
                <div class="dark:text-white"><strong>Compañía:</strong> ${game.company || "-"}</div>
                <div class="dark:text-white"><strong>Modos:</strong> ${game.game_modes || "-"}</div>
            </div>
        </div>
    `;

        document.getElementById("back-btn").addEventListener("click", () => {
            detail.classList.add("hidden");
            if (lastView === "perfil") {
                document.getElementById("perfil").classList.remove("hidden");
            } else {
                document.getElementById("buscador").classList.remove("hidden");
            }
        });

        document.getElementById("buscador").classList.add("hidden");
        document.getElementById("perfil").classList.add("hidden");
        detail.classList.remove("hidden");
    }

    async function enviarPeticion(ruta, data) {
        try {
            const respuesta = await fetch(ruta, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                return Swal.fire({
                    icon: "error",
                    title: "Validación fallida",
                    text: resultado.mensaje,
                    confirmButtonColor: "#8B5E5E",
                });
            }

            formUsuario.reset();
            const detalleVisible = !document
                .getElementById("game-detail")
                .classList.contains("hidden");

            if (!detalleVisible) {
                seccionPerfil.classList.add("hidden");
                seccionBuscador.classList.remove("hidden");
            } else {
                seccionBuscador.classList.add("hidden");
                seccionPerfil.classList.add("hidden");
            }

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
                    if (result.isConfirmed) window.location.href = "index.html";
                });
                botonMenu.click();
            } else {
                await Swal.fire({
                    title: '<span style="color:#2ecc71">¡Excelente!</span>',
                    text: "Te has registrado con éxito",
                    background: "#fff",
                    color: "#fff",
                    confirmButtonColor: "#2ecc71",
                    icon: "success",
                    width: "300px",
                    iconColor: "#2ecc71",
                });

                desplegarMenu.classList.add("hidden");
                document
                    .getElementById("logged-out-view")
                    .classList.add("hidden");
                document
                    .getElementById("logged-in-view")
                    .classList.remove("hidden");
                if (linkPerfil) linkPerfil.classList.remove("hidden");
                if (linkPerfilMobile)
                    linkPerfilMobile.classList.remove("hidden");
                const nameSpan = document.getElementById("user-display-name");
                const avatarImg = document.getElementById("user-avatar");
                const avatarProfile = document.getElementById("avatarProfile");
                const userName = document.getElementById("Nombreuser");
                const bienvenida = document.getElementById("bienvenida");

                if (nameSpan) nameSpan.textContent = resultado.username || "";
                avatarImg.src = resultado.avatar || "assets/default-avatar.png";
                avatarProfile.src =
                    resultado.avatar || "assets/default-avatar.png";
                userName.textContent = resultado.nick;
                bienvenida.textContent = `¡ Bienvenido ${resultado.nick} !`;
                currentUserId = resultado.id;
                fetchGames(1);
                actualizarProgresoVisual();
            }
        } catch (error) {
            const usuarioAfectado = data.usuario || data.email || "Desconocido";
            await registrarLog(
                "ERROR",
                `Usuario [${usuarioAfectado}] falló: ${error.message}`,
            );
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                const respuesta = await fetch(`${API_URL}/auth/logout`, {
                    method: "POST",
                    credentials: "include",
                });
                const resultado = await respuesta.json();
                if (respuesta.ok && resultado.ok) {
                    document.getElementById("perfil").classList.add("hidden");
                    document
                        .getElementById("buscador")
                        .classList.remove("hidden");
                    document
                        .getElementById("logged-in-view")
                        .classList.add("hidden");
                    document
                        .getElementById("logged-out-view")
                        .classList.remove("hidden");
                    limpiarSesion();
                    fetchGames(1);
                }
            } catch (error) {
                limpiarSesion();
            }
        });
    }
    function limpiarListasActivas() {
        document.querySelectorAll("#listas-perfil a").forEach((b) => {
            b.classList.remove("bg-gray-100", "dark:bg-gray-800");
        });
    }
    iconostack.addEventListener("click", (e) => {
        e.preventDefault();
        sectionEventos.classList.add("hidden");
        seccionBuscador.classList.remove("hidden");
        seccionPerfil.classList.add("hidden");
        document.getElementById("game-detail").classList.add("hidden");
        limpiarListasActivas();
    });
    lemastack.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("game-detail").classList.add("hidden");
        sectionEventos.classList.add("hidden");
        seccionBuscador.classList.remove("hidden");
        seccionPerfil.classList.add("hidden");
        limpiarListasActivas();
    });

    linkDescubrir.addEventListener("click", (e) => {
        e.preventDefault();
        sectionEventos.classList.add("hidden");
        seccionBuscador.classList.remove("hidden");
        seccionPerfil.classList.add("hidden");
        limpiarListasActivas();
    });

    descubirMobile.addEventListener("click", () => {
        seccionPerfil.classList.add("hidden");
        seccionBuscador.classList.remove("hidden");
        limpiarListasActivas();
    });

    linkPerfil.addEventListener("click", (e) => {
        e.preventDefault();
        sectionEventos.classList.add("hidden");
        document.getElementById("game-detail").classList.add("hidden");
        if (isUserLoggedIn()) {
            seccionBuscador.classList.add("hidden");
            seccionPerfil.classList.remove("hidden");
            limpiarListasActivas();
        } else {
            desplegarMenu.classList.remove("hidden");
        }
    });

    linkPerfilMobile.addEventListener("click", () => {
        document.getElementById("game-detail").classList.add("hidden");
        if (isUserLoggedIn()) {
            seccionBuscador.classList.add("hidden");
            seccionPerfil.classList.remove("hidden");
            limpiarListasActivas();
        } else {
            desplegarMenu.classList.remove("hidden");
        }
    });

    function renderCards(games) {
        const container = document.getElementById("resultados");
        container.className =
            "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4";
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
                game_id: game.id,
                userStatus: game.status,
                summary: game.summary,
                platforms: game.platforms,
            });

            card.addEventListener("click", (e) => {
                if (e.target.closest(".lista-btn")) return;
                mostrarDetalleJuego({
                    name: game.name,
                    genres: game.genres,
                    rating: game.rating ?? "N/A",
                    company: game.company,
                    cover: game.cover,
                    game_modes: game.game_modes,
                    summary: game.summary,
                    platforms: game.platforms,
                });
            });

            container.appendChild(card);
        });
    }

    function mostrarDetalleEvento(event) {
        const date = new Date(event.start_time * 1000).toLocaleDateString(
            "es-ES",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            },
        );
        const imgUrl = event.event_logo?.url
            ? `https:${event.event_logo.url.replace("t_thumb", "t_720p")}`
            : "assets/default/default-event-image.png";

        const detail = document.getElementById("game-detail");
        detail.innerHTML = `
        <button id="back-btn" class="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
            ← Volver
        </button>

        <div class="grid md:grid-cols-2 gap-8 items-start">
            <img
                src="${imgUrl}"
                alt="${event.name}"
                class="w-full rounded-2xl shadow-xl object-cover"
            />

            <div class="space-y-4 text-black">
                <h2 class="text-4xl font-bold dark:text-white">${event.name}</h2>
                <p class="text-black/80 dark:text-white">${event.description || "Sin descripción disponible."}</p>
                <div class="dark:text-white"><strong>Fecha:</strong> ${date}</div>
                ${
                    event.live_stream_url
                        ? `
                <a href="${event.live_stream_url}" target="_blank"
                    class="inline-block mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90">
                    Ver en directo
                </a>`
                        : ""
                }
            </div>
        </div>
    `;

        document.getElementById("back-btn").addEventListener("click", () => {
            detail.classList.add("hidden");
            document
                .getElementById("eventos-section")
                .classList.remove("hidden");
            loadIGDBEvents();
        });

        document.getElementById("eventos-section").classList.add("hidden");
        detail.classList.remove("hidden");
    }

    function renderPagination({ currentPage, totalPages }) {
        let pagination = document.getElementById("pagination");
        const isMobile = window.innerWidth <= 768;
        if (!pagination) {
            pagination = document.createElement("div");
            pagination.id = "pagination";
            pagination.className =
                "flex items-center justify-center gap-2 mt-6 mb-8 flex-wrap";
            document
                .getElementById("resultados")
                .insertAdjacentElement("afterend", pagination);
        }
        pagination.innerHTML = "";

        const prevBtn = document.createElement("button");
        prevBtn.setAttribute("data-prev", "");
        prevBtn.textContent = "← Anterior";
        prevBtn.disabled = currentPage === 1;
        prevBtn.className = `${isMobile ? "px-2 py-1" : "px-4 py-2"} rounded-lg text-sm font-medium transition ${
            currentPage === 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-primary cursor-pointer"
        }`;
        prevBtn.onclick = () => fetchGames(currentPage - 1, activeFilters);
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
            pageBtn.className = `${isMobile ? "px-2 py-1" : "px-3 py-2"} rounded-lg text-sm font-medium transition cursor-pointer ${
                i === currentPage
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-white hover:bg-primary"
            }`;
            pageBtn.onclick = () => fetchGames(i, activeFilters);
            pagination.appendChild(pageBtn);
        }

        if (endPage < totalPages) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.className = "text-white/50 px-2";
            pagination.appendChild(dots);
        }

        const nextBtn = document.createElement("button");
        nextBtn.setAttribute("data-next", "");
        nextBtn.textContent = "Siguiente →";
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.className = `${isMobile ? "px-2 py-1" : "px-4 py-2"} rounded-lg text-sm font-medium transition ${
            currentPage >= totalPages
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-primary cursor-pointer"
        }`;

        nextBtn.onclick = () => fetchGames(currentPage + 1, activeFilters);
        pagination.appendChild(nextBtn);
    }

    async function fetchGames(page = 1, filters = activeFilters) {
        try {
            const params = new URLSearchParams({
                page,
                limit: ITEMS_PER_PAGE,
                orden: "name",
                direccion: "asc",
            });
            if (filters.texto.trim()) params.set("texto", filters.texto.trim());
            if (filters.genero.trim())
                params.set("genero", filters.genero.trim());
            if (filters.plataforma.trim())
                params.set("plataforma", filters.plataforma.trim());
            if (filters.rating !== null) params.set("rating", filters.rating);

            const respuesta = await fetch(
                `${API_URL}/games/buscar?${params.toString()}`,
                { credentials: "include" },
            );
            const resultado = await respuesta.json();
            if (!respuesta.ok)
                throw new Error(
                    resultado.error || "Error al obtener los juegos",
                );
            currentPage = resultado.pagination.currentPage;
            renderCards(resultado.games);
            renderPagination(resultado.pagination);

            if (page !== 1) {
                document
                    .getElementById("resultados")
                    .scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            document.getElementById("resultados").innerHTML = `
                <p class="text-red-400 text-center col-span-full">${error.message}</p>`;
        }
    }

    function limpiarTextoBusqueda(texto) {
        return texto.trim().replace(/[<>]/g, "").slice(0, 220);
    }
    function applyFilters() {
        const DEFAULTS = ["Genero", "Platforma", "Rating", ""];
        activeFilters = {
            texto: limpiarTextoBusqueda(searchInput.value),
            genero: DEFAULTS.includes(filterGenre.value)
                ? ""
                : filterGenre.value,
            plataforma: DEFAULTS.includes(filterPlatform.value)
                ? ""
                : filterPlatform.value,
            rating: DEFAULTS.includes(filterRating.value)
                ? null
                : parseFloat(filterRating.value),
        };
        fetchGames(1, activeFilters);
    }

    const colorMap = {
        jugando: "text-fuchsia-400",
        deseado: "text-pink-500",
        acabado: "text-yellow-500",
        abandonado: "text-red-500",
    };

    function createGameCard({
        name,
        genres,
        rating,
        company,
        coverImage,
        coverAlt,
        game_mode,
        game_id,
        userStatus,
    }) {
        const displayRating = rating === "N/A" || !rating ? "0.0" : rating;
        const loggedIn = isUserLoggedIn();
        const finalCover =
            coverImage && coverImage !== "null" && coverImage !== "undefined"
                ? coverImage
                : "assets/default/default-cover.png";

        const card = document.createElement("div");

        const getIconClass = (statusKey) => {
            if (!loggedIn || !userStatus) return "text-white/40";
            return userStatus.toLowerCase() === statusKey.toLowerCase()
                ? colorMap[statusKey]
                : "text-white/40";
        };

        card.className =
            "game-card relative group rounded-xl overflow-hidden shadow-lg h-auto cursor-pointer bg-gray-900";

        card.innerHTML = `
    <img alt="${coverAlt || name}" class="game-cover w-full h-full object-cover" src="${finalCover}" />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60"></div>
    <div class="absolute top-3 right-3 max-w-[45%] bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded border border-white/20 leading-tight break-words text-right">
        ${genres}
    </div>
    <div id = "game-info"class="game-info absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/90 to-primary/80 backdrop-blur-md border-t border-white/10 text-white">
        <h3 class="text-xl font-bold mb-1">${name}</h3>
        <div class="flex items-center gap-3 text-sm text-white/80 mb-3">
            <span class="flex items-center gap-1">
                <span class="material-icons text-xs">star</span> ${displayRating}
            </span>
            <span>•</span>
            <span>${genres}</span>
        </div>
        <p class="text-xs text-white/70 mb-3 line-clamp-2">${game_mode}</p>
        <div class="text-xs font-medium text-white/90">Released: ${company}</div>
        ${
            loggedIn
                ? `
        <section class="flex flex-row items-center justify-center gap-1 sm:gap-2 w-full p-1" data-game-id="${game_id}">
            <a class="lista-btn flex items-center justify-center p-3 cursor-pointer rounded-xl hover:bg-white/10 transition-all duration-200" data-status="jugando" title="Jugando">
                <span class="material-icons-round ${getIconClass("jugando")}">bookmark</span>
            </a>
            <a class="lista-btn flex items-center justify-center p-3 cursor-pointer rounded-xl hover:bg-white/10 transition-all duration-200" data-status="deseado" title="Deseado">
                <span class="material-icons-round ${getIconClass("deseado")}">favorite</span>
            </a>
            <a class="lista-btn flex items-center justify-center p-3 cursor-pointer rounded-xl hover:bg-white/10 transition-all duration-200" data-status="acabado" title="Acabado">
                <span class="material-icons-round ${getIconClass("acabado")}">emoji_events</span>
            </a>
            <a class="lista-btn flex items-center justify-center p-3 cursor-pointer rounded-xl hover:bg-white/10 transition-all duration-200" data-status="abandonado" title="Abandonado">
                <span class="material-icons-round ${getIconClass("abandonado")}">close</span>
            </a>
        </section>`
                : ""
        }
    </div>`;

        if (loggedIn) {
            card.querySelectorAll(".lista-btn").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const status = btn.dataset.status;
                    const section = btn.closest("section");
                    const game_id = section.dataset.gameId;
                    const icon = btn.querySelector("span");
                    try {
                        const resp = await fetch(`${API_URL}/games/lista`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ game_id, status }),
                        });

                        const result = await resp.json();

                        if (resp.ok) {
                            section.querySelectorAll("span").forEach((s) => {
                                Object.values(colorMap).forEach((cls) =>
                                    s.classList.remove(cls),
                                );
                                s.classList.add("text-white/40");
                            });

                            if (
                                result.action === "added" ||
                                result.action === "updated"
                            ) {
                                icon.classList.remove("text-white/40");
                                icon.classList.add(colorMap[status]);
                            }

                            if (status === "acabado") {
                                actualizarProgresoVisual();
                            }

                            cargarListaActual();
                        }
                    } catch (err) {
                        await registrarLog(
                            "ERROR",
                            `Error al actualizar lista: ${err.message}`,
                        );
                    }
                });
            });
        }

        return card;
    }
    async function cargarListaActual() {
        const activeBtn = document.querySelector(
            "#listas-perfil a.bg-gray-100, #listas-perfil a.dark\\:bg-gray-800",
        );
        if (!activeBtn) return;
        activeBtn.click();
    }
    btnSearch.addEventListener("click", applyFilters);
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyFilters();
    });
    btnReset.addEventListener("click", (e) => {
        e.preventDefault();
        searchInput.value = "";
        filterGenre.value = "Genero";
        filterPlatform.value = "Platform";
        filterRating.value = "Rating";
        activeFilters = { texto: "", genero: "", plataforma: "", rating: null };
        fetchGames(1, activeFilters);
    });

    navEventoMobile.addEventListener("click", () => {
        document.getElementById("game-detail").classList.add("hidden");
        sectionDescubrir.classList.add("hidden");
        seccionPerfil.classList.add("hidden");
        sectionEventos.classList.remove("hidden");
        loadIGDBEvents();
    });

    btnEventos.addEventListener("click", () => {
        document.getElementById("game-detail").classList.add("hidden");
        sectionDescubrir.classList.add("hidden");
        seccionPerfil.classList.add("hidden");
        sectionEventos.classList.remove("hidden");
        loadIGDBEvents();
    });

    async function loadIGDBEvents() {
        const container = document.getElementById("eventos-container");
        try {
            const respuesta = await fetch(`${API_URL}/events`, {
                method: "POST",
                credentials: "include",
            });
            const events = await respuesta.json();
            renderEventCards(events);
        } catch (error) {
            container.innerHTML = `<div class="text-red-500">Error: ${error.message}</div>`;
        }
    }

    function renderEventCards(events) {
        const container = document.getElementById("eventos-container");
        container.innerHTML = "";
        events.forEach((event) => {
            const date = new Date(event.start_time * 1000).toLocaleDateString();
            const imgUrl = event.event_logo?.url
                ? `https:${event.event_logo.url.replace("t_thumb", "t_cover_big")}`
                : "assets/default/default-event-image.png";

            const card = document.createElement("div");
            card.className =
                "bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 transition-transform hover:scale-[1.02] cursor-pointer";
            card.innerHTML = `
            <img src="${imgUrl}" class="w-full h-48 object-cover" alt="${event.name}">
            <div class="p-6">
                <span class="text-xs font-bold text-primary uppercase tracking-wider">${date}</span>
                <h3 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">${event.name}</h3>
                <p class="text-gray-600 dark:text-gray-400 mt-3 text-sm line-clamp-3">
                    ${event.description || "No hay detalles adicionales para este evento."}
                </p>
            </div>`;
            card.addEventListener("click", () => mostrarDetalleEvento(event));
            container.appendChild(card);
        });
    }

    // ─── LISTAS PERFIL ────────────────────────────────────────────────────────
    const listasBtns = document.querySelectorAll("#listas-perfil a");
    const listasGamesContainer = document.getElementById("listas-games");

    listasBtns.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();

            listasBtns.forEach((b) =>
                b.classList.remove("bg-gray-100", "dark:bg-gray-800"),
            );
            btn.classList.add("bg-gray-100", "dark:bg-gray-800");

            const statusMap = {
                bookmark: "jugando",
                favorite: "deseado",
                emoji_events: "acabado",
                close: "abandonado",
            };

            const iconName = btn.querySelector("span")?.textContent?.trim();
            const status = statusMap[iconName];
            if (!status) return;

            listasGamesContainer.innerHTML = `
            <p class="text-gray-500 animate-pulse p-4">Cargando juegos...</p>
        `;

            try {
                const resp = await fetch(`${API_URL}/games/lista/${status}`, {
                    credentials: "include",
                });

                const result = await resp.json();
                listasGamesContainer.innerHTML = "";

                if (!result.ok || result.games.length === 0) {
                    listasGamesContainer.innerHTML = `
                    <p class="text-gray-400 text-sm p-4 text-center">No tienes juegos en esta lista.</p>
                `;
                    return;
                }

                const grid = document.createElement("div");
                grid.className =
                    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2  lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-4 w-full";

                result.games.forEach((game) => {
                    const card = createGameCard({
                        name: game.name,
                        genres: game.genres,
                        rating: game.rating ?? "N/A",
                        company: game.company,
                        coverImage: game.cover,
                        coverAlt: game.name,
                        game_mode: game.game_modes,
                        game_id: game.id,
                        userStatus: game.user_status,
                        summary: game.summary,
                        platforms: game.platforms,
                    });

                    card.addEventListener("click", (ev) => {
                        if (ev.target.closest(".lista-btn")) return;

                        mostrarDetalleJuego({
                            name: game.name,
                            genres: game.genres,
                            rating: game.rating ?? "N/A",
                            company: game.company,
                            cover: game.cover,
                            game_modes: game.game_modes,
                            summary: game.summary,
                            platforms: game.platforms,
                        });
                    });

                    grid.appendChild(card);
                });

                listasGamesContainer.appendChild(grid);
            } catch (err) {
                listasGamesContainer.innerHTML = `
                <p class="text-red-400 text-sm p-4">Error: ${err.message}</p>
            `;
            }
        });
    });

    fetchGames(1);
});

async function actualizarProgresoVisual() {
    try {
        const res = await fetch(`${API_URL}/games/progreso?t=${Date.now()}`, {
            method: "GET",
            credentials: "include",
        });

        if (res.status === 401) return;

        const data = await res.json();

        if (data.ok) {
            const porcentaje = (data.xpBarra / data.xpMax) * 100;
            const fill = document.getElementById("xp-bar-fill");
            const nivelTxt = document.getElementById("user-level");
            const xpDetalle = document.getElementById("xp-text");

            if (fill) fill.style.width = `${porcentaje}%`;
            if (nivelTxt) nivelTxt.innerText = `Nivel ${data.nivel}`;
            if (xpDetalle)
                xpDetalle.innerText = `${data.xpBarra} / ${data.xpMax} XP`;
        }
    } catch (err) {
        await registrarLog(
            "ERROR",
            `Error al actualizar la barra: ${err.message}`,
        );
    }
}

document
    .getElementById("delete-Acount")
    .addEventListener("click", eliminarCuenta);
async function eliminarCuenta() {
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará tu cuenta PERMANENTEMENTE y no podrás recuperarla.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar mi cuenta",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/delete`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok) {
            const errorText = await response.text();
            await Swal.fire("Error", "No se pudo eliminar la cuenta", "error");
            return;
        }

        const data = await response.json();
        await Swal.fire("¡Eliminada!", data.mensaje, "success");

        sessionStorage.clear();
        window.location.href = "index.html";
    } catch (error) {
        await registrarLog("ERROR", `Error en fetch:: ${err.message}`);
        await Swal.fire("Error", "Error de conexión", "error");
    }
}
