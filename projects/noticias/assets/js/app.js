(function($, document, window){

    function getWindDirection(deg) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    }

    // Formato de fecha.
    function formatDate(dt) {
        var date = new Date(dt * 1000);
        var options = { weekday: 'long', month: 'short', day: 'numeric' };
        return date.toLocaleDateString("en-US", options);
    }
	
	$(document).ready(function(){

		// Cloning main navigation for mobile menu
		$(".mobile-navigation").append($(".main-navigation .menu").clone());

		// Mobile menu toggle 
		$(".menu-toggle").click(function(){
			$(".mobile-navigation").slideToggle();
		});
	
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
                        $('.forecast-container').empty();
                        data.daily.forEach(function (forecast) {
                            var formattedDate = formatDate(forecast.dt);
                            var dayOfWeek = formattedDate.split(", ")[0];
                            var date = formattedDate.split(", ")[1];
                            var iconCode = forecast.weather[0].icon;
                            var popPercentage = (forecast.pop * 100.0) + '%';
                            var windSpeed = Math.round(forecast.wind_speed) + ' km/h';
                            var windDirection = getWindDirection(forecast.wind_deg);

                            // Estructura HTML de cada tarjeta
                            var cardHtml = `
                                <div class="forecast">
                                    <div class="forecast-header">
                                        <div class="day">${dayOfWeek}</div>
                                        <div class="date">${date}</div>
                                    </div>
                                    <div class="forecast-content">
                                        <div class="location">${ciudad}</div>
                                        <div class="degree">
                                            <div class="num">${Math.round(forecast.temp.day)}<sup>o</sup>C</div>
                                            <div class="forecast-icon">
                                                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${forecast.weather[0].description}" width="90">
                                            </div>
                                        </div>
                                        <span><img src="noticias/assets/images/icon-umberella.png" alt="">${popPercentage}</span>
                                        <span><img src="noticias/assets/images/icon-wind.png" alt="">${windSpeed}</span>
                                        <span><img src="noticias/assets/images/icon-compass.png" alt="">${windDirection}</span>
                                    </div>
                                </div>
                            `;

                            // Agregar la tarjeta a la estructura del contenedor
                            $('.forecast-container').append(cardHtml);
                        });
                    } else {
                        alert("No se encontró información del clima para esa ciudad.");
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    alert("Ocurrió un error al obtener el clima.");
                }
            });

            // Obtener noticias
            $.ajax({
                url: '/get_news_loc',
                type: 'POST',
                data: { ciudad: ciudad },
                success: function (data) {
                    if (data.error) {
                        alert("Ocurrió un error al obtener las noticias.");
                        return;
                    }

                    // Mostrar noticias de la ciudad
                    const noticiasCiudad = data.ciudad.articles.map(article => {
                        return `
                            <div class="card">
                                <h5>${article.title}</h5>
                                <p>${article.summary}</p>
                                <a href="${article.url}" target="_blank">Leer más</a>
                            </div>
                        `;
                    }).slice(0, 5).join('');
                    $('#noticiasCiudad').html(noticiasCiudad);

                    // Mostrar noticias del país
                    const noticiasPais = data.pais.articles.map(article => {
                        return `
                            <div class="card">
                                <h5>${article.title}</h5>
                                <p>${article.summary}</p>
                                <a href="${article.url}" target="_blank">Leer más</a>
                            </div>
                        `;
                    }).slice(0, 5).join('');
                    $('#noticiasPais').html(noticiasPais);
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                    alert("Ocurrió un error al obtener las noticias.");
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