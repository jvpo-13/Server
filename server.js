const http = require('http');
const https = require('https');
const fs = require('fs');
const child_process = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const express = require('express');
const compression = require('compression');
//const helmet = require('helmet');
const app = express();

// ======== CONFIGURAÇÃO DE COMPRESSÃO ======== //
app.use(compression({
  level: 9, // Nível de compressão (1-9)
  threshold: 0, // Comprime todos os recursos
  filter: (req, res) => {
    // Habilita compressão para CSS/JS mesmo se houver outros middlewares
    return /text|javascript|css/.test(res.getHeader('Content-Type'));
  }
}));

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), payment=()"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Multi-Usuário Thomas HD2D',
      version: '1.0.0',
      description: 'Documentação completa da API do sistema multi-usuário',
    },
    servers: [
      { url: 'https://hd2d.fem.unicamp.br' },
      { url: 'https://hd2d.fem.unicamp.br/login' }
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'labSession',
          description: 'Cookie de sessão autenticada'
        }
      }
    }
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const session = require('express-session');

// Habilita o CORS
const cors = require('cors');
/*
app.use(cors({
  origin: 'https://hd2d.fem.unicamp.br',
  credentials: true,
  methods: ['GET', 'POST', 'PUT']
}));
*/

app.use(cors({
  origin: ['https://hd2d.fem.unicamp.br', 'http://143.106.61.229:80'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT'],
  exposedHeaders: ['Content-Encoding', 'Cache-Control', 'Content-Type'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept', 'Sec-WebSocket-Protocol']
}));

app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string') {
      const ext = path.extname(req.path);
      if (ext === '.css') this.set('Content-Type', 'text/css');
      if (ext === '.js') this.set('Content-Type', 'application/javascript');
    }
    originalSend.call(this, body);
  };
  next();
});

const options = {
  key: fs.readFileSync('C:/Certbot/live/hd2d.fem.unicamp.br/privkey.pem'),
  cert: fs.readFileSync('C:/Certbot/live/hd2d.fem.unicamp.br/fullchain.pem'),
};

const httpServer = http.createServer(app);
const server = https.createServer(options, app);

// Configura o Express.js para servir arquivos estáticos da pasta 'public'
const publicPath = path.join(__dirname, 'public');
const thomasPath = path.join(__dirname, 'thomas');
const nodePath = path.join(__dirname, 'node_modules');

//app.use('/', express.static(publicPath));
// Configuração existente - modifique para:
app.use('/', express.static(publicPath, {
  immutable: true, // Para versões com hash no nome do arquivo
  maxAge: '1y', // 31536000 segundos
  setHeaders: (res, path) => {
    res.setHeader(
      'Cache-Control', 
      path.endsWith('.css') || path.endsWith('.js') 
        ? 'public, max-age=31536000, immutable' 
        : 'public, max-age=604800' // 1 semana para outros arquivos
    );
  }
}));
app.use('/', express.static(thomasPath));
app.use('/', express.static(nodePath));
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
  if (req.session.user || req.session.observer) return next(); // Permite usuários e observadores
  res.status(403).sendFile(path.join(__dirname, 'thomas', 'login.html'));
};

app.get('/login', async (req, res) => {
  return res.sendFile(path.join(__dirname, 'thomas', 'login.html'));
});

//################################  Hash e Autenticação ################################//
// Adicione no início do arquivo
require('dotenv').config();

// Modifique a seção de Hash e Autenticação
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Carrega usuários do .env
const loadUsers = () => {
  try {
    return JSON.parse(process.env.USERS || '{}');
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return {};
  }
};


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticação de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Sistema em uso
 *       500:
 *         description: Erro no servidor
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  try {
    if (!username || !password) {
      return res.status(401).json({ message: 'Credenciais inválidas!' });
    }

    // Verifica se o usuário existe e compara a senha
    if (users[username] && bcrypt.compareSync(password, users[username])) {
      if (isOccupied) {
        return res.status(403).json({ message: 'Sistema em uso. Acesse como observador.' });
      }
      
      isOccupied = true;
      lastActiveTime = Date.now();
      req.session.user = username;
      
      var datetime = "LastSync: " + new Date().today() + " @ " + new Date().timeNow();
      console.log(datetime,' User Name:', req.session.user);  // Printa o nome do usuário no console do servidor
      const emailList = ['jvpomigliooliveira@gmail.com', 'labpsp@fem.unicamp.br'];

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

      return res.status(200).json({ message: 'Login bem-sucedido!' });
    }

    return res.status(401).json({ message: 'Credenciais inválidas!' });
    
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.use((req, res, next) => {
  if (req.path === '/robots.txt')
    return res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
  else if (req.path === '/sitemap.xml')
    return res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
  else{
    if (!req.secure) {
      //HTTPS:
      console.log('Requisição insegura. Redirecionando para HTTPS...');
      return res.redirect(301,`https://hd2d.fem.unicamp.br${req.url}`);
    } else {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Permissions-Policy', 'geolocation=()');
    }

    // Atualizar timestamp do observador
    if (req.session?.observer && activeObservers.has(req.sessionID)) {
      activeObservers.set(req.sessionID, Date.now());
    }

    if (req.session?.user || req.session?.observer) {
      return next();
    }
    next();
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial com autenticação automática
 *     tags: [Autenticação]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirecionamento baseado nas credenciais
 *       500:
 *         description: Erro interno
 */
app.get('/', async (req, res) => {
  if (req.path === '/robots.txt')
    return res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
  else if (req.path === '/sitemap.xml')
    return res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
  else{
    const { username, password, page } = req.query; // Captura credenciais enviadas na query string
    // Valide as credenciais (exemplo básico)
    if (username === 'admin' && password === 'admin'){
      // Cria a sessão para o usuário
      req.session.user = username;
      console.log(`Login automático realizado para o usuário: ${username}`);
      return res.redirect('/thomas');
    }
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
}
});


//################################  Login Observador ################################//
/**
 * @swagger
 * /loginObserver:
 *   post:
 *     summary: Login como observador
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Login observador realizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 redirect:
 *                   type: string
 *       403:
 *         description: Sistema disponível para login completo
 *       500:
 *         description: Erro interno
 */
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
          redirect: '/thomas?observer=true' // Adicione um parâmetro para identificação
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

//############################### Chat com IA ################################//
const axios = require('axios');

app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(
      'http://143.106.61.220:1234/v1/chat/completions',
      {
        messages: [{ role: 'user', content: req.body.prompt }],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      },
      { timeout: 30*60000 } // Timeout de 30 segundos
    );

    res.json({ response: response.data.choices[0].message.content });

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ error: 'Erro na comunicação com a IA' });
  }
});

// Proxy para WebSocket do LM Studio (se necessário)
app.use('/chat-ws', createProxyMiddleware({ 
  target: 'ws://localhost:1234',
  ws: true,
  changeOrigin: true
}));


/**
 * @swagger
 * /thomas:
 *   get:
 *     summary: Página principal do sistema Thomas
 *     tags: [Navegação]
 *     responses:
 *       200:
 *         description: Retorna a página Thomas
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/thomas', requireUser, async (req, res) => {
  return res.sendFile(path.join(__dirname, 'thomas', 'thomas.html'));
});

/**
 * @swagger
 * /pipefa:
 *   get:
 *     summary: Página do sistema Pipefa
 *     tags: [Navegação]
 *     responses:
 *       200:
 *         description: Retorna a página Pipefa
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/pipefa', async (req, res) => {
  return res.sendFile(path.join(__dirname, 'pipefa', 'pipefa.html'));
});

/**
 * @swagger
 * /home:
 *   get:
 *     summary: Página inicial pública
 *     tags: [Navegação]
 *     responses:
 *       200:
 *         description: Retorna a página home
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/home', async (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

//################################  Video Stream ################################//

/**
 * @swagger
 * /video:
 *   get:
 *     summary: Proxy para transmissão de vídeo
 *     tags: [Video]
 *     responses:
 *       200:
 *         description: Conexão de vídeo estabelecida
 */
app.use('/video', createProxyMiddleware({ 
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true
}));

/**
 * @swagger
 * /camera-ip:
 *   get:
 *     summary: Visualização da câmera IP via HTTP tunneling
 *     tags: [Video]
 *     responses:
 *       200:
 *         description: Página de visualização
 */
app.get('/camera', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'camera.html'));
});


//################################  TCP Socket Server ################################//
const net = require('net');
var receivedData = {};
const tcpConnections = new Map();
// Cria servidor TCP para comunicação com Plant Simulation
const tcpServer = net.createServer((socket) => {
  const connectionId = `${socket.remoteAddress}:${socket.remotePort}`;
  tcpConnections.set(connectionId, socket);
  console.log('Plant Simulation connected:', socket.remoteAddress, socket.remotePort);

  // Configura codificação
  socket.setEncoding('utf8');

  // Handler de dados recebidos
  socket.on('data', (data) => {
    try {
      const rawData = data.toString().trim();
      console.log('Dados brutos recebidos:', rawData);

      // Parseia JSON
      receivedData = JSON.parse(rawData);
      console.log('Dados recebidos:', receivedData);
      
      // Valida token
      if(receivedData.token !== '123456') {
          return socket.write(JSON.stringify({
              status: 401,
              message: 'Token inválido!'
          }) + '\n');
      }
    } catch (error) {
        console.error('Erro no processamento:', error);
    }
  });

  // Handler de desconexão
  socket.on('end', () => {
    tcpConnections.delete(connectionId);
    console.log('Plant Simulation disconnected');
  });
});

// Inicia servidor TCP na porta 30000
const port = 30000;
const host = '143.106.61.223'
tcpServer.listen(port, host, () => {
  console.log('TCP Server listening on ', host,': ', port);
});

//################################  Requisição de Dados ################################//

/**
 * @swagger
 * /getAllData:
 *   get:
 *     summary: Obter todos os dados do sistema
 *     description: Retorna todos os valores de operação do sistema em formato JSON
 *     tags: [Dados]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Dados completos do sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 CV:
 *                   type: boolean
 *                   example: true
 *                 CL:
 *                   type: boolean
 *                   example: false
 *                 CA1:
 *                   type: boolean
 *                   example: true
 *                 CA2:
 *                   type: boolean
 *                   example: false
 *                 CA3:
 *                   type: boolean
 *                   example: true
 *                 Velocidade:
 *                   type: number
 *                   format: float
 *                   example: 25.5
 *                 Tempo_Ligado:
 *                   type: number
 *                   example: 120
 *                 Distancia_Percorrida:
 *                   type: number
 *                   example: 1500
 *                 Nivel_Bateria:
 *                   type: number
 *                   example: 75
 *                 status:
 *                   type: string
 *                   example: "ativo"
 *                 timestamp:
 *                   type: integer
 *                   example: 1718901234567
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno ao buscar dados completos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch complete data"
 */
app.get('/getAllData', async (req, res) => {
  try {
    /*
    const response = await fetch('http://localhost:1880/getData');
    const data = await response.json();*/
    res.json(receivedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch complete data' });
  }
});

app.use('/girafinha', express.static(path.join(__dirname, 'public')));

app.use('/bracorobotico', createProxyMiddleware({ 
  target: 'http://143.106.61.229:80/',
  changeOrigin: true,
  ws: true,/*
  pathRewrite: {
    '^/bracorobotico': '/', // Remove o prefixo da rota
  },*/
  onProxyRes: (proxyRes) => {
    // Corrige headers de conteúdo para recursos estáticos
    if (proxyRes.headers['content-type']?.includes('text/html')) {
      const path = proxyRes.req.path;
      if (path.endsWith('.css')) {
        proxyRes.headers['content-type'] = 'text/css';
      } else if (path.endsWith('.js')) {
        proxyRes.headers['content-type'] = 'application/javascript';
      }
    }
  }
}));


/**
 * @swagger
 * /StartSystem:
 *   post:
 *     summary: Inicia sistema com todos os parâmetros
 *     tags: [Controle]
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nbolas:
 *                 type: integer
 *               operator:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sistema iniciado com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno
 */
app.post('/StartSystem', requireUser, async (req, res) => {
  try {
      const { nbolas, operator } = req.body;
  
      // Validações
      if (!operator || !/^[A-Za-z0-9 ]{4,24}$/.test(operator)) {
          return res.status(400).json({ error: 'Nome do operador inválido' });
      }

      if (isNaN(nbolas) || nbolas % 4 !== 0 || nbolas > 20) {
          return res.status(400).json({ error: 'Valor de NBolas inválido' });
      }

      // Envia START
      const startCommand = {
          token: '123456',
          command: 'START',
          nbolas: parseInt(nbolas),
          operator: operator
      };

      // Executa comandos no TCP
      tcpConnections.forEach((socket) => {
          socket.write(JSON.stringify(startCommand) + '\n');
      });

      // Registra log (mantenha sua lógica existente)
      isLogging = true;
      //isLogging = false;
      if (logInterval) clearInterval(logInterval);
      logData = [];
      startLogging(req.session.user);

      res.json({ 
          status: 'Sistema iniciado',
          nbolas,
          operator
      });

  } catch (error) {
      console.error('Erro no StartSystem:', error);
      res.status(500).send('Erro interno');
  }
});


//################################ XLSX ################################//

const XLSX = require('xlsx');
let isLogging = false;
let logData = [];
let logInterval;
const logFilePath = path.join(__dirname, 'operation_log.xlsx');

// 1. Lista de campos a serem excluídos do log
const EXCLUDED_FIELDS = ['token', 'status']; // Adicione outros campos conforme necessário

// 2. Variável para armazenar o último estado registrado
let lastLoggedData = {};

// Modifique a função initializeLogFile
function initializeLogFile(user) {
  const workbook = XLSX.utils.book_new();
  
  // Filtra os campos relevantes
  const filteredData = filterData(receivedData);
  
  // Cria planilha de metadados
  const metadataSheet = XLSX.utils.aoa_to_sheet([
    ["Usuário", user],
    ["Início", new Date().toISOString()],
    ["Campos Registrados", Object.keys(filteredData).join(", ")]
  ]);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, "Metadados");

  // Cria planilha principal com cabeçalhos filtrados
  const header = ["timestamp", ...Object.keys(filteredData)];
  const dataSheet = XLSX.utils.json_to_sheet([], { header });
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Dados Operacionais");

  XLSX.writeFile(workbook, logFilePath);
}

// Função para filtrar dados
function filterData(data) {
  const filtered = {...data};
  EXCLUDED_FIELDS.forEach(field => delete filtered[field]);
  return filtered;
}

// Função para comparar dados
function hasChanges(newData, lastData) {
  const keys = Object.keys(newData);
  if (keys.length !== Object.keys(lastData).length) return true;
  
  return keys.some(key => 
    newData[key] !== lastData[key] &&
    key !== 'timestamp' // Ignora o timestamp na comparação
  );
}

// Atualize a função startLogging
function startLogging(user) {
  if (fs.existsSync(logFilePath)) fs.unlinkSync(logFilePath);
  initializeLogFile(user);
  lastLoggedData = {}; // Reseta o último estado

  logInterval = setInterval(async () => {
    if (isLogging && Object.keys(receivedData).length > 0) {
      const filteredData = filterData(receivedData);
      const newEntry = {
        timestamp: new Date().toISOString(),
        ...filteredData
      };

      // Verifica mudanças
      if (hasChanges(filteredData, lastLoggedData)) {
        const workbook = XLSX.readFile(logFilePath);
        const worksheet = workbook.Sheets["Dados Operacionais"];
        
        XLSX.utils.sheet_add_json(worksheet, [newEntry], {
          skipHeader: true,
          origin: -1
        });
        
        XLSX.writeFile(workbook, logFilePath);
        lastLoggedData = filteredData; // Atualiza último estado
      }
    }
  }, 100);
}

/**
 * @swagger
 * /download-log:
 *   get:
 *     summary: Download do log de operação
 *     tags: [Dados]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Arquivo XLS de log
 *         content:
 *           application/vnd.ms-excel:
 *             schema:
 *               type: string
 *       404:
 *         description: Arquivo não encontrado
 */
app.get('/download-log', requireUser, (req, res) => {
  if (!fs.existsSync(logFilePath)) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'errors', '404.html'));
  }

  const username = req.session.user || 'unknown';
  const date = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const filename = `log_${username}_${date}.xlsx`; // Nome formatado

  res.download(logFilePath, filename, (err) => {
    if (err) console.error('Erro no download:', err);
  });
});

//################################  Arquivos para download ################################//


const archiver = require('archiver');

// Cria rota para download dos arquivos
/**
 * @swagger
 * /download-files:
 *   get:
 *     summary: Download de todos os arquivos em formato ZIP
 *     tags: [Dados]
 *     responses:
 *       200:
 *         description: Arquivo ZIP com todos os arquivos
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Erro ao gerar o ZIP
 */
app.get('/download-files', (req, res) => {
  try {
    // Configura o caminho da pasta com os arquivos
    const folderPath = path.join(__dirname, 'DataSafeMV');
    
    // Cria o arquivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 } // Máxima compressão
    });

    // Configura headers da resposta
    res.attachment('Dados_do_Sistema.zip');
    archive.pipe(res);

    // Adiciona todos os arquivos da pasta ao ZIP
    archive.directory(folderPath, false);

    // Finaliza a criação do ZIP
    archive.finalize();

  } catch (error) {
    console.error('Erro ao gerar ZIP:', error);
    res.status(500).send('Erro ao gerar arquivo ZIP');
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

//################################  Cookies ################################//
// For todays date;
Date.prototype.today = function () { 
  return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
   return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

/**
 * @swagger
 * /User:
 *   put:
 *     summary: Registrar usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário registrado
 *       400:
 *         description: Nome inválido
 *       500:
 *         description: Erro interno
 */
app.put('/User', async (req, res) => {
  try {
    let { value } = req.body;  // Extrai o nome do usuário
    
    if (!value || typeof value !== 'string') {  // Verifica se "value" é uma string válida
      return res.status(400).json({ error: 'Nome inválido' });
    }
    var datetime = "LastSync: " + new Date().today() + " @ " + new Date().timeNow();
    console.log('Endereço IP:', ip, datetime,' Cookie User Name:', value);  // Printa o nome do usuário no console do servidor
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

//#################################  Observação de Usuário ################################//

// Variáveis globais
let isOccupied = false;
let lastActiveTime = null;

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
  if (isOccupied && (Date.now() - lastActiveTime) > 60*1000) {
    isOccupied = false;
    console.log('Sistema liberado por inatividade');
  }
}, 60000);


//################################  Contagem de Observador ################################//

const activeObservers = new Map(); // Armazena sessionID e timestamp
let observerCount = 0;

/**
 * @swagger
 * /observer-count:
 *   get:
 *     summary: Contagem de observadores ativos
 *     tags: [Monitoramento]
 *     responses:
 *       200:
 *         description: Dados de contagem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 maxCapacity:
 *                   type: integer
 */
app.get('/observer-count', (req, res) => {
  res.json({
    count: observerCount,
    maxCapacity: 50 // Defina o limite máximo desejado
  });
});


// Verificar observadores inativos a cada segundo
setInterval(() => {
  const now = Date.now();
  activeObservers.forEach((timestamp, sessionID) => {
    if (now - timestamp > 1000) { // 1 segundo de inatividade
      activeObservers.delete(sessionID);
      observerCount = activeObservers.size;
      console.log(`Observador removido. Total: ${observerCount}`);
    }
  });
}, 1000);

//################################  Middleware 404 ################################//
// (SEMPRE o último middleware!!!!!)
app.use((req, res, next) => {
  // Verificação adicional para arquivos estáticos
  const filePath = path.join(__dirname, 'public', req.path);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
      if(err) {
          // Arquivo realmente não existe
          res.status(404).sendFile(path.join(__dirname, 'public', 'errors', '404.html'));
      } else {
          // Se o arquivo existe mas não foi capturado, passa adiante
          next();
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
