/* -----------------------------------------------------------
   1. FIREBASE CONFIG + INITIALIZATION
----------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCj99X06LqePdGNlS0sly3QoeWrM0HpG-Q",
  authDomain: "group-project-eb9a9.firebaseapp.com",
  databaseURL: "https://group-project-eb9a9-default-rtdb.firebaseio.com",
  projectId: "group-project-eb9a9",
  storageBucket: "group-project-eb9a9.appspot.com",
  messagingSenderId: "297282255346",
  appId: "1:297282255346:web:69228d0c8ea46f0b4b536b",
  measurementId: "G-W5SX713XLB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.database();

/* -----------------------------------------------------------
   2. CRUD
----------------------------------------------------------- */

// Reference to pokemons in the database
const pokemonsRef = db.ref("pokemons");

// HTML elements
const container = document.getElementById("notes-container");
const nameInput = document.getElementById("pokemon-name");
const typeInput = document.getElementById("pokemon-type");
const imageInput = document.getElementById("pokemon-image");
const submitBtn = document.getElementById("submit-button");

/* ---------- CREATE Pokémon ---------- */
submitBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const type = typeInput.value.trim();
  const image = imageInput.value.trim();

  if (!name) return;

  pokemonsRef.push({
    name,
    type,
    image,
    timestamp: Date.now()
  });

  nameInput.value = "";
  typeInput.value = "";
  imageInput.value = "";
});

/* ---------- READ Pokémon ---------- */
pokemonsRef.on("child_added", (snapshot) => {
  const id = snapshot.key;
  const data = snapshot.val();
  const el = createPokemonElement(id, data);
  container.prepend(el);
});

/* ---------- DELETE Listener ---------- */
pokemonsRef.on("child_removed", (snapshot) => {
  const id = snapshot.key;
  const el = document.querySelector(`div[data-id="${id}"]`);
  if (el) el.remove();
});

/* ---------- COMPONENT CREATOR ---------- */
function createPokemonElement(id, data) {
  const div = document.createElement("div");
  div.classList.add("pokemon");
  div.setAttribute("data-id", id);

  // image
  if (data.image) {
    const img = document.createElement("img");
    img.src = data.image;
    div.appendChild(img);
  }

  // name + type
  const info = document.createElement("span");
  info.textContent = `${data.name} (${data.type || "Unknown Type"})`;
  div.appendChild(info);

  // edit button
  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.innerText = "Edit";
  editBtn.addEventListener("click", () => editPokemon(id, data));
  div.appendChild(editBtn);

  // delete button
  const delBtn = document.createElement("button");
  delBtn.classList.add("delete-btn");
  delBtn.innerText = "Delete";
  delBtn.addEventListener("click", () => deletePokemon(id));
  div.appendChild(delBtn);

  return div;
}

/* ---------- DELETE FUNCTION ---------- */
function deletePokemon(id) {
  db.ref("pokemons/" + id).remove();
}

/* ---------- EDIT FUNCTION ---------- */
function editPokemon(id, data) {
  const newName = prompt("Pokémon Name:", data.name);
  const newType = prompt("Pokémon Type:", data.type || "");
  const newImage = prompt("Image URL:", data.image || "");

  if (!newName) return;

  db.ref("pokemons/" + id).update({
    name: newName,
    type: newType,
    image: newImage
  });
}

/* -----------------------------------------------------------
   3. CONTACT FORM SYSTEM (SAME DB CONNECTION)
----------------------------------------------------------- */

const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    const newContact = {
      name,
      email,
      message,
      timestamp: Date.now()
    };

    db.ref("contacts")
      .push(newContact)
      .then(() => {
        window.location.href = "thanks.html";
      });
  });
}

const messagesDiv = document.getElementById("messages");

/* ---------- CONTACT READ ---------- */
if (messagesDiv) {
  db.ref("contacts").on("value", (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach((child) => {
      const data = child.val();
      const id = child.key;

      messagesDiv.innerHTML += `
        <div class="msg-card">
          <h3>${data.name}</h3>
          <p>${data.message}</p>
          <button onclick="updateMessage('${id}')">Edit</button>
          <button onclick="deleteMessage('${id}')">Delete</button>
        </div>
      `;
    });
  });
}

/* ---------- CONTACT EDIT ---------- */
window.updateMessage = function (id) {
  const newMessage = prompt("Enter new message:");

  if (newMessage) {
    db.ref("contacts/" + id).update({
      message: newMessage
    });
  }
};

/* ---------- CONTACT DELETE ---------- */
window.deleteMessage = function (id) {
  if (confirm("Are you sure you want to delete this message?")) {
    db.ref("contacts/" + id).remove();
  }
};
