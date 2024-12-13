
let autoget = true;

/*
document.getElementById('getValues').addEventListener('click', async () => {
    autoget = !autoget;
});
*/


setInterval(getAllValues, 1000);

async function getAllValues(){
    if(autoget){
        getCVValue();
        getCLValue();
        getCA1Value();
        getCA2Value();
        getCA3Value();
        getVelocidade();
        getTempo_Ligado();
        getDistancia_Percorrida();
        getNivel_Bateria();
    }
}

async function getCVValue(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getCV');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('dataCV').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}

async function getCLValue(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getCL');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('dataCL').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}

async function getCA1Value(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getCA1');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('dataCA1').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}

async function getCA2Value(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getCA2');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('dataCA2').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}

async function getCA3Value(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getCA3');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('dataCA3').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
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
        document.getElementById('dataNBolas').innerText = JSON.stringify(data, null, 2);

        // Outra chamada ao endpoint Start
        try {
            const response = await fetch('https://hd2d.fem.unicamp.br/Start');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            document.getElementById('dataStart').innerText = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        //alert('Servidor Node RED desligado, entre em contato com o administrador');
    }
});


async function getVelocidade(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/Velocidade');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('Velocidade').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}


async function getTempo_Ligado(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/Tempo_Ligado');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('Tempo_Ligado').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}


async function getDistancia_Percorrida(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/Distancia_Percorrida');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('Distancia_Percorrida').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}


async function getNivel_Bateria(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/Nivel_Bateria');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data);
        document.getElementById('Nivel_Bateria').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}