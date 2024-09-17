from flask import Flask, render_template, send_from_directory, request, Response, stream_with_context, jsonify
import subprocess
import pandas as pd
import pickle

app = Flask(__name__, template_folder="", static_folder="./assets")


class PokemonCombat:
    def __init__(self):
        self.proceso = None

    def iniciar_combate(self, modo, pokemon1, pokemon2, pk1_ability1, pk1_ability2, pk1_ability3, pk1_ability4, pk2_ability1, pk2_ability2, pk2_ability3, pk2_ability4):
        # Iniciar la ejecución del script
        script = "projects/codes/pokemon.py"
        self.proceso = subprocess.Popen(["python", "-u", script, modo, pokemon1, pokemon2, pk1_ability1, pk1_ability2, pk1_ability3, pk1_ability4, pk2_ability1, pk2_ability2, pk2_ability3, pk2_ability4], stdout=subprocess.PIPE, universal_newlines=True)
        return Response("Iniciado", mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })

    def continuar_combate(self, modo, pk1_ability, pk2_ability):       
        script = "projects/codes/pokemon.py"
        self.proceso = subprocess.Popen(["python", "-u", script, modo, pk1_ability, pk2_ability], stdout=subprocess.PIPE, universal_newlines=True)
        return Response("Iniciado", mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })
    def combat_stream(self):
        # Leer la salida del script y enviarla como eventos
        def generar_eventos():
            while True:
                salida = self.proceso.stdout.readline()
                if salida:
                    yield "data: " + salida + "\n\n"
                else:
                    self.cerrar_proceso()
                    yield "data: " + "Error!!" + "\n\n"
                    break
        return Response(generar_eventos(), mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })

    def cerrar_proceso(self):
        # Cerrar el proceso
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
        script = "projects/codes/cargar_datos.py"
        self.carga_dato = subprocess.Popen(['python', script], stdout=subprocess.PIPE, universal_newlines=True)
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
                    with open('projects/assets/dataframes.pkl', 'rb') as f:
                        self.pk, self.moves, self.nat, self.eff, self.m_learn = pickle.load(f, encoding='latin1')
                    self.carga_dato.kill()
                    self.carga_dato = None
                    break
        return Response(generar_eventos(), mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream"
        })

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/assets/<path:path>")
def send_static(path):
    return send_from_directory("assets", path)

@app.route("/projects/assets/pk/<path:path>")
def send_static_pk(path):
    return send_from_directory("projects/assets/pk", path)

@app.route("/projects/assets/<path:path>")
def send_static_pr(path):
    return send_from_directory("projects/assets", path)

@app.route("/assets/images/<path:path>")
def send_image(path):
    return send_from_directory("assets/images", path)

@app.route("/projects/assets/images/<path:path>")
def send_image_pk(path):
    return send_from_directory("projects/assets/images", path)

pokemon_combat = PokemonCombat()
pokemon_load = PokemonLoad()

@app.route("/projects/<path:path>")
def pokemon(path):
    return render_template("projects/pokemon.html")

@app.route('/pokemon_load')
def cargar_df():
    return pokemon_load.load_data()

@app.route("/pokemon_load_stream")
def pokemon_load_stream():
    return pokemon_load.load_stream()

@app.route("/pokemon_combat", methods=["POST"])
def pokemon_combat_inicio():
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
    return pokemon_combat.iniciar_combate(modo, pokemon1, pokemon2, pk1_ability1, pk1_ability2, pk1_ability3, pk1_ability4, pk2_ability1, pk2_ability2, pk2_ability3, pk2_ability4)

@app.route("/pokemon_combat_c", methods=["POST"])
def pokemon_combat_continuar():
    modo = request.json['modo_combate']
    pk1_ability = "\"" + request.json["atk_pk1"] + "\""
    pk2_ability = "\"" + request.json["atk_pk2"] + "\""
    return pokemon_combat.continuar_combate(modo, pk1_ability.title(), pk2_ability.title())

@app.route("/pokemon_combat_stream")
def pokemon_combat_stream():
    return pokemon_combat.combat_stream()

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

if __name__ == "__main__":
    app.run()