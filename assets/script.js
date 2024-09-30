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
        '.titulo-de-proyectos, .tarjeta-de-proyectos, .contenedor-de-proyectos, .exp-prof, .timeline-item, .timeline-item .content, .timeline, .redes, .txt-cv, .detalle-de-proyectos, .snap-container, .scroll-right, .scroll-left, .encabezado'
    );

    // Agrega o quita la clase 'dark-mode' a cada uno
    elementsToToggle.forEach(el => el.classList.toggle('dark-mode'));

    // Recalcular el degradado dinámico en todos los items
    timelineItems.forEach(item => {
        resetCardStyle(item);
    });
});
