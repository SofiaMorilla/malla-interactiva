const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  databaseURL: "https://TU_DOMINIO.firebaseio.com",
  projectId: "TU_DOMINIO",
  storageBucket: "TU_DOMINIO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const padronInput = document.getElementById("padron");
const materiasContainer = document.getElementById("materias");

document.getElementById("ingresar").addEventListener("click", () => {
  const padron = padronInput.value.trim();
  if (!padron) return alert("Ingresá tu padrón");
  cargarMaterias(padron);
});

function cargarMaterias(padron) {
  fetch("materias.json")
    .then(res => res.json())
    .then(data => {
      materiasContainer.innerHTML = "";
      Object.entries(data).forEach(([año, materias]) => {
        const añoDiv = document.createElement("div");
        añoDiv.innerHTML = `<h3>Año ${año}</h3>`;
        materias.forEach(materia => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `${materia.codigo}`;
          checkbox.dataset.padron = padron;

          checkbox.addEventListener("change", () => guardarProgreso(padron));

          const label = document.createElement("label");
          label.htmlFor = materia.codigo;
          label.textContent = materia.nombre;

          añoDiv.appendChild(checkbox);
          añoDiv.appendChild(label);
          añoDiv.appendChild(document.createElement("br"));
        });
        materiasContainer.appendChild(añoDiv);
      });
      cargarProgreso(padron);
    });
}

function guardarProgreso(padron) {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const progreso = {};
  checkboxes.forEach(cb => {
    progreso[cb.id] = cb.checked;
  });
  db.ref("usuarios/" + padron).set(progreso);
}

function cargarProgreso(padron) {
  db.ref("usuarios/" + padron).once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) return;
    Object.entries(data).forEach(([codigo, estado]) => {
      const cb = document.getElementById(codigo);
      if (cb) cb.checked = estado;
    });
  });
}
