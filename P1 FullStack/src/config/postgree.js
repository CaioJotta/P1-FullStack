require('dotenv').config(); 
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.PG_URI,  
});

client.connect()
    .then(() => {
        console.log('PostgreSQL conectado com sucesso!');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao PostgreSQL:', err.stack);
    });

module.exports = { client, };