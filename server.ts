import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.post('/api/conversations', async (req, res) => {
    try {
      const { custom_greeting, audio_only } = req.body;
      const apiKey = process.env.TAVUS_API_KEY;
      const personaId = process.env.PERSONA_ID;

      console.log('Initiating Tavus conversation request (Audio Only:', audio_only, ')...');
      console.log('Target URL: https://tavusapi.com/v2/conversations');

      if (!apiKey || !personaId) {
        return res.status(500).json({ 
          error: 'Missing Tavus configuration. Please set TAVUS_API_KEY and PERSONA_ID.' 
        });
      }

      // Using axios for more robust timeout handling
      const response = await axios.post('https://tavusapi.com/v2/conversations', {
        persona_id: personaId,
        replica_id: process.env.REPLICA_ID, // Support REPLICA_ID if provided
        custom_greeting: custom_greeting || "Hey, I'm Nova. Great to connect with you. What can I help you with today?",
        audio_only: !!audio_only,
        properties: {
          max_call_duration: 3600,
          enable_recording: true,
          participant_left_timeout: 60
        }
      }, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 100000 // 100 seconds timeout for replica provisioning
      });

      console.log('Tavus conversation created successfully:', response.data.conversation_id);
      res.json(response.data);
    } catch (error: any) {
      const status = error.response?.status || 500;
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      
      // Extract detailed error from Tavus if available
      const tavusError = error.response?.data;
      const errorDetail = tavusError || (isTimeout ? 'The Tavus API connection timed out during replica provisioning. This is often a transient cluster-side issue.' : error.message);
      
      console.error(`[PROXY_ERROR] Status: ${status} | Code: ${error.code} | Msg: ${error.message}`);
      if (tavusError) {
        console.error('Tavus API Error Payload:', JSON.stringify(tavusError, null, 2));
      }
      
      res.status(status).json({ 
        error: errorDetail,
        code: error.code || 'UNKNOWN_ERROR',
        isTimeout,
        suggestion: status === 500 ? 'Tavus cluster is currently busy or provisioning your replica. Retrying is the recommended path.' : undefined
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
