const firebaseConfig = {
  apiKey: "AIzaSyD3rr59_b4bLPs5dDa3VyKjghs12b4Z1-s",
  authDomain: "malla-interactiva-ec45d.firebaseapp.com",
  projectId: "malla-interactiva-ec45d",
  storageBucket: "malla-interactiva-ec45d.firebasestorage.app",
  messagingSenderId: "206026131824",
  appId: "1:206026131824:web:c56827c96ba4c99be227b5"
};

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
  fetch("materias_completo.json")
    .then(res => res.json())
    .then(data => {
      db.ref("usuarios/" + padron).once("value").then(snapshot => {
        progresoGlobal = snapshot.val() || {};
        renderMaterias(data, padron);
      });
    });
}

function renderMaterias(data, padron) {
  materiasContainer.innerHTML = "";

  Object.entries(data).forEach(([año, materias]) => {
    const añoDiv = document.createElement("div");
    añoDiv.innerHTML = `<h2>Año ${año}</h2>`;
    añoDiv.style.marginBottom = "1.5rem";

    materias.forEach(materia => {
      const estado = progresoGlobal[materia.codigo] || {
        tps_aprobado: false,
        final_aprobado: false,
        nota: ""
      };

      // Evaluar si se habilita
      const puedeCursar = materia.correlativas_cursada.every(cor => {
        const estadoCor = progresoGlobal[cor.codigo];
        if (!estadoCor) return false;
        return cor.tipo === "final"
          ? estadoCor.final_aprobado
          : estadoCor.tps_aprobado;
      });

      const materiaDiv = document.createElement("div");
materiaDiv.className = "materia";

// 💡 Aplica clase según el estado
if (estado.final_aprobado || estado.tps_aprobado) {
  materiaDiv.classList.add("aprobada");
} else if (puedeCursar) {
  materiaDiv.classList.add("habilitada");
} else {
  materiaDiv.classList.add("bloqueada");
}

      // Nombre materia
      const label = document.createElement("strong");
      label.textContent = materia.nombre;
      materiaDiv.appendChild(label);

      // TPs aprobado
      const cbTps = document.createElement("input");
      cbTps.type = "checkbox";
      cbTps.checked = estado.tps_aprobado;
      cbTps.disabled = !puedeCursar;
      cbTps.addEventListener("change", () => guardarProgreso(padron));
      materiaDiv.appendChild(document.createTextNode(" - TPs "));
      materiaDiv.appendChild(cbTps);

      // Final aprobado (si corresponde)
      if (materia.tipo === "examen") {
        const cbFinal = document.createElement("input");
        cbFinal.type = "checkbox";
        cbFinal.checked = estado.final_aprobado;
        cbFinal.disabled = !puedeCursar;
        cbFinal.addEventListener("change", () => guardarProgreso(padron));
        materiaDiv.appendChild(document.createTextNode(" Final "));
        materiaDiv.appendChild(cbFinal);
      }

      // Nota
      const notaInput = document.createElement("input");
      notaInput.type = "number";
      notaInput.min = "0";
      notaInput.max = "10";
      notaInput.value = estado.nota || "";
      notaInput.placeholder = "Nota";
      notaInput.disabled = !puedeCursar;
      notaInput.style.marginLeft = "0.5rem";
      notaInput.addEventListener("change", () => guardarProgreso(padron));
      materiaDiv.appendChild(notaInput);

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
    const nombre = materia.querySelector("strong").textContent;

    const checkboxes = materia.querySelectorAll("input[type='checkbox']");
    const inputs = materia.querySelectorAll("input[type='number']");

    let codigo = Object.keys(progresoGlobal).find(k =>
      progresoGlobal[k].nombre === nombre
    );
    if (!codigo) codigo = nombre; // fallback si no existe en base

    progreso[codigo] = {
      tps_aprobado: checkboxes[0]?.checked || false,
      final_aprobado: checkboxes[1]?.checked || false,
      nota: inputs[0]?.value ? parseFloat(inputs[0].value) : null
    };
  });

  db.ref("usuarios/" + padron).set(progreso).then(() => {
    cargarMaterias(padron);
  });
}

function calcularPromedio() {
  const allNotas = Object.values(progresoGlobal)
    .map(m => parseFloat(m.nota))
    .filter(n => !isNaN(n));
  const promedio = allNotas.length
    ? (allNotas.reduce((a, b) => a + b, 0) / allNotas.length).toFixed(2)
    : "N/A";

  const div = document.getElementById("promedio") || document.createElement("div");
  div.id = "promedio";
  div.innerHTML = `<hr><h3>Promedio actual: ${promedio}</h3>`;
  materiasContainer.appendChild(div);
}
