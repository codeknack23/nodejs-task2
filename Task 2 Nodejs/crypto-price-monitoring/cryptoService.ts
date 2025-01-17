import axios from 'axios';

const COIN_GECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

export const fetchCryptoPrice = async (cryptoId: string, currency: string = 'usd'): Promise<number> => {
  try {
    
    const response = await axios.get(`${COIN_GECKO_API_URL}?ids=${cryptoId}&vs_currencies=${currency}`);

    
    if (response.data[cryptoId] && response.data[cryptoId][currency]) {
      return response.data[cryptoId][currency]; 
    } else {
     
      throw new Error(`Price data for ${cryptoId} not found`);
    }
  } catch (error :any) {
    console.error('Error fetching crypto price:', error.message || error);
    throw new Error(`Error fetching price for ${cryptoId}`);
  }
}; 
