import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Check if the necessary environment variables are defined
if (!TELEGRAM_TOKEN) {
    throw new Error('TELEGRAM_TOKEN environment variable is not defined');
}
if (!TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID environment variable is not defined');
}
if(!TELEGRAM_API_URL) {
    throw new Error('TELEGRAM_API_URL environment variable is not defined');
}

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

// List of valid GitHub events
const validEvents = ['push', 'pull_request', 'issues', 'issue_comment', 'watch'];

// Endpoint to receive GitHub webhooks
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event']; // Type of event (push, pull_request, etc.)
    const payload = req.body;

    // Validate the event type
    if (!event) {
        return res.status(400).send('Event not defined');
    }
    if (!validEvents.includes(event)) {
        return res.status(400).send('Unrecognized event');
    }

    // Validate the payload structure according to the event type
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

    // Create a generic message for any event
    let message = `📢 New interaction in the repository!\n\n`;
    message += `🔔 **Event:** ${event}\n`;
    message += `📂 **Repository:** ${payload.repository.full_name}\n`;

    // Add specific details according to the event type
    switch (event) {
        case 'push':
            message += `👤 **Author:** ${payload.pusher.name}\n`;
            message += `🔀 **Branch:** ${payload.ref}\n`;
            message += `📝 **Commits:** ${payload.commits.length}\n`;
            message += `📄 **Commit details:**\n`;
            payload.commits.forEach((commit, index) => {
                message += `  - Commit ${index + 1}: ${commit.message} (${commit.id})\n`;
            });
            break;
        case 'pull_request':
            message += `👤 **User:** ${payload.sender.login}\n`;
            message += `📝 **Action:** ${payload.action}\n`;
            message += `📄 **Title:** ${payload.pull_request.title}\n`;
            message += `🔀 **Base branch:** ${payload.pull_request.base.ref}\n`;
            message += `🔀 **Head branch:** ${payload.pull_request.head.ref}\n`;
            message += `📝 **State:** ${payload.pull_request.state}\n`;
            message += `🔗 **PR URL:** ${payload.pull_request.html_url}\n`;

            // Notify when a PR is merged
            if (payload.action === 'closed' && payload.pull_request.merged) {
                message += `🎉 **PR merged!**\n`;
            }
            break;
        case 'issues':
            message += `👤 **User:** ${payload.sender.login}\n`;
            message += `📝 **Action:** ${payload.action}\n`;
            message += `📄 **Title:** ${payload.issue.title}\n`;

            // Notify when an issue is closed
            if (payload.action === 'closed') {
                message += `🔒 **Issue closed!**\n`;
            }
            break;
        case 'issue_comment':
            message += `👤 **User:** ${payload.sender.login}\n`;
            message += `📝 **Action:** ${payload.action}\n`;
            message += `📄 **Comment:** ${payload.comment.body}\n`;
            message += `🔗 **Comment URL:** ${payload.comment.html_url}\n`;

            // Notify if there is a mention in the comment
            if (payload.comment.body.includes('@')) {
                message += `👀 **Mentions in the comment!**\n`;
            }
            break;
        case 'watch':
            message += `👤 **User:** ${payload.sender.login}\n`;
            message += `⭐ **Action:** ${payload.action}\n`;
            break;
    }

    // Send message to Telegram with retries
    const sendMessage = async (retries = 3) => {
        try {
            await axios.post(TELEGRAM_API_URL, {
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            });
            console.log('Message sent:', message);
            res.status(200).send('OK');
        } catch (err) {
            if (retries > 0) {
                console.warn(`Error sending message, retrying... (${retries} attempts left)`, err);
                const delay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff delay
                setTimeout(() => sendMessage(retries - 1), delay);
            } else {
                console.error('Error sending message after multiple attempts:', err);
                res.status(500).send('Error sending message to Telegram');
            }
        }
    };

    sendMessage();
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
