from flask import Flask, render_template, send_from_directory, redirect
import subprocess
import random

app = Flask(__name__, template_folder="", static_folder="./assets")

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

@app.route("/projects/<path:path>")
def pokemon(path):
    script = "/projects/pokemonapp.py"
    random_port = random.randint(5001, 5999)

    subprocess.Popen(['python', "-u", script, str(random_port)])

    url = f'http://127.0.0.1:{random_port}/'
    return redirect(url)

if __name__ == "__main__":
    app.run()