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

function startSecondApp(projectName) {
    fetch('/start_second_app', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectName: projectName })
    })
    .then(response => response.text())
    .then(data => {
        // Open a new window and render the HTML page from the second app
        window.open('http://localhost:5001/', '_blank');
    });
}