```javascript
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const uri = process.env.MONGODB_URI;
let db;

MongoClient.connect(uri, { useUnifiedTopology: true })
    .then(client => {
        db = client.db('website');
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Serve config
app.get('/config', (req, res) => {
    res.json({
        WELCOME_MESSAGE: process.env.WELCOME_MESSAGE || 'Welcome to Website'
    });
});

// Save name
app.post('/names', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    await db.collection('names').insertOne({ name });
    res.json({ message: `Saved ${name}` });
});

// Get names
app.get('/names', async (req, res) => {
    const names = await db.collection('names').find().toArray();
    res.json(names.map(item => item.name));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```
