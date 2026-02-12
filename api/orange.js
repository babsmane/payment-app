const axios = require('axios');

const ORGANE_API_KEY = process.env.ORGANE_API_KEY;
const ORGANE_BASE_URL = 'https://api.organe.money/v1';

// Exemple : récupérer le solde
async function getBalance() {
  try {
    const response = await axios.get(`${ORGANE_BASE_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${ORGANE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Solde:', response.data);
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}
