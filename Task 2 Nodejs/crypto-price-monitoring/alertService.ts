import mongoose from 'mongoose';

interface Alert {
  userId: string;
  cryptoId: string;
  priceThreshold: number;
  condition: 'above' | 'below';
}

const alertSchema = new mongoose.Schema<Alert>({
  userId: { type: String, required: true },
  cryptoId: { type: String, required: true },
  priceThreshold: { type: Number, required: true },
  condition: { type: String, required: true },
});

const AlertModel = mongoose.model('Alert', alertSchema);

export const createAlert = async (alertData: Alert) => {
  const alert = new AlertModel(alertData);
  await alert.save();
};

export const getUserAlerts = async (userId: string) => {
  return AlertModel.find({ userId });
};

export const checkAlerts = async (cryptoId: string, price: number) => {
  const alerts = await AlertModel.find({ cryptoId });

  alerts.forEach((alert) => {
    if (alert.condition === 'above' && price > alert.priceThreshold) {
     
      console.log(`Alert: ${cryptoId} price is above your threshold`);
    } else if (alert.condition === 'below' && price < alert.priceThreshold) {
      console.log(`Alert: ${cryptoId} price is below your threshold`);
    }
  });
};
