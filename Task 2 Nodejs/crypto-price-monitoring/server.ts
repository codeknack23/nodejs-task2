import express, { Request, Response } from 'express';
import { fetchCryptoPrice } from './cryptoService';
import { cacheCryptoPrice, getCachedPrice } from './cacheService';
import { checkAlerts } from './alertService';
import connectDB from './db';
import WebSocket from "ws";

const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();

// Create WebSocket server and integrate with the Express server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Create WebSocket server instance
const wss = new WebSocket.Server({ server });

// Store WebSocket clients
const clients: Set<WebSocket> = new Set();

// WebSocket connection handler
wss.on('connection', async (ws: WebSocket) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  const cryptosToTrack = ['bitcoin', 'ethereum']; 
    for (let cryptoId of cryptosToTrack) {
      try {
        const price = await fetchCryptoPrice(cryptoId);

            ws.send(JSON.stringify({ cryptoId, price }));
         

        console.log(`fetched price for ${cryptoId}: $${price}`);
      } catch (error) {
        console.error('Error fetching price for', cryptoId, error);
      }
    }

  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Middleware to parse JSON requests
app.use(express.json());

// Real-time price monitoring endpoint
app.get('/crypto/:cryptoId', async (req: Request, res: Response): Promise<any> => {
  const { cryptoId } = req.params;

  // Check if the price is cached
   const cachedPrice = await getCachedPrice(cryptoId);
  if (cachedPrice) {
    return res.json({ price: cachedPrice, source: 'cache' });
  }

  
  try {
    const price = await fetchCryptoPrice(cryptoId);
   
    await checkAlerts(cryptoId, price);

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ cryptoId, price }));
      }
    });

    return res.json({ price, source: 'api' });
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return res.status(500).json({ message: 'Error fetching price' });
  }
});


const startPeriodicPriceUpdates = () => {
  
  const cryptosToTrack = ['bitcoin', 'ethereum']; 

  // Fetch prices every 60 seconds
  setInterval(async () => {
    for (let cryptoId of cryptosToTrack) {
      try {
        const price = await fetchCryptoPrice(cryptoId);

         
        cacheCryptoPrice(cryptoId, price);

        
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ cryptoId, price }));
          }
        });

        console.log(`Broadcasted price for ${cryptoId}: $${price}`);
      } catch (error) {
        console.error('Error fetching price for', cryptoId, error);
      }
    }
  }, 60000);  // 60 seconds for updating prices
};


startPeriodicPriceUpdates();