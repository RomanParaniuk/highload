// File: worker.js

const axios = require('axios');
const schedule = require('node-schedule');

// GA4 Measurement Protocol endpoint and keys
const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID
const GA4_API_SECRET = 'YOUR_API_SECRET'; // Replace with your API secret from GA4 settings
const CLIENT_ID = '96c0ebf5-9805-456c-a6aa-a0c4e820b940'; // Replace with your unique Client ID

// Function to fetch UAH/USD exchange rate
async function fetchExchangeRate() {
    try {
        const response = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        const data = response.data;
        const usdEntry = data.find(rate => rate.cc === 'USD'); // Find the entry with cc = 'USD'
        
        if (usdEntry) {
            return usdEntry.rate; // Return the rate value for USD
        } else {
            throw new Error('USD exchange rate not found in the response.');
        }
    } catch (error) {
        console.error('Error fetching exchange rate:', error.message);
        throw new Error('Could not fetch exchange rate.');
    }
}

// Function to send data to GA4
async function sendToGoogleAnalytics(rate) {
    try {
        const payload = {
            client_id: CLIENT_ID, // Required: Unique ID for the user or app
            events: [
                {
                    name: 'currency_conversion', // Event name in GA4
                    params: {
                        currency: 'USD', // Custom parameter: currency code
                        rate: rate, // Custom parameter: exchange rate
                    },
                },
            ],
        };

        const url = `${GA4_ENDPOINT}?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 204) {
            console.log(`Exchange rate (${rate}) sent to Google Analytics successfully.`);
        } else {
            console.error('Failed to send data to Google Analytics:', response.data);
        }
    } catch (error) {
        console.error('Error sending data to Google Analytics:', error.message);
    }
}

// Scheduled task
schedule.scheduleJob('0 * * * *', async () => {
    try {
        console.log('Fetching exchange rate...');
        const rate = await fetchExchangeRate();
        console.log(`Fetched exchange rate: ${rate}`);
        await sendToGoogleAnalytics(rate);
    } catch (error) {
        console.error('Error during scheduled task:', error.message);
    }
});

console.log('Worker started. It will run every hour.');