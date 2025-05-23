let autoget = true;

/*
document.getElementById('getValues').addEventListener('click', async () => {
    autoget = !autoget;
});
*/

function init(){
    updateConnectionStatus(false);
    checkCookie();
}


setInterval(getAllValues, 1000);

 // Mostra estado de conexão
let connectionTimeout;

function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
    statusElement.textContent = connected ? 'Conectado' : 'Desconectado';
    
    if(connectionTimeout) clearTimeout(connectionTimeout);
    if(!connected) {
        connectionTimeout = setTimeout(() => {
            statusElement.textContent = 'Tentando reconectar...';
        }, 3000);
    }
}

async function getAllValues() {
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getAllData');
        updateConnectionStatus(true);

        if (!response.ok) {
            if(response.status === 401) { // Tratamento específico para não autorizado
                window.location.replace("/login");
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fullData = await response.json();
        
        console.log('Dados completos:', fullData);

        // Atualiza todos os elementos da interface de uma vez
        Object.keys(fullData).forEach(key => {
            const element = document.getElementById(`data${key}`);
            if(element) {
                element.innerText = formatValue(fullData[key], key); // Passa a chave como segundo parâmetro
                
                // Adicione lógica específica para cada tipo de dado se necessário
                if(key === 'CV' || key === 'CL' || key.startsWith('CA')) {
                    element.className = fullData[key] ? 'status-active' : 'status-inactive';
                }
            }
        });

        // Se precisar usar os dados em outros lugares

        const downloadBtn = document.getElementById('downloadLog');
        if (downloadBtn) {
            console.log('Atividade:', fullData['Active']);
            downloadBtn.style.display = fullData['Active'] === true ? 'block' : 'none';
            //downloadBtn.style.display = Object.keys(fullData).length > 0 ? 'block' : 'none';
        }
        return fullData;

    } catch (error) {
        updateConnectionStatus(false);
        console.error('Error fetching data:', error);
        if(error.message !== 'Failed to fetch') { // Evita redirecionar em caso de offline
            window.location.replace("/login");
        }
    }
}

function startLogging() {
    logInterval = setInterval(async () => {
      if (isLogging && Object.keys(receivedData).length > 0) {
        const entry = {
          timestamp: new Date().toISOString(),
          ...receivedData
        };
        logData.push(entry);
        
        // Atualiza arquivo XLS
        const workbook = XLSX.readFile(logFilePath);
        const worksheet = workbook.Sheets["Dados Operacionais"];
        XLSX.utils.sheet_add_json(worksheet, [entry], {header: ["timestamp", ...Object.keys(receivedData)], skipHeader: true, origin: -1});
        XLSX.writeFile(workbook, logFilePath);
      }
    }, 5000); // Atualiza a cada 5 segundos
  }

// Função auxiliar para formatar valores
function formatValue(value, key) { // Recebe key como parâmetro
    if (key === 'Active') {
        return value ? 'Finalizado' : 'Aguardando'; // Formato personalizado para Servo
    }
    if (key === 'Servo') {
        return value ? 'Ativo' : 'Inativo'; // Formato personalizado para Servo
    }
    if (key.startsWith('Contagem_de_Bolas_')) {
        return `${value} unidades`; // Formato para contadores de bolas
    }
    if(typeof value === 'boolean') return value ? 'Em Espera' : 'Em Operação';

    // Converte para número se for string
    if (typeof value === 'string') {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            const units = {
                Velocidade: ' mm/s',
                Tempo_Ligado: ' segundos',
                Distancia_Percorrida: ' metros',
                Nivel_Bateria: ' volts'
            };
            const unit = units[key] || ''; // Usa o parâmetro key
            if (key === 'Tempo_Ligado') {
                return Number(value).toFixed(0) + unit;
            }
            return Number(value).toFixed(2) + unit;
        }
    }
    return value;
}

document.getElementById('Start').addEventListener('click', async () => {
    const value = document.getElementById('NBolas').value;
    const operatorName = document.getElementById('operatorName').value.trim();

    // Validação do nome
    if (!operatorName) {
        alert('Preencha o campo "Nome do Operador" para prosseguir');
        return;
    }
    if (operatorName.length < 4 || operatorName.length > 24) {
        alert('O nome deve ter entre 4 e 24 caracteres');
        return;
    }
    if (!/^[A-Za-z0-9 ]+$/.test(operatorName)) {
        alert('O nome não pode conter símbolos especiais');
        return;
    }

    // Validação existente do NBolas
    if (value === '') {
        alert('Preencha o campo "Número de bolinhas desejado" para prosseguir');
        return;
    } else if (value % 4 != 0) {
        alert('Preencha o campo com um valor múltiplo de 4');
        return;
    } else if (value > 20) {
        alert('Preencha o campo com um valor menor ou igual a 20');
        return;
    }

    try {
        // Envia TUDO em uma única requisição
        const response = await fetch('https://hd2d.fem.unicamp.br/StartSystem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nbolas: value,
                operator: operatorName
            })
        });

        if (!response.ok) {
            throw new Error('Erro no comando');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Erro na comunicação com o Plant Simulation');
    }
});

document.getElementById('downloadLog').addEventListener('click', () => {
    const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-');
    window.open(`https://hd2d.fem.unicamp.br/download-log?t=${timestamp}`, '_blank');
  });

function updateObserverCount() {
    fetch('/observer-count')
      .then(res => res.json())
      .then(data => {
        document.getElementById('observerCount').innerText = 
          `${data.count}/${data.maxCapacity}`;
      });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/check-session')
      .then(res => res.json())
      .then(data => {
        if (!data.user && !data.observer) {
          window.location.href = '/login';
        }
        if (data.observer) {
          document.getElementById('controlSection').style.display = 'none';
          // Atualizar periodicamente o status da sessão
          setInterval(() => {
            fetch('/check-session').then(res => res.json()).then(sessionData => {
              if (!sessionData.observer) window.location.reload();
            });
          }, 30000);
        }
    });

    let user = getCookie("username");
    if (user != "") {
        getUser(user);
        document.getElementById('operatorName').value = user;
    }    

    updateObserverCount(); // Chame na inicialização e atualize periodicamente
    setInterval(updateObserverCount, 10000); // Atualiza a cada 10 segundos
});

let chatHistory = [];

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
  
    // Desabilita o input durante o processamento
    input.disabled = true;
    document.querySelector('#chatInput + button').disabled = true;
  
    // Adiciona mensagem do usuário
    appendMessage(message, 'user');
    input.value = '';
  
    // Adiciona indicador de digitação
    const loadingId = showTypingIndicator();
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: message })
      });
  
      const data = await response.json();
      appendMessage(data.response, 'bot');
      
    } catch (error) {
      appendMessage('Desculpe, ocorreu um erro na comunicação com a IA.', 'error');
    } finally {
      // Remove indicador e reabilita o input
      removeTypingIndicator(loadingId);
      input.disabled = false;
      document.querySelector('#chatInput + button').disabled = false;
    }
}
  
// Funções auxiliares para o indicador
function showTypingIndicator() {
    const messagesDiv = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    const uniqueId = Date.now().toString();
    
    loadingDiv.id = uniqueId;
    loadingDiv.className = 'loading-message';
    loadingDiv.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      Gerando resposta...
    `;
    
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return uniqueId;
}
  
function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

// Toggle para minimizar/expandir
document.getElementById('toggleChat').addEventListener('click', () => {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.toggle('minimized');
  });
  
// Função modificada para formatar markdown simples
function formatBotResponse(text) {
    let formattedText = text
        // Processar cabeçalhos ###
        .replace(/^###\s+(.*)/gm, '<h3 class="bot-heading">$1</h3>')
        // Negrito
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Quebras de linha
        .replace(/\n/g, '<br>')
        // Listas
        .replace(/(\* .+?(<br>|$))/g, '<ul>$1</ul>')
        .replace(/\* (.*?)(<br>|$)/g, '<li>$1</li>')
        // Correções de formatação
        .replace(/<\/ul><ul>/g, '')
        .replace(/<\/ul><br>/g, '</ul>')
        .replace(/<\/li><br>/g, '</li>');

    return formattedText;
}

// Função appendMessage modificada
function appendMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;

    if(sender === 'bot') {
        messageDiv.innerHTML = formatBotResponse(text);
    } else {
        messageDiv.textContent = text;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
// Enter para enviar
document.getElementById('chatInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});