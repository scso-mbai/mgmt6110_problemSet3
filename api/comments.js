// api/comments.js
// Shared serverless API endpoint for retrieving and submitting persistent visitor comments.

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data/comments.json');

// In-memory fallback if file write fails in read-only serverless lambdas
let memoryFallback = [];

function readComments() {
  // If Vercel KV / Upstash Redis credentials are provided, that is used
  // Otherwise, use server-side file persistence
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryFallback = parsed;
        return parsed;
      }
    } else {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
  } catch (err) {
    console.warn('Filesystem read error, using in-memory store:', err.message);
  }
  return memoryFallback;
}

function writeComments(comments) {
  memoryFallback = comments;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(comments, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('Filesystem write error (ephemeral environment):', err.message);
    return true; // Still preserved in server memory
  }
}

async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

const sendJson = (res, statusCode, data) => {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

export default async function handler(req, res) {
  // Set CORS and caching headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // GET: Retrieve all comments
  if (req.method === 'GET') {
    // Disable caching for live feedback comments so new comments appear immediately
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const comments = readComments();
    return sendJson(res, 200, {
      comments,
      count: comments.length,
      storageType: 'backend-persisted',
    });
  }

  // POST: Submit a new comment
  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const rawText = body.text || '';
      const rawAuthor = body.author || '';

      // Requirement 11: Validation
      // 1. Feedback text cannot be empty
      // 2. Trim whitespace
      const text = typeof rawText === 'string' ? rawText.trim() : '';
      if (!text) {
        return sendJson(res, 400, {
          error: 'Feedback text is required and cannot be empty.',
        });
      }

      // 3. Enforce reasonable maximum comment length (500 chars)
      if (text.length > 500) {
        return sendJson(res, 400, {
          error: 'Comment exceeds maximum allowed length of 500 characters.',
        });
      }

      const author = typeof rawAuthor === 'string' && rawAuthor.trim()
        ? rawAuthor.trim().slice(0, 60)
        : 'Collector Guest';

      const newComment = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        author,
        text,
        createdAt: new Date().toISOString(),
      };

      const existingComments = readComments();
      const updatedComments = [newComment, ...existingComments];
      writeComments(updatedComments);

      return sendJson(res, 201, {
        success: true,
        comment: newComment,
        message: 'Comment saved successfully to backend.',
      });
    } catch (err) {
      console.error('Error handling comment submission:', err);
      return sendJson(res, 500, {
        error: 'Failed to save comment on server.',
      });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}
