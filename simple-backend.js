const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ballarat-tools-backend',
    version: '1.0.0'
  });
});

// Basic API endpoints
app.get('/api/tools', (req, res) => {
  res.json({ tools: [], message: 'Coming soon' });
});

app.get('/api/members', (req, res) => {
  res.json({ members: [], message: 'Coming soon' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Ballarat Tool Library API', status: 'running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port', PORT);
});
