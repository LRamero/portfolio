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

const timelineItems = document.querySelectorAll('.timeline-item .content');

timelineItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
        item.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease-out';
        const rect = item.getBoundingClientRect();   // Obtener el tamaño y posición de la tarjeta
        const x = e.clientX - rect.left;             // Coordenada X del mouse dentro de la tarjeta
        const y = e.clientY - rect.top;              // Coordenada Y del mouse dentro de la tarjeta
        const centerX = rect.width/2;
        const centerY = rect.height/2;
        const rotateX = (y - centerY)/10;          // Inclinación en el eje X
        const rotateY = (centerX - x)/10;          // Inclinación en el eje Y

        item.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Calcular el desplazamiento de la sombra según la inclinación
        const shadowX = (centerX + x)/10;
        const shadowY = (y + centerY)/10;

        // Aplicar la sombra dinámica
        item.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.5)`;

        // Calcula el ángulo en radianes
        let radians = Math.atan2((centerY - y)/rect.height, (centerX - x)/rect.width);

        // Convierte a grados
        let degrees = radians * (180 / Math.PI);

        // Ajustar el degradado según la posición del mouse
        item.style.background = `linear-gradient(${degrees}deg, #0b243c5e, #8491a962)`;
    });

    // Restaurar la posición de la tarjeta y la sombra cuando el mouse salga
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'rotateX(0) rotateY(0)';
        item.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.3)';
        item.style.background = '#86a4e694;';
        item.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease-out';
    });
});