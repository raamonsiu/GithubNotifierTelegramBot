# GitHub Webhook to Telegram Notifications Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This project is a Node.js server that listens to GitHub webhooks and sends real-time notifications to Telegram about repository activities. It supports events such as **pushes**, **pull requests**, **issues**, **issue comments**, and **watches**. The bot provides detailed messages for each event, including commit details, PR status, issue actions, and mentions in comments.

---

## Features

- **Real-time notifications**: Get instant updates on repository activities.
- **Event support**: Handles `push`, `pull_request`, `issues`, `issue_comment`, and `watch` events.
- **Detailed messages**: Includes relevant details like commit messages, PR titles, issue actions, and more.
- **Error handling**: Implements retries with exponential backoff for reliable message delivery.
- **Easy setup**: Configure with your Telegram bot token and chat ID.

---

## Technologies Used

- **Node.js**: Backend server to handle webhooks.
- **Express.js**: Framework for building the web server.
- **Axios**: HTTP client for sending messages to Telegram.
- **Telegram Bot API**: Sends notifications to your Telegram chat.

---

## How to Recreate This Project

Follow these steps to set up your own GitHub to Telegram notifications bot:

### 1. Prerequisites

- A **GitHub account**.
- A **Telegram account** and a bot created via [BotFather](https://core.telegram.org/bots#botfather).
- **Node.js** installed on your machine.
- A tool like **ngrok** or a hosting service (e.g., Render, Heroku) to expose your server to the internet.

### 2. Set Up the Telegram Bot

1. Open Telegram and search for **BotFather**.
2. Use the `/newbot` command to create a new bot.
3. Save the **bot token** provided by BotFather.
4. Start a chat with your bot and send a message to it.
5. Use the following URL to get your **chat ID** (replace `YOUR_BOT_TOKEN` with your actual token): https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
6. Look for the `id` field in the response under `chat`.

### 3. Clone the Repository

```bash
git clone https://github.com/your-username/github-telegram-bot.git
cd github-telegram-bot
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

TELEGRAM_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

### 6. Run the Server Locally

```bash
node index.js
```

### 7. Expose Your Server to the Internet

```bash
ngrok http 3000
```
Copy the HTTPS URL provided by ngrok (e.g., https://abc123.ngrok.io).

### 8. Set Up GitHub Webhooks

1. **Go to your GitHub repository**:
   - Open your repository on GitHub.

2. **Navigate to Settings > Webhooks > Add webhook**:
   - Click on the "Settings" tab in your repository.
   - Select "Webhooks" from the sidebar.
   - Click on the "Add webhook" button.

3. **Configure the webhook**:
   - **Payload URL**: Enter your ngrok URL followed by `/webhook` (e.g., `https://abc123.ngrok.io/webhook`).
   - **Content type**: Set to `application/json`.
   - **Events**: Select the events you want to receive (e.g., `push`, `pull_request`, `issues`, etc.).
   - **Secret**: (Optional) Add a secret for added security.

4. **Save the webhook**:
   - Click the "Add webhook" button to save your configuration.

### 9. Test the Bot

Perform actions in your repository (e.g., push code, create a pull request, comment on an issue) and check your Telegram chat for notifications.

## Repository Structure

github-telegram-bot/  
├── index.js            # Main server logic  
├── package.json        # Node.js dependencies  
├── README.md           # Project documentation  
├── .env.example        # Example environment variables  
└── .gitignore          # Files and folders to ignore  

## How to Contribute

Contributions are welcome! 🎉 If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

### Steps to Contribute

1. **Fork the repository**:
   - Click the "Fork" button at the top right of the repository page. This will create a copy of the repository under your GitHub account.

2. **Create a new branch**:
   - Clone your forked repository to your local machine:
     ```bash
     git clone https://github.com/your-username/github-telegram-bot.git
     ```
   - Navigate to the project directory:
     ```bash
     cd github-telegram-bot
     ```
   - Create a new branch for your feature or fix:
     ```bash
     git checkout -b feature/your-feature-name
     ```

3. **Make your changes and commit them**:
   - Make the necessary changes in your code.
   - Stage your changes:
     ```bash
     git add .
     ```
   - Commit your changes with a descriptive message:
     ```bash
     git commit -m "Add your feature"
     ```

4. **Push to the branch**:
   - Push your changes to your forked repository:
     ```bash
     git push origin feature/your-feature-name
     ```

5. **Open a pull request**:
   - Go to the original repository on GitHub.
   - Click on the "New Pull Request" button.
   - Select your branch and provide a clear description of your changes.
   - Submit the pull request and wait for feedback! 🚀

## License
This project is licensed under the MIT [LICENSE](LICENSE). See the LICENSE file for details.

## Acknowledgments
Thanks to [GitHub](https://github.com) for their webhook system.

Thanks to [Telegram](https://web.telegram.org) for their bot API.

Inspired by the need for real-time notifications in development workflows.  
