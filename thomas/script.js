
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
                element.innerText = this.formatValue(fullData[key]);
                
                // Adicione lógica específica para cada tipo de dado se necessário
                if(key === 'CV' || key === 'CL' || key.startsWith('CA')) {
                    element.className = fullData[key] ? 'status-active' : 'status-inactive';
                }
            }
        });

        // Se precisar usar os dados em outros lugares
        return fullData;

    } catch (error) {
        updateConnectionStatus(false);
        console.error('Error fetching data:', error);
        if(error.message !== 'Failed to fetch') { // Evita redirecionar em caso de offline
            window.location.replace("/login");
        }
    }
}

// Função auxiliar para formatar valores
function formatValue(value, key) { // Recebe key como parâmetro
    if(typeof value === 'boolean') return value ? 'LIGADO' : 'DESLIGADO';
    if(typeof value === 'number') {
        const units = {
            Velocidade: ' km/h',
            Tempo_Ligado: ' horas',
            Distancia_Percorrida: ' metros',
            Nivel_Bateria: '%'
        };
        const unit = units[key] || ''; // Usa o parâmetro key
        return Number(value.toFixed(2)) + unit;
    }
    return value;
}

document.getElementById('Start').addEventListener('click', async () => {
    let value = document.getElementById('NBolas').value;
    if (value == '') { // Verifica se o campo está vazio
        alert('Preencha o campo "Número de bolinhas desejado" para prosseguir');
        return;
    }else if (value%4 != 0){ // Verifica se o valor é múltiplo de 4
        alert('Preencha o campo com um valor múltiplo de 4');
        return;
    }else if (value > 20){ // Verifica se o valor é maior que 20
        alert('Preencha o campo com um valor menor ou igual a 20');
        return;
    }
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/NBolas', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({value})  // O valor é enviado no corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        //document.getElementById('dataNBolas').innerText = JSON.stringify(data, null, 2);
        //console.log(data);

        // Outra chamada ao endpoint Start
        try {
            const response = await fetch('https://hd2d.fem.unicamp.br/Start');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            //document.getElementById('dataStart').innerText = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        //alert('Servidor Node RED desligado, entre em contato com o administrador');
    }
});

// Adicione esta função
function updateObserverCount() {
    fetch('/observer-count')
      .then(res => res.json())
      .then(data => {
        document.getElementById('observerCount').innerText = 
          `${data.count}/${data.maxCapacity}`;
      });
}
  
// Chame na inicialização e atualize periodicamente
document.addEventListener('DOMContentLoaded', () => {
    updateObserverCount();
    setInterval(updateObserverCount, 10000); // Atualiza a cada 10 segundos
});

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
});