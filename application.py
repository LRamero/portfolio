from flask import Flask, render_template, send_from_directory, request, Response, jsonify, send_file
import subprocess
import pandas as pd
import pickle
import random as rd
import numpy as np
from projects.noticias.codes.openweather import obtener_clima, obtener_coord
from dotenv import load_dotenv
import os
import requests
import datetime

load_dotenv()

app = Flask(__name__, template_folder="", static_folder="./assets")

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
LOCATIONIQ_API_KEY = os.getenv('LOCATIONIQ_API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
POSITIONSTACK_API_KEY = os.getenv('POSITIONSTACK_API_KEY')

#########################################################
#              Fuciones para página principal           #
#########################################################

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/assets/<path:path>")
def send_static(path):
    return send_from_directory("assets", path)

@app.route("/projects/pokemon/assets/<path:path>")
def send_static_pk(path):
    return send_from_directory("projects/pokemon/assets", path)

@app.route("/projects/noticias/assets/<path:path>")
def send_static_ow(path):
    return send_from_directory("projects/noticias/assets", path)

@app.route("/projects/pokemon/assets/images/<path:path>")
def send_image_pk(path):
    return send_from_directory("projects/pokemon/assets/images", path)

@app.route("/projects/<path:path>", methods=['GET', 'POST'])

def projects(path):
    if path == "pokemon":
        return pokemon()
    elif path == "noticias":
        return noticias()
    else:
        return "Página no encontrada", 404

def pokemon():
    id = rd.randint(1, 99)
    return render_template("projects/pokemon/pokemon.html", random_id=id)

def noticias():
    return render_template('projects/noticias/info.html')

########################################################
#           Funciones para página Pokemon              #
########################################################

class PokemonCombat:
    def __init__(self):
        self.proceso = None

    def iniciar_combate(self, id, modo, pokemon1, pokemon2, pk1_ability1, pk1_ability2, pk1_ability3, pk1_ability4, pk2_ability1, pk2_ability2, pk2_ability3, pk2_ability4):
        script = "projects/pokemon/codes/pokemon.py"
        self.proceso = subprocess.Popen(["python", "-u", script, id, modo, pokemon1, pokemon2, pk1_ability1, pk1_ability2, pk1_ability3, pk1_ability4, pk2_ability1, pk2_ability2, pk2_ability3, pk2_ability4], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        return Response("Iniciado", mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })

    def continuar_combate(self, id, modo, pk1_ability, pk2_ability):   
        script = "projects/pokemon/codes/pokemon.py"
        self.proceso = subprocess.Popen(["python", "-u", script, id, modo, pk1_ability, pk2_ability], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        return Response("Iniciado", mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })

    def cerrar_proceso(self):
        if self.proceso:
            self.proceso.kill()
            self.proceso = None

class PokemonLoad:
    def __init__(self):
        self.carga_dato = None
        self.pk = pd.DataFrame()
        self.moves = pd.DataFrame()
        self.nat = pd.DataFrame()
        self.eff = pd.DataFrame()
        self.m_learn = pd.DataFrame()
    
    def load_data(self):
        with open('projects/pokemon/assets/dataframes.pkl', 'rb') as f:
            self.pk, self.moves, self.nat, self.eff, self.m_learn = pickle.load(f, encoding='latin1')
        return Response("Iniciado", mimetype="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream"
        })

    def load_stream(self):
        def generar_eventos():
            while True:
                linea = self.carga_dato.stdout.readline()
                if linea:
                    yield "data: " + linea + "\n\n"
                else:
                    with open('projects/pokemon/assets/dataframes.pkl', 'rb') as f:
                        self.pk, self.moves, self.nat, self.eff, self.m_learn = pickle.load(f, encoding='latin1')
                    self.carga_dato.kill()
                    self.carga_dato = None
                    break
        return Response(generar_eventos(), mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })

pokemon_combat = PokemonCombat()
pokemon_load = PokemonLoad()

@app.route('/pokemon_load')
def cargar_df():
    return pokemon_load.load_data()

@app.route("/pokemon_load_stream")
def pokemon_load_stream():
    return pokemon_load.load_stream()

@app.route("/pokemon_combat", methods=["POST"])
def pokemon_combat_inicio():
    id = request.json['id_s']
    modo = request.json['modo_combate']
    pokemon1 = request.json["pokemon1"]
    pk1_ability1 = request.json["pk1_ability1"]
    pk1_ability2 = request.json["pk1_ability2"]
    pk1_ability3 = request.json["pk1_ability3"]
    pk1_ability4 = request.json["pk1_ability4"]
    pokemon2 = request.json["pokemon2"]
    pk2_ability1 = request.json["pk2_ability1"]
    pk2_ability2 = request.json["pk2_ability2"]
    pk2_ability3 = request.json["pk2_ability3"]
    pk2_ability4 = request.json["pk2_ability4"]
    return pokemon_combat.iniciar_combate(id, modo, pokemon1, pokemon2, pk1_ability1, pk1_ability2, pk1_ability3, pk1_ability4, pk2_ability1, pk2_ability2, pk2_ability3, pk2_ability4)

@app.route("/pokemon_combat_c", methods=["POST"])
def pokemon_combat_continuar():
    id = request.json['id_s']
    modo = request.json['modo_combate']
    pk1_ability = "\"" + request.json["atk_pk1"] + "\""
    pk2_ability = "\"" + request.json["atk_pk2"] + "\""
    return pokemon_combat.continuar_combate(id, modo, pk1_ability.title(), pk2_ability.title())

# @app.route("/pokemon_combat_stream")
# def pokemon_combat_stream():
#     return pokemon_combat.combat_stream()

@app.route("/get_pokemon")
def get_pokemon():
    pk_list = pokemon_load.pk["Nombre"].tolist()
    pk_list.insert(0, "Aleatorio")
    return jsonify(pk_list)

@app.route("/get_abilities", methods=["POST"])
def get_abilities():
    pokemon = request.json["pokemon"]
    abilities = pokemon_load.m_learn[pokemon_load.m_learn["Pokemon"] == pokemon]["Move"].tolist()
    return jsonify(abilities)

@app.route('/pksession.log', methods=["POST"])
def pk_session_log():
    id_s = request.json["id_s"]
    if pokemon_combat.proceso.stderr:
                for linea in iter(pokemon_combat.proceso.stderr.readline, ''):
                    print( f"data: ERROR: {linea}\n\n")
    if pokemon_combat.proceso.stdout:
                for linea in iter(pokemon_combat.proceso.stderr.readline, ''):
                    print (f"data: Mensaje: {linea}\n\n")
    return send_file('projects/pokemon/assets/session_' + id_s + '.log', mimetype='text/plain')

@app.route('/get_info', methods=["POST"])
def get_info():
    tipo = request.json['tipo']
    nombre = request.json['nombre']
    if(tipo=='pk'):
        if(nombre != 'Aleatorio'):
            tipo1 = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Tipo1'].values[0]
            tipo2 = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Tipo2'].values[0]
            hp = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Vida'].values[0]
            atk = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Ataque'].values[0]
            deff = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Defensa'].values[0]
            sp_atk = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Ataque esp'].values[0]
            sp_def = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Defensa esp'].values[0]
            speed = pokemon_load.pk[pokemon_load.pk['Nombre'] == nombre]['Velocidad'].values[0]
            img = "/projects/pokemon/assets/images/" + nombre + ".png"
            data = {
                'tipo1': tipo1,
                'tipo2': tipo2,
                'hp': hp,
                'atk': atk,
                'deff': deff,
                'sp_atk': sp_atk,
                'sp_def': sp_def,
                'speed': speed,
                'img': img
            }
        else:
            data = {
                'tipo1': "",
                'tipo2': "",
                'hp': "",
                'atk': "",
                'deff': "",
                'sp_atk': "",
                'sp_def': "",
                'speed': "",
                'img': ""
            }
        return jsonify(data)
    else:
        tipo1 = pokemon_load.moves[pokemon_load.moves['Name'] == nombre.title()]['Type'].values[0]
        pow = int(pokemon_load.moves[pokemon_load.moves['Name'] == nombre.title()]['Power'].values[0])
        acc = int(pokemon_load.moves[pokemon_load.moves['Name'] == nombre.title()]['Acc.'].values[0])
        clase = pokemon_load.moves[pokemon_load.moves['Name'] == nombre.title()]['Damage_class'].values[0]
        eff = pokemon_load.moves[pokemon_load.moves['Name'] == nombre.title()]['Effect'].values[0]
        data = {
            'tipo1': tipo1,
            'pow': pow,
            'acc': acc,
            'clase': clase,
            'eff': eff
        }
        return jsonify(data)
    
#################################################
#                     Noticias                  #
#################################################

@app.route('/get_weather', methods=["POST"])
def get_weather():
    clima_info = None
    ciudad = request.form['ciudad']
    api_key_pos = POSITIONSTACK_API_KEY
    api_key_weather = OPENWEATHER_API_KEY
    
    lat, lon = obtener_coord(ciudad, api_key_pos)
    if lat is not None and lon is not None:
        clima_info = obtener_clima(lat, lon, api_key_weather)
    return jsonify(clima_info)

@app.route('/get_news_loc', methods=["POST"])
def get_news():
    loc = request.form['ciudad']
    ciudad, pais = loc.split(", ")
    ciudad.replace(" ", "%20")
    ahora = datetime.datetime.now()
    h24 = ahora - datetime.timedelta(hours=24)

    ahora = ahora.strftime("%Y%m%d%H%M%S")
    h24 = h24.strftime("%Y%m%d%H%M%S")
    
    # Petición para obtener noticias de la ciudad
    url_noticias_ciudad = f"httpsna://api.gdeltproject.org/api/v2/doc/doc?query=%22{ciudad}%22+AND+sourcecountry:{pais}&startdatetime={h24}&enddatetime={ahora}&maxrecords=5&mode=artlist&maxrecords=5&format=json&lang=es"
    response_noticias_ciudad = requests.get(url_noticias_ciudad)
    
    # Petición para obtener noticias del país
    url_noticias_pais = f"https://api.gdeltproject.org/api/v2/doc/doc?query=sourcecountry:{pais}&startdatetime={h24}&enddatetime={ahora}&maxrecords=5&mode=artlist&maxrecords=5&format=json&lang=es"
    response_noticias_pais = requests.get(url_noticias_pais)

    if response_noticias_ciudad.status_code == 200 and response_noticias_pais.status_code == 200:
        noticias_ciudad_data = response_noticias_ciudad.json()
        noticias_pais_data = response_noticias_pais.json()

        return jsonify({
            "ciudad": noticias_ciudad_data,
            "pais": noticias_pais_data
        })
    else:
        return jsonify({"error": "Error en la solicitud"}), 500

@app.route('/get_suggestions', methods=["POST"])
def get_suggestions():
    ciudad = request.form['ciudad']
    api_key_sug = LOCATIONIQ_API_KEY
    url = f"https://api.locationiq.com/v1/autocomplete?key={api_key_sug}&q={ciudad}&limit=5&dedupe=1"
    response = requests.get(url)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Error en la solicitud"})
    
#################################################
#                      main                     #
#################################################

if __name__ == "__main__":
    app.run()