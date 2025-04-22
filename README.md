# Minecraft Bedrock Player List API (Offline Fetcher)

This project provides a lightweight API that reads your Minecraft Bedrock server logs and displays a real-time list of online players — fully offline and local.

---

## ✅ Features

- Compatible with **Minecraft Bedrock Dedicated Servers**
- Tracks players by reading recent log activity
- No plugins or mods required
- Works locally, outputs a JSON API at `/api/players`
- Configurable to work with any system, not tied to specific panel software
- Simple Express.js server

---

## ⚙️ Requirements

- A Linux server
- Node.js installed
- `npm` and optionally `pm2` for background execution
- Access to your Minecraft server logs (through Crafty or any other controller)

---

## ⬇️ Installation

### 1. Install Node.js and PM2

```bash
sudo apt update
sudo apt install nodejs npm -y
sudo npm install -g pm2
```

---

### 2. Create Your Player Tracker Script

Create a file called `playerTracker.js`:

```bash
nano playerTracker.js
```

Paste the following code, replacing the placeholders with your own data:

```js
const express = require('express');
const axios = require('axios');
const https = require('https');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3011;

// === Replace this with the URL you plan to allow (e.g., your site’s domain) ===
app.use(cors());
app.use((req, res, next) => {
  const origin = req.get('origin') || '';
  if (!origin.includes("YOUR-URL-HERE")) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

// === Replace these placeholders with your own values ===
const API_TOKEN = 'YOUR_CRAFTY_API_TOKEN';
const SERVER_ID = 'YOUR_SERVER_UUID';
const CRAFTY_API_URL = `https://YOUR_CRAFTY_HOST:PORT/api/v2/servers/${SERVER_ID}/logs`;

// === Disable SSL validation for self-signed certificates ===
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.use(express.static(path.join(__dirname, 'public')));

let activePlayers = new Map();

async function updatePlayerList() {
  try {
    const response = await axios.get(CRAFTY_API_URL, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      httpsAgent
    });

    const logs = response.data.data || [];
    const players = new Map();

    logs.slice(-50).forEach((message) => {
      const joinMatch = message.match(/Player connected: ([^,]+)/);
      const leaveMatch = message.match(/Player disconnected: ([^,]+)/);

      if (joinMatch) players.set(joinMatch[1], joinMatch[1]);
      if (leaveMatch) players.delete(leaveMatch[1]);
    });

    activePlayers = players;
  } catch (error) {
    console.error('Failed to fetch player data:', error.message);
  }
}

setInterval(updatePlayerList, 15000);
updatePlayerList();

app.get('/api/players', (req, res) => {
  res.json({ players: Array.from(activePlayers.values()) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`▶ Player tracker running at http://0.0.0.0:${PORT}`);
});
```

---

### 3. Start the Script

```bash
pm2 start playerTracker.js --name playerTracker
pm2 save
```

> If you use your own method of managing persistent scripts (like systemd or Docker), you can use that instead.

---

### 4. Access the API

Once running, visit the following on your server:

```
http://localhost:3011/api/players
```

You’ll see output like:

```json
{
  "players": ["Player1", "Player2"]
}
```

This list updates every 15 seconds based on log activity.

---

## ℹ️ Notes

- This script uses Crafty’s API as a data source, but you can modify it to read logs directly from disk if you use another setup.
- Ensure your Crafty instance allows local API access and you know your **server UUID**.
- Replace all placeholders (`YOUR_CRAFTY_HOST`, `API_TOKEN`, `SERVER_ID`, and `YOUR-URL-HERE`) before running the script.

---

## 🔒 Security

This project includes a simple **origin check**:
- Requests to `/api/players` are only accepted from a domain you configure.
- This helps prevent unauthorized external access if you later expose the API.

---

## ✅ Final Output

Once setup is complete, your player list will be available locally at:

```
http://localhost:3011/api/players
```

This returns the current players in real-time — no mods, no plugins.

---

## 🌐 Online Access?

This README intentionally **does not include** instructions for making the API public.  
Admins may choose their own method for securing and exposing their API if needed.

---