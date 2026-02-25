import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => text.trim().length > 0 && text.trim().length <= 300, [text]);

  async function fetchNotes() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/notes`);
      if (!res.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'API request failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = text.trim();

    if (!trimmed || trimmed.length > 300) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create note');
      }

      setText('');
      await fetchNotes();
    } catch (err) {
      setError(err.message || 'API request failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError('');

    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to delete note');
      }
      await fetchNotes();
    } catch (err) {
      setError(err.message || 'API request failed');
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Three Tier Notes</h1>

        <form onSubmit={handleAdd} style={styles.form}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note..."
            maxLength={300}
            style={styles.input}
          />
          <button type="submit" disabled={!canSubmit || submitting} style={styles.button}>
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </form>

        <p style={styles.counter}>{text.trim().length}/300</p>

        {error ? <p style={styles.error}>{error}</p> : null}

        {loading ? <p>Loading notes...</p> : null}

        {!loading && notes.length === 0 ? <p>No notes yet.</p> : null}

        <ul style={styles.list}>
          {notes.map((note) => (
            <li key={note._id} style={styles.listItem}>
              <div>
                <p style={styles.noteText}>{note.text}</p>
                <small style={styles.meta}>{new Date(note.createdAt).toLocaleString()}</small>
              </div>
              <button onClick={() => handleDelete(note._id)} style={styles.deleteButton}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    margin: 0,
    padding: '2rem 1rem',
    background: '#f5f7fb',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  },
  card: {
    maxWidth: '720px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
  },
  title: {
    marginTop: 0,
    marginBottom: '1rem'
  },
  form: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.25rem'
  },
  input: {
    flex: 1,
    padding: '0.6rem 0.8rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem'
  },
  button: {
    padding: '0.6rem 1rem',
    border: 'none',
    borderRadius: '8px',
    background: '#1d4ed8',
    color: '#fff',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '0.45rem 0.8rem',
    border: 'none',
    borderRadius: '8px',
    background: '#dc2626',
    color: '#fff',
    cursor: 'pointer'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '0.75rem'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.75rem 0.9rem'
  },
  noteText: {
    margin: '0 0 0.25rem 0',
    whiteSpace: 'pre-wrap'
  },
  meta: {
    color: '#6b7280'
  },
  counter: {
    marginTop: 0,
    marginBottom: '1rem',
    color: '#6b7280'
  },
  error: {
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '0.6rem 0.8rem'
  }
};
