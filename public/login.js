async function loginUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://143.106.61.223:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      window.location.href = "/laboratorio.html";  // Redirecionar para a página do laboratório
    } else {
      alert("Login falhou. Verifique suas credenciais.");
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
