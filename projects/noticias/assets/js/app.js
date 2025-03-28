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

        function translateText(text, callback) {
            $.ajax({
                url: '/get_translate',
                type: 'POST',
                data: { texto: text },
                success: function (response) {
                    if (response.translated_text) {
                        callback(response.translated_text);
                    } else {
                        callback(text);  // Si hay error, usa el texto original
                    }
                },
                error: function () {
                    console.error('Error al traducir el texto');
                    callback(text);  // Si hay error, usa el texto original
                }
            });
        }
	
        $('#climaForm').submit(function(event) {
            event.preventDefault();  // Evita el envío normal del formulario
            $('#loadingOverlay').show();

            const ciudad = $('#ciudad').val();  // Obtiene el valor del campo de texto

            $.ajax({
                url: '/get_weather',
                type: 'POST',
                data: { ciudad: ciudad },
                success: function (data) {
                    if (data) {
                        $('.forecast-container').empty();

                        // Crear la estructura de la grilla principal
                        var mainHtml = `
                            <div class="row">
                                <div class="col-xl-4 col-lg-4 col-md-4 px-2">
                                    <div class="forecast today">
                                    </div>
                                </div>
                                <div class="col-xl-8 col-lg-8 col-md-8">
                                    <div class="row forecast-grid">
                                    </div>
                                </div>
                            </div>
                        `;
                        $('.forecast-container').append(mainHtml);

                        // Crear la tarjeta grande (primer día)
                        var firstForecast = data.daily[0];
                        var formattedDate = formatDate(firstForecast.dt);
                        var dayOfWeek = formattedDate.split(", ")[0];
                        var date = formattedDate.split(", ")[1];
                        var iconCode = firstForecast.weather[0].icon;
                        var todayIconPrefix = iconCode.substring(0, 2);
                        var popPercentage = Math.round(firstForecast.pop * 100.0) + '%';
                        var windSpeed = firstForecast.wind_speed + ' km/h';
                        var windDirection = getWindDirection(firstForecast.wind_deg);
                        var summary = firstForecast.summary;
                        var rainHtml = firstForecast.rain !== undefined ? `<span><img src="noticias/assets/images/icon-umberella.png" alt="">${popPercentage} ${firstForecast.rain} mm</span>` : `<span><img src="noticias/assets/images/icon-umberella.png" alt="">${popPercentage}</span>`;

                        // Traducción de dayOfWeek y summary
                        translateText(dayOfWeek, function (translatedDay) {
                            translateText(summary, function (translatedSummary) {
                                var firstDayHtml = `
                                    <div class="forecast-header big">
                                        <div class="day">${translatedDay}</div>
                                        <div class="date">${date}</div>
                                    </div>
                                    <div class="forecast-content big">
                                        <div class="location">${ciudad}</div>
                                        <div class="degree">
                                            <div class="num">${Math.round(firstForecast.temp.day)}<sup>o</sup>C</div>
                                            <div class="forecast-icon">
                                                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${firstForecast.weather[0].description}" width="90">
                                            </div>
                                        </div>
                                        ${rainHtml}
                                        <span><img src="noticias/assets/images/icon-wind.png" alt="">${windSpeed}</span>
                                        <span><img src="noticias/assets/images/icon-compass.png" alt="">${windDirection}</span>
                                        <div class="summary">${translatedSummary}</div>
                                    </div>
                                `;
                                $('.forecast.today').html(firstDayHtml);
                            });
                        });

                        var cardsHtml = new Array(data.daily.slice(1, 7).length); // Array para mantener las tarjetas en orden
                        var translationsRemaining = data.daily.slice(1, 7).length; // Contar cuántas traducciones quedan

                        data.daily.slice(1, 7).forEach(function (forecast, index) {
                            var formattedDate = formatDate(forecast.dt);
                            var dayOfWeek = formattedDate.split(", ")[0];
                            var date = formattedDate.split(", ")[1];
                            var iconCode = forecast.weather[0].icon;
                            var popPercentage = Math.round(forecast.pop * 100.0) + '%';
                            var windSpeed = forecast.wind_speed + ' km/h';
                            var windDirection = getWindDirection(forecast.wind_deg);
                            var summary = forecast.summary;
                            var rainHtml = forecast.rain !== undefined ? `<span><img src="noticias/assets/images/icon-umberella.png" alt="">${popPercentage} ${forecast.rain} mm</span>` : `<span><img src="noticias/assets/images/icon-umberella.png" alt="">${popPercentage}</span>`;

                            // Traducción de dayOfWeek y summary
                            translateText(dayOfWeek, function (translatedDay) {
                                translateText(summary, function (translatedSummary) {
                                    // Crear el HTML de la tarjeta
                                    var cardHtml = `
                                        <div class="col-4 px-1">
                                            <div class="forecast">
                                                <div class="forecast-header small">
                                                    <div class="day">${translatedDay}</div>
                                                    <div class="date">${date}</div>
                                                </div>
                                                <div class="forecast-content small">
                                                    <div class="degree">
                                                        <div class="num">${Math.round(forecast.temp.day)}<sup>o</sup>C</div>
                                                        <div class="forecast-icon">
                                                            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${forecast.weather[0].description}" width="50">
                                                        </div>
                                                    </div>
                                                    ${rainHtml}
                                                    <span><img src="noticias/assets/images/icon-wind.png" alt="">${windSpeed}</span>
                                                    <span><img src="noticias/assets/images/icon-compass.png" alt="">${windDirection}</span>
                                                    <div class="summary">${translatedSummary}</div>
                                                </div>
                                            </div>
                                        </div>
                                    `;

                                    // Almacenar la tarjeta en su posición correspondiente
                                    cardsHtml[index] = cardHtml;

                                    // Verificar si se han completado todas las traducciones
                                    translationsRemaining--;
                                    if (translationsRemaining === 0) {
                                        // Agregar todas las tarjetas al DOM en orden
                                        $('.forecast-grid').append(cardsHtml.join(''));
                                        $('#loadingOverlay').hide();
                                    }
                                });
                            });
                        });

                        $('.hero').css('background-image', `url('noticias/assets/images/${todayIconPrefix}.jpg')`);

                    } else {
                        alert("No se encontró información del clima para esa ciudad.");
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                }
            });

            // Obtener noticias
            $.ajax({
                url: '/get_news_loc',
                type: 'POST',
                data: { query: ciudad, tipo: 'ciudad' },
                success: function (data) {
                    if (data.error) {
                        alert("Ocurrió un error al obtener las noticias.");
                        return;
                    }

                    const maxArticulos = Math.min(data.length, 25);

                    // Mostrar noticias como tarjetas
                    const noticiasCiudad = data.map(article => {
                        return `
                            <div>
                                <div class="card">
                                    <img src="${article.socialimage}" alt="Imagen de la noticia" class="card-img">
                                    <h5>${article.title}</h5>
                                    <a href="${article.url}" target="_blank">Leer más</a>
                                </div>
                            </div>
                        `;
                    }).slice(0, maxArticulos).join('');

                    const $noticiasCiudad = $('#noticiasCiudad');

                    // Destruir el carrusel existente si ya está inicializado
                    if ($noticiasCiudad.hasClass('slick-initialized')) {
                        $noticiasCiudad.slick('unslick');
                    }

                    // Agregar el nuevo contenido
                    $noticiasCiudad.html(noticiasCiudad);

                    // Inicializar nuevamente el carrusel
                    $noticiasCiudad.slick({
                        vertical: true,
                        infinite: true,
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 4000,
                        arrows: true,
                        dots: true,
                        centerMode: true,
                        variableWidth: false,
                        responsive: [
                            {
                                breakpoint: 768,
                                settings: {
                                    slidesToShow: 1
                                }
                            }
                        ]
                    });
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
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

        $(window).on("resize", function() {
            scrollThreshold = window.innerHeight * 0.10;
        });
        
    });

	$(window).load(function(){
        // Lista de ciudades predefinidas
        const ciudades = ['Buenos Aires, Argentina', 'Madrid, Spain', 'New York, USA', 'Paris, France', 'Sydney, Australia', 'London, United Kingdom', 'Toronto, Canada', 'Roma, Italy', 'Berlin, Germany'];

        // Variable para controlar la consulta automática
        let consultaAutomaticaRealizada = false;

        // Selección y envío automático de una ciudad al cargar la página
        if (!consultaAutomaticaRealizada) {
            consultaAutomaticaRealizada = true; // Marcar como realizada
            const ciudadAleatoria = ciudades[Math.floor(Math.random() * ciudades.length)];
            $('#ciudad').val(ciudadAleatoria); // Establece la ciudad en el campo
            $('#climaForm').trigger('submit'); // Envía el formulario automáticamente
        }        
	});

})(jQuery, document, window);