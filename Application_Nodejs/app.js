const http = require('http');
const os = require('os');
const { Pool } = require('pg');
const startTime = Date.now();

function getUptime() {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    return `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const networkInterfaces = os.networkInterfaces();
const addresses = [];

const serverPort = 8080;

Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(address => {
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    });
});

const server = http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const colorBackground = 'black'
    const textColor = 'white'

    if (req.url === '/connect-db') {
        try {
            // Verifica a conexão com o banco de dados
            await pool.query('SELECT 1');
            res.write('Conexão com o banco de dados: OK');
        } catch (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            res.write('Erro ao conectar ao banco de dados');
        }
        res.end();
    } else {
        const html =
            `<html>
    <head>
        <title>Server ${addresses[0]} </title>
        <link rel="preconnect" href="https://fonts.googleapis.com"> 
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300&display=swap" rel="stylesheet">
        <style>html,body{font-family:'Lato',sans-serif;color:${textColor};background-color:${colorBackground};display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;text-align:center;h1:font-size:30px}</style>
    </head>
    <body>
        <h1>Server running ${os.userInfo().username}@${addresses[0]}</h1>
        <button onclick="connectDB()">Conectar ao Banco de Dados</button>
        <p id="db-status"></p>
        <p>Uptime: ${getUptime()}</p>
        <script>
          function connectDB() {
            fetch('/connect-db')
              .then(response => response.text())
              .then(text => {
                const statusElement = document.getElementById('db-status');
                statusElement.innerHTML = text;
              })
              .catch(error => {
                console.error('Erro ao conectar ao banco de dados:', error);
                const statusElement = document.getElementById('db-status');
                statusElement.innerHTML = 'Erro ao conectar ao banco de dados';
              });
          }
            setTimeout(function() {
                location.reload();
            }, 2000);
        </script>
    </body>
</html>`;
        res.end(html);
    }
});


server.listen(serverPort, () => {
    console.log(`Server @ ${addresses[0]}:${serverPort} - PID ${process.pid.toString()}`);
});
