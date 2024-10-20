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
    url = f"https://api.positionstack.com/v1/forward?access_key={api_key}&query={direccion}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        lat = data["data"][0]["latitude"]
        lon = data["data"][0]["longitude"]
        return lat, lon
    else:
        return None, None