import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Configuración del bot de Telegram usando variables de entorno
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // Token de Telegram
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // ID de chat de Telegram
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

if (!TELEGRAM_TOKEN) {
    throw new Error('TELEGRAM_TOKEN environment variable is not defined');
}
if (!TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID environment variable is not defined');
}


// Lista de eventos válidos
const validEvents = ['push', 'pull_request', 'issues', 'issue_comment', 'watch'];

// Endpoint para recibir webhooks de GitHub
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event']; // Tipo de evento (push, pull_request, etc.)
    const payload = req.body;

    // Validar el tipo de evento
    if (!event) {
        return res.status(400).send('Evento no definido');
    }
    if (!validEvents.includes(event)) {
        return res.status(400).send('Evento no reconocido');
    }

    // Validar la estructura del payload según el tipo de evento
    if (!payload.repository || !payload.repository.full_name) {
        return res.status(400).send('Invalid payload: missing repository information');
    }

    switch (event) {
        case 'push':
            if (!payload.pusher || !payload.commits) {
                return res.status(400).send('Invalid payload: missing push information');
            }
            break;
        case 'pull_request':
            if (!payload.sender || !payload.pull_request) {
                return res.status(400).send('Invalid payload: missing pull request information');
            }
            break;
        case 'issues':
            if (!payload.sender || !payload.issue) {
                return res.status(400).send('Invalid payload: missing issue information');
            }
            break;
        case 'issue_comment':
            if (!payload.sender || !payload.comment) {
                return res.status(400).send('Invalid payload: missing comment information');
            }
            break;
        case 'watch':
            if (!payload.sender) {
                return res.status(400).send('Invalid payload: missing watch information');
            }
            break;
    }

    // Crear un mensaje genérico para cualquier evento
    let message = `📢 ¡Nueva interacción en el repositorio!\n\n`;
    message += `🔔 **Evento:** ${event}\n`;
    message += `📂 **Repositorio:** ${payload.repository.full_name}\n`;

    // Añadir detalles específicos según el tipo de evento
    switch (event) {
        case 'push':
            message += `👤 **Autor:** ${payload.pusher.name}\n`;
            message += `🔀 **Rama:** ${payload.ref}\n`;
            message += `📝 **Commits:** ${payload.commits.length}\n`;
            message += `📄 **Detalles de los commits:**\n`;
            payload.commits.forEach((commit, index) => {
                message += `  - Commit ${index + 1}: ${commit.message} (${commit.id})\n`;
            });
            break;
        case 'pull_request':
            message += `👤 **Usuario:** ${payload.sender.login}\n`;
            message += `📝 **Acción:** ${payload.action}\n`;
            message += `📄 **Título:** ${payload.pull_request.title}\n`;
            message += `🔀 **Rama base:** ${payload.pull_request.base.ref}\n`;
            message += `🔀 **Rama de head:** ${payload.pull_request.head.ref}\n`;
            message += `📝 **Estado:** ${payload.pull_request.state}\n`;
            message += `🔗 **URL del PR:** ${payload.pull_request.html_url}\n`;

            // Notificar cuando se acepta un PR (se fusiona)
            if (payload.action === 'closed' && payload.pull_request.merged) {
                message += `🎉 **¡PR fusionado!**\n`;
            }
            break;
        case 'issues':
            message += `👤 **Usuario:** ${payload.sender.login}\n`;
            message += `📝 **Acción:** ${payload.action}\n`;
            message += `📄 **Título:** ${payload.issue.title}\n`;

            // Notificar cuando se cierra un issue
            if (payload.action === 'closed') {
                message += `🔒 **¡Issue cerrado!**\n`;
            }
            break;
        case 'issue_comment':
            message += `👤 **Usuario:** ${payload.sender.login}\n`;
            message += `📝 **Acción:** ${payload.action}\n`;
            message += `📄 **Comentario:** ${payload.comment.body}\n`;
            message += `🔗 **URL del comentario:** ${payload.comment.html_url}\n`;

            // Notificar si hay una mención en el comentario
            if (payload.comment.body.includes('@')) {
                message += `👀 **¡Menciones en el comentario!**\n`;
            }
            break;
        case 'watch':
            message += `👤 **Usuario:** ${payload.sender.login}\n`;
            message += `⭐ **Acción:** ${payload.action}\n`;
            break;
    }

    // Enviar mensaje a Telegram con reintentos
    const sendMessage = async (retries = 3) => {
        try {
            await axios.post(TELEGRAM_API_URL, {
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            });
            console.log('Mensaje enviado:', message);
            res.status(200).send('OK');
        } catch (err) {
            if (retries > 0) {
                console.warn(`Error enviando mensaje, reintentando... (${retries} intentos restantes)`, err);
                const delay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff delay
                setTimeout(() => sendMessage(retries - 1), delay);
            } else {
                console.error('Error enviando mensaje después de varios intentos:', err);
                res.status(500).send('Error enviando mensaje a Telegram');
            }
        }
    };

    sendMessage();
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
