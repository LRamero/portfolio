;(function () {
	
	'use strict';

	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
			BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
			iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
			Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
			Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
			any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	
	var fullHeight = function() {

		if ( !isMobile.any() ) {
			$('.js-fullheight').css('height', $(window).height());
			$(window).resize(function(){
				$('.js-fullheight').css('height', $(window).height());
			});
		}
	};

	// Parallax
	var parallax = function() {
		$(window).stellar();
	};

	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated-fast') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn animated-fast');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated-fast');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight animated-fast');
							} else {
								el.addClass('fadeInUp animated-fast');
							}

							el.removeClass('item-animate');
						},  k * 100, 'easeInOutExpo' );
					});
					
				}, 50);
				
			}

		} , { offset: '85%' } );
	};



	var goToTop = function() {

		$('.js-gotop').on('click', function(event){
			
			event.preventDefault();

			$('html, body').animate({
				scrollTop: $('html').offset().top
			}, 500, 'easeInOutExpo');
			
			return false;
		});

		$(window).scroll(function(){

			var $win = $(window);

			// Controla el botón "Go to Top"
			if ($win.scrollTop() > 200) {
				$('.js-top').addClass('active');
			} else {
				$('.js-top').removeClass('active');
			}

			// Controla el checkbox del menú
			if ($win.scrollTop() > 200) {
				$('label[for="menu_checkbox"]').addClass('active');
			} else {
				$('label[for="menu_checkbox"]').removeClass('active');
			}

		});	
	};

	// Nueva función para detectar si está en modo oscuro
	var isDarkModeEnabled = function() {
		return document.body.classList.contains('dark-mode');
	};

	// Modificar función pieChart para cambiar el color dinámicamente
	var pieChart = function() {
		$('.chart').each(function() {
			$(this).easyPieChart({
				scaleColor: false,
				lineWidth: 4,
				lineCap: 'butt',
				barColor: isDarkModeEnabled() ? '#00bd5e' : '#FF9000', // Cambia el color según el modo
				trackColor: '#88888833',
				size: 160,
				animate: 1000
			});
		});
	};

	var updatePieChartColor = function() {
		$('.chart').each(function() {
	
			// Acceder a la instancia de easyPieChart
			var chartInstance = $(this).data('easyPieChart');
			var currentPercentage = $(this).data('percent');
	
			// Actualizar el barColor y redibujar
			chartInstance.options.barColor = isDarkModeEnabled() ? '#00bd5e' : '#FF9000';
			chartInstance.update(currentPercentage); // Redibuja el gráfico con los nuevos colores
		});
	};

	var skillsWayPoint = function() {
		if ($('#fh5co-skills').length > 0 ) {
			$('#fh5co-skills').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					setTimeout( pieChart , 400);					
					$(this.element).addClass('animated');
				}
			} , { offset: '90%' } );
		}

	};

	// Loading page
	var loaderPage = function() {
		$(".fh5co-loader").fadeOut("slow");
	};

	var changeDark = function() {
	// Evento para cambiar entre el modo claro y el modo oscuro
		$('.mode-toggle').on('click', function(){

			// Selecciona todos los elementos que necesitan cambiar su modo
			const elementsToToggle = document.querySelectorAll(
				'.mode-toggle, .sun, .moon, body'
			);

			// Agrega o quita la clase 'dark-mode' a cada uno
			elementsToToggle.forEach(el => el.classList.toggle('dark-mode'));
			updatePieChartColor();
		});
	};

	function detectSystemTheme() {
		const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
		return prefersDarkScheme ? 'dark' : 'light';
	}
	
	$(function(){
		if (detectSystemTheme() === 'dark'){
			// Selecciona todos los elementos que necesitan cambiar su modo
			const elementsToToggle = document.querySelectorAll(
				'.mode-toggle, .sun, .moon, body'
			);

			// Agrega o quita la clase 'dark-mode' a cada uno
			elementsToToggle.forEach(el => el.classList.toggle('dark-mode'));
		}
		pieChart();
		changeDark();
		contentWayPoint();
		goToTop();
		loaderPage();
		fullHeight();
		parallax();
		skillsWayPoint();
	});
}());

$(document).ready(function () {
	// Mostrar u ocultar el menú al hacer clic en el botón
	$('#menu_checkbox').on('change', function () {
		if ($(this).is(':checked')) {
			$('#menu_flotante').fadeIn();
		} else {
			$('#menu_flotante').fadeOut();
		}
	});

	// Navegación suave entre secciones
	$('#menu_flotante a').on('click', function (event) {
		event.preventDefault(); // Evitar el comportamiento predeterminado
		var target = $(this).attr('href'); // Obtener el id de la sección
		$('html, body').animate({
			scrollTop: $(target).offset().top
		}, 500, 'easeInOutExpo');
	});
});