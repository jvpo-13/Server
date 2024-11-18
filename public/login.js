async function loginUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // Login bem-sucedido
    window.location.href = '/laboratorio';
  } else {
    // Exibir erro
    alert(data.message || 'Erro ao fazer login');
  }
}
