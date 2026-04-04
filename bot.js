import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.bot_token, { polling: true });

const N = parseInt(process.env.ADT);
const adtList = Array.from({length: N}, (_, i) => i + 1);

async function fetchFlightAvailability(adt){
  try {
    const response = await axios.get('https://www.ryanair.com/api/booking/v4/en-gb/availability', {
      params: {
        ADT: adt,
        CHD: 0,
        DateIn: '',
        DateOut: process.env.DATE_OUT,
        Destination: process.env.DESTINATION,
        Disc: 0,
        INF: 0,
        Origin: process.env.ORIGIN,
        TEEN: 0,
        promoCode: '',
        IncludeConnectingFlights: false,
        FlexDaysBeforeOut: 0,
        FlexDaysOut: 0,
        FlexDaysBeforeIn: 0,
        FlexDaysIn: 0,
        RoundTrip: false,
        ToUs: 'AGREED'
      }
    });

    var price = response.data.trips[0].dates[0].flights[0].regularFare.fares[0].amount;

    console.log(`[${getFormattedDateTime()}] Price for ${adt} tickets: ${price}€`);

    if (price <= 90) {
      const message = process.env.LANGUAGE === 'es' ? `¡Oferta! ${adt} tickets disponibles al precio de ${price}€.` : `Оферта! ${adt} билет(а) за ${price}€ всеки един.`;

      const now = new Date();
      const hour = now.getHours();
      const silent = hour >= 23 || hour <= 7;

      if (silent) {
        const url = `https://api.telegram.org/bot${process.env.bot_token}/sendMessage?chat_id=${process.env.chat_id}&text=${encodeURIComponent(message)}&disable_notification=true`;
        await axios.post(url);
      } else {
        await bot.sendMessage(process.env.chat_id, message);
      }
    }

  } catch (error) {
    console.error('Error fetching flight availability:', error.message);
  }
};

const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Initial call 
for (const adt of adtList) {
  await fetchFlightAvailability(adt);
}

// Call the function
setInterval(async () => {
  for (const adt of adtList) {
    await fetchFlightAvailability(adt);
  }
}, 1000 * 60 * parseInt(process.env.CHECK_INTERVAL_MINUTES)); // Check every N minutes
