import React, { useState, useEffect } from 'react';
import "./CryptoPrice.css"

const CryptoPrices = () => {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket('ws://localhost:3000');

    // WebSocket open event
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    // WebSocket message event
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);  // Debugging log

      const { cryptoId, price } = data;

      // Update the state with the new price data
      setCryptoPrices(prevPrices => ({
        ...prevPrices,
        [cryptoId]: price
      }));
    };

    // WebSocket error event
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // WebSocket close event
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Save the WebSocket connection to state
    setSocket(ws);

    // Cleanup the WebSocket connection on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div>
      <h1 >Live Cryptocurrency Prices</h1>
      <div className='container'>
        {Object.entries(cryptoPrices).map(([cryptoId, price]) => (
          <div key={cryptoId} className="crypto-price">
            <strong >{cryptoId.toUpperCase()}</strong>: ${price.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoPrices;
