import requests

def obtener_clima(lat, lon, api_key):
    url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    respuesta = requests.get(url)
    if respuesta.status_code == 200:
        datos = respuesta.json()
        return datos
    else:
        return None
    
def obtener_coord(direccion, api_key):
    url = f"https://us1.locationiq.com/v1/search?key={api_key}&q={direccion}&format=json"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        lat = data[0]["lat"]
        lon = data[0]["lon"]
        return lat, lon
    else:
        return None, None
    
def traducir_texto(texto, clave_api, idioma_destino):
    url = "https://api-free.deepl.com/v2/translate"

    parametros = {
        "auth_key": clave_api,
        "text": texto,
        "target_lang": idioma_destino
    }

    respuesta = requests.post(url, data=parametros)

    if respuesta.status_code == 200:
        datos_respuesta = respuesta.json()
        return datos_respuesta['translations'][0]['text']
    else:
        print("Error en la traducción:", respuesta.status_code, respuesta.text)
        return None
    
def obtener_noticias(query, api_key, pais = None):
    pais_codigo = {
        "Argentina": "AR",
        "Australia": "AU",
        "Austria": "AT",
        "Belgium": "BE",
        "Brazil": "BR",
        "Bulgaria": "BG",
        "Canada": "CA",
        "China": "CN",
        "Colombia": "CO",
        "Czech Republic": "CZ",
        "Egypt": "EG",
        "France": "FR",
        "Germany": "DE",
        "Greece": "GR",
        "Hong Kong": "HK",
        "Hungary": "HU",
        "India": "IN",
        "Indonesia": "ID",
        "Ireland": "IE",
        "Israel": "IL",
        "Italy": "IT",
        "Japan": "JP",
        "Latvia": "LV",
        "Lithuania": "LT",
        "Malaysia": "MY",
        "Mexico": "MX",
        "Morocco": "MA",
        "Netherlands": "NL",
        "New Zealand": "NZ",
        "Nigeria": "NG",
        "Norway": "NO",
        "Philippines": "PH",
        "Poland": "PL",
        "Portugal": "PT",
        "Romania": "RO",
        "Saudi Arabia": "SA",
        "Serbia": "RS",
        "Singapore": "SG",
        "Slovakia": "SK",
        "Slovenia": "SI",
        "South Africa": "ZA",
        "South Korea": "KR",
        "Sweden": "SE",
        "Switzerland": "CH",
        "Taiwan": "TW",
        "Thailand": "TH",
        "Turkey": "TR",
        "UAE": "AE",
        "Ukraine": "UA",
        "United Kingdom": "GB",
        "United States": "US",
        "Venezuela": "VE"
    }

    def obtener_codigo_pais(nombre_pais):
        return pais_codigo.get(nombre_pais, "Código no encontrado")

    if (pais):
        codigo = obtener_codigo_pais(pais)
    else:
        codigo = "AR"

    url_noticias = f"https://api.mediastack.com/v1/news?access_key={api_key}&keywords={query}&countries={codigo}"
    respuesta = requests.get(url_noticias)
    if respuesta.status_code == 200:
        datos = respuesta.json()
        return datos
    else:
        return None

def obtener_sugerencias(api_key_sug, ciudad):
    url = f"https://api.locationiq.com/v1/autocomplete?key={api_key_sug}&q={ciudad}&limit=5&dedupe=1&tag=place%3Acountry%2Cplace%3Astate%2Cplace%3Aregion%2Cplace%3Aprovince%2Cplace%3Acountry%2Cplace%3Acity"
    return requests.get(url)