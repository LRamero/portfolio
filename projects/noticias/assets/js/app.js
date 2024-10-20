(function($, document, window){
	
	$(document).ready(function(){

		// Cloning main navigation for mobile menu
		$(".mobile-navigation").append($(".main-navigation .menu").clone());

		// Mobile menu toggle 
		$(".menu-toggle").click(function(){
			$(".mobile-navigation").slideToggle();
		});

		var map = $(".map");
		var latitude = map.data("latitude");
		var longitude = map.data("longitude");
		if( map.length ){
			
			map.gmap3({
				map:{
					options:{
						center: [latitude,longitude],
						zoom: 15,
						scrollwheel: false
					}
				},
				marker:{
					latLng: [latitude,longitude],
				}
			});
			
		}
	
        $('#climaForm').submit(function(event) {
            event.preventDefault();  // Evita el envío normal del formulario

            const ciudad = $('#ciudad').val();  // Obtiene el valor del campo de texto

            // Envío de la solicitud POST utilizando jQuery
            $.ajax({
                url: '/get_weather',
                type: 'POST',
                data: { ciudad: ciudad },
                success: function(data) {
                    if (data) {
                        $('#climaResultado').html(`
                            <h3>Clima en ${ciudad}</h3>
                            <p>Temperatura: ${data.current.temp}°C</p>
                            <p>Descripción: ${data.current.feels_like}°C</p>
                            <p>Presión: ${data.current.pressure} hPa</p>
                            <p>Humedad: ${data.current.humidity}%</p>
                        `);
                    } else {
                        alert("No se encontró información del clima para esa ciudad.");
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    alert("Ocurrió un error al obtener el clima.");
                }
            });
        });

        $('#ciudad').on('input', function() {
            const query = $(this).val();
            if (query.length > 2) {
                $.ajax({
                    url: '/get_suggestions',
                    type: 'POST',
                    data: { ciudad: query },
                    success: function(data) {
                        const suggestions = data.map(item => {
                            return `<li class="suggestion-item" data-city="${item.display_name}">
                                        ${item.display_name}
                                    </li>`;
                        }).join('');
                        $('#suggestions').html(suggestions).show();
                    }
                });
            } else {
                $('#suggestions').hide();
            }
        });

        $(document).on('click', '.suggestion-item', function() {
            const city = $(this).data('city');
            $('#ciudad').val(city);
            $('#suggestions').hide();
        });
    
        // Cerrar sugerencias si se hace clic fuera
        $(document).click(function(e) {
            if (!$(e.target).closest('#ciudad, #suggestions').length) {
                $('#suggestions').hide();
            }
        });

        $(window).on("scroll", function() {
            var scrollThreshold = window.innerHeight * 0.02;
            if ($(window).scrollTop() > scrollThreshold) {
                $('.site-header').addClass('shrink');
            } else {
                $('.site-header').removeClass('shrink');
            }
        });

        $(window).on("resize", function() {
            scrollThreshold = window.innerHeight * 0.10;
        });
        
    });

	$(window).load(function(){

	});

})(jQuery, document, window);