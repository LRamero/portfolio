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
			if ($win.scrollTop() > 200) {
				$('.js-top').addClass('active');
			} else {
				$('.js-top').removeClass('active');
			}

		});
	
	};

	var pieChart = function() {
		$('.chart').easyPieChart({
			scaleColor: false,
			lineWidth: 4,
			lineCap: 'butt',
			barColor: '#FF9000',
			trackColor:	"#f5f5f5",
			size: 160,
			animate: 1000
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
		$('.mode-toggle').on('click', function(event){

			// Selecciona todos los elementos que necesitan cambiar su modo
			const elementsToToggle = document.querySelectorAll(
				'.overlay, .mode-toggle, .sun, .moon, #fh5co-about, .fh5co-about, body, .gototop, h1, h2, h3, h4, h5, h6, figure'
			);

			// Agrega o quita la clase 'dark-mode' a cada uno
			elementsToToggle.forEach(el => el.classList.toggle('dark-mode'));

			// Recalcular el degradado dinámico en todos los items
			/*timelineItems.forEach(item => {
				resetCardStyle(item);
			});*/
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
				'.overlay, .mode-toggle, .sun, .moon, #fh5co-about, .fh5co-about, body, .gototop, h1, h2, h3, h4, h5, h6, figure'
			);

			// Agrega o quita la clase 'dark-mode' a cada uno
			elementsToToggle.forEach(el => el.classList.toggle('dark-mode'));
		}
		changeDark();
		contentWayPoint();
		goToTop();
		loaderPage();
		fullHeight();
		parallax();
		pieChart();
		skillsWayPoint();
	});
}());