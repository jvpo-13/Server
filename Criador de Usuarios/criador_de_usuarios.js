require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Validação dos argumentos
if (process.argv.length < 4) {
    console.error('Erro: Argumentos insuficientes!');
    console.log('Uso: node criador_de_usuarios.js <usuário> <senha>');
    process.exit(1);
}

const usuario = process.argv[2];
const senha = process.argv[3];

// Validação básica
if (!usuario || !senha) {
    console.error('Erro: Usuário e senha são obrigatórios!');
    process.exit(1);
}

// Carrega ou inicializa os usuários
let users = {};
if (process.env.USERS) {
    try {
        users = JSON.parse(process.env.USERS);
    } catch (e) {
        console.error('Erro ao ler usuários do .env:', e.message);
        process.exit(1);
    }
}

// Verifica se usuário já existe
if (users[usuario]) {
    console.error('Erro: Usuário já existe!');
    process.exit(1);
}

// Gera hash e adiciona ao objeto
const hash = bcrypt.hashSync(senha, saltRounds);
users[usuario] = hash;

// Atualiza o .env
const envContent = Object.entries(users)
    .map(([user, hash]) => `USERS=${JSON.stringify(users)}`)
    .join('\n');

fs.writeFileSync('.env', `USERS=${JSON.stringify(users)}\n`, { flag: 'w' });

console.log(`Usuário "${usuario}" adicionado com sucesso!`);