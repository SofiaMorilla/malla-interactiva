// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3rr59_b4bLPs5dDa3VyKjghs12b4Z1-s",
  authDomain: "malla-interactiva-ec45d.firebaseapp.com",
  databaseURL: "https://malla-interactiva-ec45d-default-rtdb.firebaseio.com",
  projectId: "malla-interactiva-ec45d",
  storageBucket: "malla-interactiva-ec45d.firebasestorage.app",
  messagingSenderId: "206026131824",
  appId: "1:206026131824:web:c56827c96ba4c99be227b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const padronInput = document.getElementById("padron");
const materiasContainer = document.getElementById("materias");

let progresoGlobal = {};

document.getElementById("ingresar").addEventListener("click", () => {
  const padron = padronInput.value.trim();
  if (!padron) return alert("Ingresá tu padrón");
  cargarMaterias(padron);
});

function cargarMaterias(padron) {
  fetch("materias.json")
    .then(res => res.json())
    .then(data => {
      db.ref("usuarios/" + padron).once("value").then(snapshot => {
        progresoGlobal = snapshot.val() || {};
        renderMaterias(data, padron);
      });
    }).catch(e => {
      console.error("Error cargando JSON o Firebase:", e);
      alert("Error al cargar datos. Revisá consola.");
    });
}

function renderMaterias(data, padron) {
  console.log("Renderizando materias para padrón:", padron);
  materiasContainer.innerHTML = "";

  const ordenAños = ["CBC", "1", "2", "3", "4", "5"];

  ordenAños.forEach(añoKey => {
    const materias = data[añoKey];
    if (!materias) return;

    const añoDiv = document.createElement("div");
    añoDiv.className = "año-columna";
    añoDiv.innerHTML = `<h2>${añoKey === "CBC" ? "CBC" : añoKey + "° Año"}</h2>`;

    materias.forEach(materia => {
      const estado = progresoGlobal[materia.codigo] || {
        tps_aprobado: false,
        final_aprobado: false,
        nota: ""
      };

      const puedeCursar = materia.correlativas_cursada.every(cor => {
        const estadoCor = progresoGlobal[cor.codigo];
        if (!estadoCor) return false;
        return cor.tipo === "final"
          ? estadoCor.final_aprobado
          : estadoCor.tps_aprobado;
      });

      const materiaDiv = document.createElement("div");
      materiaDiv.className = "materia";

      if (estado.final_aprobado || estado.tps_aprobado) {
        materiaDiv.classList.add("aprobada");
      } else if (puedeCursar) {
        materiaDiv.classList.add("habilitada");
      } else {
        materiaDiv.classList.add("bloqueada");
      }

      const codigoSpan = document.createElement("span");
      codigoSpan.textContent = materia.codigo;
      materiaDiv.appendChild(codigoSpan);

      const controlesDiv = document.createElement("div");
      controlesDiv.className = "controles";

      // Checkbox TPs
      const labelTps = document.createElement("label");
      const cbTps = document.createElement("input");
      cbTps.type = "checkbox";
      cbTps.checked = estado.tps_aprobado;
      cbTps.disabled = !puedeCursar;
      cbTps.addEventListener("change", () => guardarProgreso(padron));
      labelTps.appendChild(cbTps);
      labelTps.appendChild(document.createTextNode("TP"));
      controlesDiv.appendChild(labelTps);

      // Checkbox Final solo si es materia de examen
      if (materia.tipo === "examen") {
        const labelFinal = document.createElement("label");
        const cbFinal = document.createElement("input");
        cbFinal.type = "checkbox";
        cbFinal.checked = estado.final_aprobado;
        cbFinal.disabled = !puedeCursar;
        cbFinal.addEventListener("change", () => guardarProgreso(padron));
        labelFinal.appendChild(cbFinal);
        labelFinal.appendChild(document.createTextNode("Final"));
        controlesDiv.appendChild(labelFinal);
      }

      materiaDiv.appendChild(controlesDiv);
      añoDiv.appendChild(materiaDiv);
    });

    materiasContainer.appendChild(añoDiv);
  });

  calcularPromedio();
}

function guardarProgreso(padron) {
  const materias = document.querySelectorAll(".materia");
  const progreso = {};

  materias.forEach(materia => {
    const codigo = materia.querySelector("span").textContent;
    const checkboxes = materia.querySelectorAll("input[type='checkbox']");
    progreso[codigo] = {
      tps_aprobado: checkboxes[0]?.checked || false,
      final_aprobado: checkboxes[1]?.checked || false,
      nota: "" // la nota se puede agregar después si querés
    };
  });

  db.ref("usuarios/" + padron).set(progreso).then(() => {
    cargarMaterias(padron);
  });
}

function calcularPromedio() {
  // esta función se puede completar más adelante si agregás nota
}
