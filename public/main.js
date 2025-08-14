let token = localStorage.getItem('token') || '';
const quill = new Quill('#editor', { theme: 'snow' });

function setStatus() {
  document.getElementById('status').textContent = token ? 'Sesión iniciada' : 'Sin iniciar sesión';
  document.getElementById('logout').style.display = token ? 'inline-block' : 'none';
}
setStatus();

async function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) return alert('Ingresa usuario y contraseña');
  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) alert('Usuario registrado'); else alert(data.error || 'Error al registrar');
}

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) return alert('Ingresa usuario y contraseña');
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json().catch(() => ({}));
  if (data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    setStatus();
    await loadDocuments();
    alert('Sesión iniciada');
  } else {
    alert(data.error || 'Error al iniciar sesión');
  }
}

function logout() {
  token = '';
  localStorage.removeItem('token');
  setStatus();
}

async function save() {
  if (!token) return alert('Inicia sesión primero');
  const content = quill.root.innerHTML;
  const res = await fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ content })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    await loadDocuments();
    alert('Documento guardado');
  } else {
    alert(data.error || 'Error al guardar');
  }
}

async function loadDocuments() {
  if (!token) return;
  const res = await fetch('/documents', { headers: { 'Authorization': 'Bearer ' + token } });
  const docs = await res.json().catch(() => []);
  const list = document.getElementById('docs');
  list.innerHTML = '';
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.innerHTML = `${new Date(doc.created_at).toLocaleString()} — ${doc.content}`;
    list.appendChild(li);
  });
}