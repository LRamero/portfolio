const encabezado = document.getElementById("encabezado");
const form = document.getElementById("ejecutar-script");
const resultado = document.getElementById("resultado");
const pk_life1 = document.getElementById("pk_life1");
const pk_life2 = document.getElementById("pk_life2");
const button = form.querySelector("button");

button.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("/pokemon_combat", {
        method: "POST",
    })
        .then((response) => {
            if (response.ok) {
                const eventSource = new EventSource("/pokemon_combat_stream");
                eventSource.onmessage = (event) => {
                    if (event.data.includes("Cargando valores...")) {
                        encabezado.innerHTML += "Cargando valores..."
                        pk_life1.innerHTML = ""
                        pk_life2.innerHTML = ""
                        resultado.innerHTML = ""
                    }
                    else if (event.data.includes("pk1")) {
                        const partes = event.data.split(',');
                        const v_max = partes[partes.length - 2]
                        const vida = partes[partes.length - 1]
                        porcentaje = Math.round((vida / v_max) * 100).toString()
                        pk_life1.innerHTML = "<ul class=pk><div class= progress-bar-container><label for= pk1>" + partes[1] + "</label><progress id=pk1 class=p" + porcentaje + " value=" +
                            vida + " max=" + v_max + "></progress> " + vida + "/" + v_max + "</div></ul>";
                    }
                    else if (event.data.includes("pk2")) {
                        const partes = event.data.split(',');
                        const v_max = partes[partes.length - 2]
                        const vida = partes[partes.length - 1]
                        porcentaje = Math.round((vida / v_max) * 100).toString()
                        pk_life2.innerHTML = "<ul class=pk><div class= progress-bar-container><label for= pk2>" + partes[1] + "</label><progress id=pk2 class=p" + porcentaje + " value=" +
                            vida + " max=" + v_max + "></progress> " + vida + "/" + v_max + "</div></ul>";
                    }
                    else if (event.data.includes("%")) {
                        encabezado.innerHTML = "<div class=progress-bar-container><label for=carga>Cargando valores...</label><progress id=cargar class=p" + Number(event.data.substring(0, 3)).toString() + " value=" +
                            event.data.substring(0, 3) + " max=100></progress></div>\n";
                    }
                    else if ((event.data == "Definiendo parámetros...") | (event.data == "Comenzando el combate...")) {
                        encabezado.innerHTML += event.data + "<br>";
                    }
                    else if (event.data.includes("El ganador")) {
                        resultado.innerHTML += event.data + "<br>";
                        encabezado.innerHTML += "Combate finalizado." + "<br>";
                    }
                    else {
                        resultado.innerHTML += event.data + "<br>";
                    }
                };
                eventSource.onerror = () => {
                    console.log("Error al conectar con el servidor");
                };
                eventSource.onopen = () => {
                    console.log("Conexión establecida con el servidor");
                };
            } else {
                console.log("Error al iniciar la ejecución del script");
            }
        })
        .catch((error) => {
            console.log("Error al iniciar la ejecución del script", error);
        });
});