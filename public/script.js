let autoget = false;

document.getElementById('getValues').addEventListener('click', async () => {
    autoget = !autoget;
});


setInterval(getAllValues, 1000);

async function getAllValues(){
    if(autoget){
        getCVValue();
        getCLValue();
        getCA1Value();
        getCA2Value();
        getCA3Value();
    }
}

async function getCVValue(){
    try {
        const response = await fetch('https://hd2d.fem.unicamp.br/getCV');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
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
        console.log(data);
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
        console.log(data);
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
        console.log(data);
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
        console.log(data);
        document.getElementById('dataCA3').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    //return data;
}

document.getElementById('Start').addEventListener('click', async () => {
    let value = document.getElementById('NBolas').value;
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
    }
});

  
