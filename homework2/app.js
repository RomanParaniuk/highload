const express = require('express');
const { MongoClient } = require('mongodb');
const { Client: ElasticClient } = require('@elastic/elasticsearch');

const app = express();
app.use(express.json());

// Environment variables
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017';
const mongoDbName = process.env.MONGO_DB_NAME || 'testdb';
const elasticNode = process.env.ELASTIC_NODE || 'http://elasticsearch:9200';
const PORT = process.env.PORT || 6767;

let mongoClient;

// Connect to MongoDB
async function connectToMongo() {
  try {
    mongoClient = await MongoClient.connect(mongoUri, { useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}
connectToMongo();

// Elasticsearch connection
const elasticClient = new ElasticClient({ node: elasticNode });

// Middleware to ensure MongoDB is connected
app.use((req, res, next) => {
  if (!mongoClient) {
    return res.status(500).json({ error: 'MongoDB not connected' });
  }
  next();
});

// Endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/mongo/insert', async (req, res) => {
  try {
    const { collection, document } = req.body;
    const db = mongoClient.db(mongoDbName);
    const result = await db.collection(collection).insertOne(document);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert document', details: err.message });
  }
});

app.get('/mongo/find', async (req, res) => {
  try {
    const { collection, query } = req.query;
    const db = mongoClient.db(mongoDbName);
    const documents = await db.collection(collection).find(query ? JSON.parse(query) : {}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve documents', details: err.message });
  }
});

app.post('/elastic/index', async (req, res) => {
  try {
    const { index, id, document } = req.body;
    const result = await elasticClient.index({ index, id, document });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to index document', details: err.message });
  }
});

app.get('/elastic/search', async (req, res) => {
  try {
    const { index, query } = req.query;
    const result = await elasticClient.search({
      index,
      query: { match: JSON.parse(query) },
    });
    res.json(result.hits.hits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search documents', details: err.message });
  }
});

// Get all collections from MongoDB
app.get('/mongo/collections', async (req, res) => {
  try {
    const db = mongoClient.db(mongoDbName);
    const collections = await db.listCollections().toArray();
    res.json(collections.map(c => c.name)); // Return only collection names
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve collections', details: err.message });
  }
});

// Get all indexes from Elasticsearch
app.get('/elastic/indexes', async (req, res) => {
  try {
    const result = await elasticClient.cat.indices({ format: 'json' }); // Get all indices in JSON format
    res.json(result.map(index => index.index)); // Extract and return only the index names
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve indexes', details: err.message });
  }
});


// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});