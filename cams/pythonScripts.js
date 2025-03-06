const { exec } = require('child_process');
//const local = process.cwd();
const local = 'C:/Users/Cooper/Desktop/Server';

// Executa o script Python
exec(local+'/cams/stream0.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o script Python: ${error.message}`);
    exec(local+'/cams/stream0.py');
    return;
  }
  if (stderr) {
    console.error(`Erro no script Python: ${stderr}`);
    exec(local+'/cams/stream0.py');
    return;
  }

  // Saída do script Python
  console.log(`Saída do Python: ${stdout}`);
});
  
// Executa o script Python
exec(local+'/cams/stream1.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o script Python: ${error.message}`);
    exec(local+'/cams/stream1.py');
    return;
  }
  if (stderr) {
    console.error(`Erro no script Python: ${stderr}`);
    exec(local+'/cams/stream1.py');
    return;
  }

  // Saída do script Python
  console.log(`Saída do Python: ${stdout}`);
});