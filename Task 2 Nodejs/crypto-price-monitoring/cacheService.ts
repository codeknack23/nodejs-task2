import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://localhost:6379', 
});

redisClient.on('error', (err) => {
  console.error('Redis error:');
});

export const cacheCryptoPrice = (cryptoId: string, price: number) => {
  const cacheKey = `crypto_price:${cryptoId}`;
  redisClient.setEx(cacheKey, 60, price.toString()); // cache for 60 seconds
};

export const getCachedPrice = async (cryptoId: string): Promise<number | null> => {
  const cacheKey = `crypto_price:${cryptoId}`;
  try {
    
    const data = await redisClient.get(cacheKey);
    return data ? parseFloat(data) : null; 
  } catch (err) {
    console.error('Error getting cached price:', err);
    return null; 
  }
};
