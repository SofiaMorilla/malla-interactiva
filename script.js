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
