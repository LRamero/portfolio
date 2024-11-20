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
    
def obtener_noticias(pais, h24, ahora, ciudad = None):
    if(ciudad):
        url_noticias = f"https://api.gdeltproject.org/api/v2/doc/doc?query=%22{ciudad}%22+AND+sourcecountry:{pais}&startdatetime={h24}&enddatetime={ahora}&maxrecords=5&mode=artlist&maxrecords=5&format=json&lang=es"
    else:
        url_noticias = f"https://api.gdeltproject.org/api/v2/doc/doc?query=sourcecountry:{pais}&startdatetime={h24}&enddatetime={ahora}&maxrecords=5&mode=artlist&maxrecords=5&format=json&lang=es"
    
    return requests.get(url_noticias)

def obtener_sugerencias(api_key_sug, ciudad):
    url = f"https://api.locationiq.com/v1/autocomplete?key={api_key_sug}&q={ciudad}&limit=5&dedupe=1&tag=tag%3Dplace%3Acountry%2Cplace%3Astate%2Cplace%3Aregion%2Cplace%3Aprovince%2Cplace%3Adistrict%2Cplace%3Acountry%2Cplace%3Acity%2Cplace%3Atown%2Cplace%3Avillage"
    return requests.get(url)