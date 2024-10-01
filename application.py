from flask import Flask, render_template, send_from_directory, request, Response, jsonify, send_file
import subprocess
import pandas as pd
import pickle
import random as rd
import numpy as np

app = Flask(__name__, template_folder="", static_folder="./assets")

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

@app.route("/projects/pokemon/assets/images/<path:path>")
def send_image_pk(path):
    return send_from_directory("projects/pokemon/assets/images", path)

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
    # def combat_stream(self):
    #     def generar_eventos():
    #         while True:
    #             salida = self.proceso.stdout.readline()
    #             if salida:
    #                 yield "data: " + salida + "\n\n"
    #             else:
    #                 self.cerrar_proceso()
    #                 yield "data: " + "Error!!" + "\n\n"
    #                 break
    #     return Response(generar_eventos(), mimetype="text/event-stream", headers={
    #         "Cache-Control": "no-cache",
    #         "Content-Type": "text/event-stream"
    #     })

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
        # script = "projects/codes/cargar_datos.py"
        # self.carga_dato = subprocess.Popen(['python', script], stdout=subprocess.PIPE, universal_newlines=True)
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

@app.route("/projects/<path:path>")
def pokemon(path):
    id = rd.randint(1, 999)
    return render_template("projects/pokemon/pokemon.html", random_id=id)

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
#                      main                     #
#################################################

if __name__ == "__main__":
    app.run()