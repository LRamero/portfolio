const proyectosContainer = document.querySelector('.contenedor-de-proyectos');
const scrollLeft = document.querySelector('.scroll-left');
const scrollRight = document.querySelector('.scroll-right');

let projectCards = document.querySelectorAll('.tarjeta-de-proyectos');

let initialScrollSpeed = 3; // Velocidad de scroll inicial
let fastScrollSpeed = 10; // Velocidad de scroll rápida
let currentScrollSpeed = initialScrollSpeed;
let scrollIntervalId = null; // Variable para almacenar el ID del intervalo actual

// Duplicar los elementos del carrusel para crear un efecto continuo
const proyectos = Array.from(proyectosContainer.children);
proyectos.forEach(project => {
    const clone = project.cloneNode(true);
    proyectosContainer.appendChild(clone);
    projectCards = document.querySelectorAll('.tarjeta-de-proyectos');
});

// Función para desplazar el carrusel automáticamente
function autoScroll() {
    proyectosContainer.scrollLeft += currentScrollSpeed;
    if (proyectosContainer.scrollLeft >= proyectosContainer.scrollWidth / 2) {
        proyectosContainer.scrollLeft = 0;
    } else if (proyectosContainer.scrollLeft <= 0) {
        proyectosContainer.scrollLeft = proyectosContainer.scrollWidth / 2;
    }
}

// Iniciar desplazamiento automático
function startAutoScroll() {
    if (scrollIntervalId !== null) {
        clearInterval(scrollIntervalId);
    }
    scrollIntervalId = setInterval(autoScroll, 16);
}

startAutoScroll();

// Función para ajustar la velocidad del carrusel
function adjustScrollSpeed(speed) {
    clearInterval(scrollIntervalId);
    currentScrollSpeed = speed;
    startAutoScroll();
}

// Eventos para aumentar y restablecer la velocidad del carrusel
scrollLeft.addEventListener('mouseover', () => adjustScrollSpeed(-fastScrollSpeed));
scrollLeft.addEventListener('mouseout', () => adjustScrollSpeed(initialScrollSpeed));

scrollRight.addEventListener('mouseover', () => adjustScrollSpeed(fastScrollSpeed));
scrollRight.addEventListener('mouseout', () => adjustScrollSpeed(initialScrollSpeed));

// Eventos para pausar y reanudar el carrusel al hover sobre las tarjetas de proyecto
projectCards.forEach(card => {
    card.addEventListener('mouseover', () => {
        clearInterval(scrollIntervalId);
    });
    card.addEventListener('mouseout', () => {
        startAutoScroll();
    });
});

// Función para aplicar el degradado dinámico
function applyGradient(item, e) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    item.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, scale 0.3s ease';
    const rect = item.getBoundingClientRect();   // Obtener el tamaño y posición de la tarjeta
    const x = e.clientX - rect.left;             // Coordenada X del mouse dentro de la tarjeta
    const y = e.clientY - rect.top;              // Coordenada Y del mouse dentro de la tarjeta
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRotation = 20;
    const rotationX = (x / rect.height) * maxRotation;
    const rotationY = (y / rect.width) * -maxRotation;

    item.style.transform = `rotate3d(${rotationX}, ${rotationY}, 0, ${maxRotation}deg) scale(1.05)`;

    // Calcular el desplazamiento de la sombra según la inclinación
    const shadowX = (x - centerX) / 10;
    const shadowY = (y - centerY) / 10;

    // Aplicar la sombra dinámica
    const shadowColor = isDarkMode ? 'var(--shadow-dark)' : 'var(--shadow-light)';
    item.style.boxShadow = `${shadowX}px ${shadowY}px 15px ${shadowColor}`;

    // Calcula el ángulo en radianes
    let radians = Math.atan2((y - centerY), (x - centerX));

    // Convierte a grados
    let degrees = radians * (180 / Math.PI);

    // Ajustar el degradado según la posición del mouse
    let lightColor1 = 'rgba(79, 101, 126, 0.7)';
    let lightColor2 = 'rgba(79, 101, 126, 0.2)';
    let darkColor1 = 'rgba(0, 230, 119, 0.1)';
    let darkColor2 = 'rgba(0, 230, 119, 0.4)';
    const gradientColor1 = isDarkMode ? darkColor1 : lightColor1;
    const gradientColor2 = isDarkMode ? darkColor2 : lightColor2;
    item.style.background = `linear-gradient(${degrees}deg, ${gradientColor1}, ${gradientColor2})`;
}

// Función para restablecer el estilo de la tarjeta al salir del hover
function resetCardStyle(item) {
    let lightColor = 'rgba(79, 101, 126, 0.4)';
    let darkColor = 'rgba(0, 230, 119, 0.1)';
    const isDarkMode = document.body.classList.contains('dark-mode');
    item.style.transform = 'rotateX(0) rotateY(0) scale(1)';
    const shadowColor = isDarkMode ? 'var(--shadow-dark)' : 'var(--shadow-light)';
    item.style.boxShadow = `0px 0px 10px ${shadowColor}`;
    item.style.background = isDarkMode ? darkColor : lightColor;
    item.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease-out, scale 0.5s ease-out';
}

const timelineItems = document.querySelectorAll('.timeline-item .content');

timelineItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
        applyGradient(item, e);
    });

    // Restaurar la posición de la tarjeta y la sombra cuando el mouse salga
    item.addEventListener('mouseleave', () => {
        resetCardStyle(item);
    });
});

// Seleccionamos el botón y el body
const toggleModeBtn = document.getElementById('toggle-mode');
const body = document.body;

// Evento para cambiar entre el modo claro y el modo oscuro
toggleModeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Selecciona todos los elementos que necesitan cambiar su modo
    const elementsToToggle = document.querySelectorAll(
        '.titulo-de-proyectos, .tarjeta-de-proyectos, .contenedor-de-proyectos, .exp-prof, .timeline-item, .timeline-item .content, .timeline, .redes, .txt-cv, .detalle-de-proyectos, .snap-container, .scroll-right, .scroll-left, .encabezado, .mensaje-bienvenida'
    );

    // Agrega o quita la clase 'dark-mode' a cada uno
    elementsToToggle.forEach(el => el.classList.toggle('dark-mode'));

    // Recalcular el degradado dinámico en todos los items
    timelineItems.forEach(item => {
        resetCardStyle(item);
    });
});

// Configuración del IntersectionObserver para detectar cuando los elementos son visibles
function crearObservadorParaCambioDeFuente() {
    const opcionesObserver = {
        root: null, // El viewport es la raíz
        threshold: 0.1 // El 10% del elemento debe ser visible para activar el observer
    };

    const observer = new IntersectionObserver((entradas, observer) => {
        entradas.forEach(entrada => {
            const elemento = entrada.target;

            if (entrada.isIntersecting) {
                // El elemento es visible, cambiar la fuente
                cambiarFuenteAleatorioConEfecto(elemento);
            } else {
                // El elemento ya no es visible, restablecer fuente
                restablecerFuente(elemento);
            }
        });
    }, opcionesObserver);

    // Seleccionamos todos los elementos a observar
    const elementos = document.querySelectorAll('.proyectos h3, .mensaje-bienvenida, .detalle-de-proyectos, .presentacion h2, .presentacion h3, .content h3, .content h4, .content p, .titulo-de-proyectos');
    elementos.forEach(elemento => observer.observe(elemento));
}

// Función para barajar los índices (sin cambios)
function barajarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para cambiar la fuente de cada letra a modo programación
function cambiarFuenteAleatorioConEfecto(element) {
    const texto = element.innerText;
    const length = texto.length; // Longitud del texto

    const indices = Array.from(Array(length).keys()); // Crea un array de índices
    const indicesBarajados = barajarArray(indices); // Baraja los índices

    // Añadir el retraso de 1 segundo antes de comenzar a cambiar las letras
    setTimeout(() => {
        element.innerHTML = ''; // Vacía el contenido
        for (let i = 0; i < length; i++) {
            const letra = document.createElement('span');
            letra.innerText = texto[i];
            letra.style.transition = 'font-family 0.2s ease';
            element.appendChild(letra);
        }

        // Calcular el tiempo total para el cambio de todas las letras
        const totalDuration = 1500; // Duración total en milisegundos (1 segundo)
        const delayPerLetter = totalDuration / length; // Retraso por letra

        // Aplicar el cambio de fuente a cada letra en orden aleatorio
        indicesBarajados.forEach((index, i) => {
            setTimeout(() => {
                // Cambia siempre a "Courier New", monospace (modo programación)
                element.children[index].style.fontFamily = '"Courier New", monospace';
                element.classList.add('programming-font');
            }, i * delayPerLetter); // Cambia la letra con un retraso calculado
        });
    }, 400); // Retraso de 1 segundo antes de comenzar a cambiar las letras
}

// Función para restablecer la fuente original
function restablecerFuente(element) {
    const texto = element.innerText;
    element.innerHTML = ''; // Vacía el contenido

    // Restauramos el texto original
    for (let i = 0; i < texto.length; i++) {
        const letra = document.createElement('span');
        letra.innerText = texto[i];
        letra.style.fontFamily = '"Dancing Script", cursive'; // Vuelve al estilo original
        element.appendChild(letra);
    }
}

window.addEventListener('load', () => {
    crearObservadorParaCambioDeFuente();
    const presentacion = document.querySelector(".presentacion");
    const snapContainer = document.querySelector(".snap-container");
    const h2 = presentacion.querySelector("h2");
    const h3 = presentacion.querySelector("h3");
    const mensajeBienvenida = document.getElementById("mensaje-bienvenida");

    setTimeout(() => {
        presentacion.classList.add("visible");
    }, 150);

    setTimeout(() => {
        presentacion.style.height = "20vh";
        h2.style.fontSize = "5vh";
        h2.style.transform = "translateY(-73vh)";
        h3.style.fontSize = "4vh";
        h3.style.transform = "translateY(-76vh)";
        snapContainer.style.height = "80vh";
        mensajeBienvenida.style.fontSize = "0";
    }, 3000);
});