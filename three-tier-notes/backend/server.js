const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'notesdb';

if (!MONGO_URI) {
  console.error('Missing required env var: MONGO_URI');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

let notesCollection;

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/notes', async (_req, res) => {
  try {
    const notes = await notesCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(notes);
  } catch (err) {
    console.error('Failed to list notes:', err);
    sendError(res, 500, 'Failed to fetch notes');
  }
});

app.post('/notes', async (req, res) => {
  try {
    const rawText = typeof req.body?.text === 'string' ? req.body.text : '';
    const text = rawText.trim();

    if (!text) {
      return sendError(res, 400, 'text is required');
    }

    if (text.length > 300) {
      return sendError(res, 400, 'text must be at most 300 characters');
    }

    const note = {
      text,
      createdAt: new Date()
    };

    const result = await notesCollection.insertOne(note);
    res.status(201).json({ _id: result.insertedId, ...note });
  } catch (err) {
    console.error('Failed to create note:', err);
    sendError(res, 500, 'Failed to create note');
  }
});

app.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid note id');
    }

    const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return sendError(res, 404, 'Note not found');
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete note:', err);
    sendError(res, 500, 'Failed to delete note');
  }
});

app.use((_req, res) => {
  sendError(res, 404, 'Not found');
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  sendError(res, 500, 'Internal server error');
});

async function start() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    notesCollection = db.collection('notes');

    await notesCollection.createIndex({ createdAt: -1 });

    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

start();
