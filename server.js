// backend/server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(express.json());
app.use(cors());

// db.json path
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB(){
  if(!fs.existsSync(DB_FILE)) return { users:[], tracker:[] };
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function saveDB(data){ fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ message:'Provide username & password' });
  const db = loadDB();
  if(db.users.find(u=>u.username===username)) return res.status(400).json({ message:'User already exists' });
  db.users.push({ username, password });
  saveDB(db);
  res.json({ message:'Registration successful' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if(!user) return res.status(401).json({ message:'Invalid username or password' });
  res.json({ message:'Login successful', user:{ username:user.username } });
});

app.post('/tracker', (req, res) => {
  const { username, date, steps, calories, minutes, level } = req.body;
  if(!username || !date) return res.status(400).json({ message:'Missing username or date' });
  const db = loadDB();
  db.tracker.push({ username, date, steps, calories, minutes, level });
  saveDB(db);
  res.json({ message:'Entry saved' });
});

app.get('/tracker/:username', (req, res) => {
  const db = loadDB();
  const data = db.tracker.filter(t => t.username === req.params.username);
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Backend running on http://localhost:${PORT}`));
