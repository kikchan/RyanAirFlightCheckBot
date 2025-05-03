import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.bot_token, { polling: true });

async function fetchFlightAvailability(adt){
  try {
    const response = await axios.get('https://www.ryanair.com/api/booking/v4/en-gb/availability', {
      params: {
        ADT: adt,
        CHD: 0,
        DateIn: '',
        DateOut: '2025-06-26',
        Destination: 'ALC',
        Disc: 0,
        INF: 0,
        Origin: 'SOF',
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

    if (price <= 50) {
      await bot.sendMessage(process.env.chat_id, `¡Oferta! ${adt} tickets disponibles al precio de ${price}€.`);
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

// Innitial call 
await fetchFlightAvailability(1);
await fetchFlightAvailability(2);
await fetchFlightAvailability(3);

// Call the function
setInterval( async () => {
  await fetchFlightAvailability(1);
  await fetchFlightAvailability(2);
  await fetchFlightAvailability(3);
}, 1000 * 60 * 15); // Check every 15 minutes
