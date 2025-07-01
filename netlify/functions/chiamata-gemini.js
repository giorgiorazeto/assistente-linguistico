exports.handler = async function(event) {
  // Controlla che la richiesta sia del tipo giusto (POST)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Prende il testo inviato dalla pagina HTML
    const { prompt } = JSON.parse(event.body);

    // 2. Prende la chiave API segreta dalle variabili di Netlify
    const API_KEY = process.env.GEMINI_API_KEY;

    // Se la chiave non è impostata, restituisce un errore
    if (!API_KEY) {
      throw new Error('La chiave API di Gemini non è stata configurata.');
    }

    // 3. Prepara e invia la richiesta a Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('Errore da API Google:', errorBody);
        throw new Error('La richiesta a Google è fallita.');
    }

    const data = await response.json();
    
    // 4. Estrae e restituisce solo il testo generato
    const generatedText = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ text: generatedText })
    };

  } catch (error) {
    console.error("Errore nella funzione Netlify:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Si è verificato un errore interno." })
    };
  }
};