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

async function loginObserver() {
  try {
    const response = await fetch('/loginObserver', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include' // Crucial para cookies
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na autenticação');
    }
    
    // Redirecionamento seguro
    if (data.redirect) {
      window.location.href = data.redirect;
    }
    
  } catch (error) {
    console.error('Erro detalhado:', error);
    alert(error.message || 'Falha na comunicação com o servidor');
  }
}