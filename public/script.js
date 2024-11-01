document.getElementById('getCV').addEventListener('click', async () => {
  try {
      const response = await fetch('http://143.106.61.223:3000/getCV');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      document.getElementById('dataCV').innerText = JSON.stringify(data, null, 2);
  } catch (error) {
      console.error('Error fetching data:', error);
  }
});

document.getElementById('getCL').addEventListener('click', async () => {
    try {
        const response = await fetch('http://143.106.61.223:3000/getCL');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        document.getElementById('dataCL').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

document.getElementById('getCA1').addEventListener('click', async () => {
    try {
        const response = await fetch('http://143.106.61.223:3000/getCA1');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        document.getElementById('dataCA1').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

document.getElementById('getCA2').addEventListener('click', async () => {
    try {
        const response = await fetch('http://143.106.61.223:3000/getCA2');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        document.getElementById('dataCA2').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

document.getElementById('getCA3').addEventListener('click', async () => {
    try {
        const response = await fetch('http://143.106.61.223:3000/getCA3');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        document.getElementById('dataCA3').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

document.getElementById('Start').addEventListener('click', async () => {
    let value = document.getElementById('NBolas').value;
    try {
        const response = await fetch('http://143.106.61.223:3000/NBolas', {
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
            const response = await fetch('http://143.106.61.223:3000/Start');
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

  
