const http = require('http');
const https = require('https');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const express = require('express');
const app = express();


const session = require('express-session');

// Habilita o CORS
//const cors = require('cors');
//app.use(cors());
const cors = require('cors');
app.use(cors({
  origin: 'https://hd2d.fem.unicamp.br',
  credentials: true,
  methods: ['GET', 'POST', 'PUT']
}));

const options = {
  key: fs.readFileSync('C:/Certbot/live/hd2d.fem.unicamp.br/privkey.pem'),
  cert: fs.readFileSync('C:/Certbot/live/hd2d.fem.unicamp.br/fullchain.pem'),
};

const httpServer = http.createServer(app);
const server = https.createServer(options, app);

// Configura o Express.js para servir arquivos estáticos da pasta 'public'
const publicPath = path.join(__dirname, 'public');
app.use('/', express.static(publicPath));
app.use(express.json());

// HTTPS
app.use(session({
  secret: 'your-secret-key', // Chave secreta para criptografar a sessão
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, // Deve ser true se usar HTTPS
    httpOnly: true, // Evita acesso do lado do cliente
    sameSite: 'none', // Permite envio de cookies em contextos de terceiros
    domain: '.fem.unicamp.br', // Ajuste para seu domínio
    maxAge: 15 * 60 * 1000 // Sessão expira em 15 minutos
  },
  //sessão do observer seja persistida
  name: 'labSession',
  rolling: true
}));

const requireUser = (req, res, next) => {
  if (req.session.user) return next();
  res.status(403).send('Acesso requer autenticação completa');
};

/*
app.use(session({
  secret: 'your-secret-key', // Chave secreta para criptografar a sessão
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Deve ser true se usar HTTPS
    httpOnly: true, // Evita acesso do lado do cliente
    sameSite: 'lax', // Permite envio de cookies em contextos de terceiros
    maxAge: 15 * 60 * 1000 // Sessão expira em 15 minutos
  }
}));
*/

// Middleware para registrar cada requisição recebida
// Middleware global, exceto para páginas públicas (login, por exemplo)

app.use((req, res, next) => {
  if (!req.secure) {
    //HTTPS:
    console.log('Requisição insegura. Redirecionando para HTTPS...');
    return res.redirect(`https://hd2d.fem.unicamp.br${req.url}`);

    //HTTP:
    //res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    //res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    //res.setHeader('Content-Security-Policy', 'default-src self; script-src self unsafe-inline; style-src self unsafe-inline');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  const publicPaths = ['/', '/login', '/login.html', '/styles.css', '/login.js', '/LMU.JPG', '/public/favicon.ico', '/loginObserver'];

  if(!publicPaths.includes(req.path)){
    console.log('Acesso não autorizado ao path:', req.path);
    return res.status(404).send('página não encontrada');
  }

  if (!req.session?.user && !req.session?.observer) {
    console.log('Acesso não autorizado ao path:', req.path);
    return res.redirect('/login');
  }

  // Atualizar timestamp do observador
  if (req.session?.observer && activeObservers.has(req.sessionID)) {
    activeObservers.set(req.sessionID, Date.now());
  }

  if (req.session?.user || req.session?.observer) {
    return next();
  }

  next();
});


app.get('/', async (req, res) => {
  const { username, password, page } = req.query; // Captura credenciais enviadas na query string
  // Valide as credenciais (exemplo básico)
  if (username === 'admin' && password === 'admin'){
    // Cria a sessão para o usuário
    req.session.user = username;
    console.log(`Login automático realizado para o usuário: ${username}`);
    if (page === 'video_feed_0') {
      //Redireciona para a página desejada
      return res.redirect('/video/video_feed_0');
    }
    if (page === 'video_feed_1') {
      //Redireciona para a página desejada
      return res.redirect('/video/video_feed_1');
    } 
    if (page === 'video_feed_2') {
      //Redireciona para a página desejada
      return res.redirect('/video/video_feed_2');
    }
  } else if (req.session.user) {
      return res.redirect('/laboratorio');
  } else if (req.session.observer) {
      return res.redirect('/laboratorio');
  }
  return res.redirect('/login');
});

app.get('/login', async (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/laboratorio', async (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'laboratorio.html'));
});



//################################  Video Stream ################################//

// Remova os proxies individuais e use apenas:
app.use('/video', createProxyMiddleware({ 
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true
}));

//################################  Requisição de Dados ################################//

// Outros Endpoints Existentes
app.get('/data', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/data');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getCV', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getCV');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getCL', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getCL');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getCA1', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getCA1');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getCA2', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getCA2');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getCA3', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getCA3');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/Start', requireUser, async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/Start');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error performing other action:', error);
    res.status(500).send('Error performing other action');
  }
});

app.put('/NBolas', requireUser, async (req, res) => {
  try {
    let { value } = req.body;  // Extrai o valor do body

    value = parseInt(value);  // Converte a string para número
    
    if (isNaN(value)) {
      return res.status(400).json({ error: 'Invalid number' });  // Verifica se a conversão falhou
    }

    const response = await fetch('http://localhost:1880/NBolas', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error performing PUT request:', error);
    res.status(500).send('Error performing PUT request');
  }
});

app.put('/getCV', async (req, res) => {
  try {
    console.log('PUT request received:', req.body);
    let { value } = req.body;  // Extrai o valor do body

    value = parseInt(value);  // Converte a string para número
    
    if (isNaN(value)) {
      return res.status(400).json({ error: 'Invalid number' });  // Verifica se a conversão falhou
    }

    const response = await fetch('http://localhost:1880/NBolas', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error performing PUT request:', error);
    res.status(500).send('Error performing PUT request');
  }
});

app.get('/Velocidade', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getVelocidade');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/Tempo_Ligado', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getTempo_Ligado');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/Distancia_Percorrida', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getDistancia_Percorrida');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/Nivel_Bateria', async (req, res) => {
  try {
    const response = await fetch('http://localhost:1880/getNivel_Bateria');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

//################################  Cookies ################################//
// For todays date;
Date.prototype.today = function () { 
  return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
   return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}


app.put('/User', async (req, res) => {
  try {
    let { value } = req.body;  // Extrai o nome do usuário
    
    if (!value || typeof value !== 'string') {  // Verifica se "value" é uma string válida
      return res.status(400).json({ error: 'Nome inválido' });
    }
    var datetime = "LastSync: " + new Date().today() + " @ " + new Date().timeNow();
    console.log(datetime,' Cookie User Name:', value);  // Printa o nome do usuário no console do servidor

    res.json({ message: 'User logged successfully' });
  } catch (error) {
    console.error('Error performing PUT request:', error);
    res.status(500).send('Error performing PUT request');
  }
});

//################################  Email ################################//

const nodemailer = require('nodemailer');

// Configurando o transporte de email
let transporter = nodemailer.createTransport({
  service: 'gmail', // Ou outro serviço de email (ex: Outlook, Yahoo)
  auth: {
    user: 'jvpo.emailsender@gmail.com',
    pass: 'wskm huhk oumw qxnd' // Senha de App para maior segurança
  }
});

//################################  IP ################################//
let ip = '';

// Middleware para capturar o IP
app.use((req, res, next) => {
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('Endereço IP:', ip);
  next();
});

//################################  Hash e Autenticação ################################//
const bcrypt = require('bcrypt');
const saltRounds = 10;

const listaSenhas = []; // Senhas a serem hasheadas

for (const senha of listaSenhas) {
  const hash = bcrypt.hashSync(senha, saltRounds);
  console.log('Senha:', senha, 'Hash:', hash);
}

//#################################  Observação de Usuário ################################//

// Variáveis globais
let isOccupied = false;
let lastActiveTime = null;

// Middleware para verificar sessão
app.get('/check-session', (req, res) => {
  res.json({
    user: req.session.user,
    observer: req.session.observer
  });
});

// Atualizar última atividade
app.use((req, res, next) => {
  if (req.session.user) lastActiveTime = Date.now();
  next();
});

// Verificar inatividade a cada minuto
setInterval(() => {
  if (isOccupied && (Date.now() - lastActiveTime) > 15*60*1000) {
    isOccupied = false;
    console.log('Sistema liberado por inatividade');
  }
}, 60000);


//################################  Contagem de Observador ################################//

const activeObservers = new Map(); // Armazena sessionID e timestamp
let observerCount = 0;

app.get('/observer-count', (req, res) => {
  res.json({
    count: observerCount,
    maxCapacity: 50 // Defina o limite máximo desejado
  });
});

// Verificar observadores inativos a cada minuto
setInterval(() => {
  const now = Date.now();
  activeObservers.forEach((timestamp, sessionID) => {
    if (now - timestamp > 15 * 60 * 1000) { // 15 minutos de inatividade
      activeObservers.delete(sessionID);
      observerCount = activeObservers.size;
      console.log(`Observador removido. Total: ${observerCount}`);
    }
  });
}, 60000);

//################################  Autenticação ################################//
// Rota para login observer
app.post('/loginObserver', (req, res) => {
  try {
    if (isOccupied) {
      req.session.observer = true;
      
      // Salvar sessão antes de responder
      req.session.save(err => {
        if (err) {
          console.error('Erro na sessão:', err);
          return res.status(500).json({message: 'Erro interno'});
        }

        // Registrar observador
        activeObservers.set(req.sessionID, Date.now());
        observerCount = activeObservers.size;
        
        console.log('Observador conectado:', req.sessionID);
        return res.json({
          message: 'Login observador realizado',
          redirect: '/laboratorio'
        });
      });
      
    } else {
      return res.status(403).json({
        message: 'Sistema disponível. Faça login completo para controle'
      });
    }
  } catch (error) {
    console.error('Erro no endpoint:', error);
    return res.status(500).json({message: 'Erro interno no servidor'});
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Caminho do arquivo users.txt
  const usersFilePath = path.join(__dirname, 'users.txt');

  // Lê o arquivo users.txt
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    // Divide as linhas do arquivo em um array, e remove linhas vazias
    const users = data.split('\n').filter(line => line.trim() !== '');

    // Verifica se as credenciais estão corretas
    let isAuthenticated = false;

    users.forEach(user => {
      const [fileUsername, filePassword] = user.split(':');
      if (fileUsername.trim() === username && bcrypt.compareSync(password, filePassword.trim())) {
        isAuthenticated = true;
      }
    });

    if (isAuthenticated) {
      if (isOccupied) {
        return res.status(403).json({ message: 'Sistema em uso. Acesse como observador.' });
      }
      isOccupied = true;
      lastActiveTime = Date.now();
    }

    if (isAuthenticated) {
      req.session.user = username; // Salva o usuário na sessão
      res.status(200).json({ message: 'Login bem-sucedido!' });
      var datetime = "LastSync: " + new Date().today() + " @ " + new Date().timeNow();
      console.log(datetime,' User Name:', req.session.user);  // Printa o nome do usuário no console do servidor
      const emailList = ['jvpomigliooliveira@gmail.com', 'labpsp@fem.unicamp.br', 'k247218@dac.unicamp.br'];

      for (const email of emailList) {
        // Configurando os detalhes do email
        let mailOptions = {
          from: 'jvpo.emailsender@gmail.com',
          to: email,
          subject: 'Acesso ao Multi Usuario',
          text: 'TimeStamp: '+datetime+'\nUsuario logado: '+req.session.user+'\nEndereço IP: '+ip
        };
        // Enviar o email
        if (req.session.user != 'admin') {
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email enviado: ' + info.response);
            }
          });
        }
      }
    } else {
      res.status(401).json({ message: 'Credenciais inválidas!' });
    }
  });
});

//################################  Loop ################################//

server.listen(443, '143.106.61.223', () => {
  console.log(`HTTPS Server listening on port ${443}`);
});

httpServer.listen(80, '143.106.61.223', () => {
  console.log(`HTTP Server listening on port ${80}`);
});
