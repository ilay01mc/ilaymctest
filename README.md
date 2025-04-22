# Minecraft Bedrock Player List API (Offline Fetcher)

This project allows you to track online players from a **Minecraft Bedrock Dedicated Server** by monitoring the server logs.  
It generates a local API endpoint that returns a real-time list of online players.

---

## ✅ Features

- Fully compatible with Bedrock Dedicated Servers (BDS)
- Works without any plugins or external services
- Parses log files to track connect/disconnect events
- Returns online players in a clean JSON API format
- Built with Node.js and Express
- Optional PM2 support to keep the script running in the background

---

## ⚙️ Requirements

- A Linux-based system
- Node.js (v14+ recommended)
- PM2 (optional but recommended)
- Your Bedrock server must be logging player activity (e.g., via Crafty Controller or a similar tool)

---

## ⬇️ Installation

### 1. Install Node.js and PM2

```bash
sudo apt update
sudo apt install nodejs npm -y
sudo npm install -g pm2
```

---

### 2. Locate Your Server Log File

You'll need the full path to your Bedrock server log. If you're using **Crafty Controller**, logs are typically located at:

```
/opt/crafty/logs/server-<your-server-uuid>.log
```

To find your **server UUID**, go to the Crafty dashboard, select your server, and look for the UUID in the server settings or logs directory.

---

### 3. Create the Player Tracker Script

Create a file named `playerTracker.js`:

```bash
nano playerTracker.js
```

Paste the following code inside:

```js
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3011;

// === Replace with your actual server UUID ===
const logFilePath = '/opt/crafty/logs/server-<your-server-uuid>.log';

let playersOnline = new Set();

app.use(cors());

app.use((req, res, next) => {
  const origin = req.get('origin') || '';
  const key = req.query.key;

  const validOrigin = origin.includes('github.io');
  const validKey = key === 'YOUR_SECRET_KEY';

  if (!validOrigin && !validKey) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
});

app.get('/api/players', (req, res) => {
  res.json({ players: [...playersOnline] });
});

fs.watchFile(logFilePath, { interval: 1000 }, () => {
  const content = fs.readFileSync(logFilePath, 'utf8');
  const lines = content.trim().split('\n').slice(-50);

  lines.forEach(line => {
    if (line.includes('Player connected:')) {
      const match = line.match(/Player connected: (.*),/);
      if (match) playersOnline.add(match[1]);
    }

    if (line.includes('Player disconnected:')) {
      const match = line.match(/Player disconnected: (.*),/);
      if (match) playersOnline.delete(match[1]);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Player API running at http://localhost:${PORT}/api/players`);
});
```

---

### 4. Run the Script

You can run it using PM2:

```bash
pm2 start playerTracker.js --name playerTracker
pm2 save
```

> If you already use another method to auto-start Node.js scripts (like systemd), you can use that instead of PM2.

---

### 5. Test the API

Visit this URL on the same machine:

```
http://localhost:3011/api/players?key=YOUR_SECRET_KEY
```

You should see something like:

```json
{
  "players": ["Player1", "Player2"]
}
```

---

## 🔒 Security Notice

The example above includes a basic security mechanism:
- Only requests with a valid `?key=YOUR_SECRET_KEY` or from `github.io` origins will succeed.
- Make sure to change `YOUR_SECRET_KEY` to something strong and private.

---

## ✅ Output

Once complete, your system will have a local API at:

```
http://localhost:3011/api/players?key=YOUR_SECRET_KEY
```

This URL returns a real-time list of online players.

---

## 🌐 Making It Public?

This guide intentionally **does not cover online/public access**.  
Server owners can choose how to expose their API (proxy, SSL, firewall, etc.) based on their own environment.

---