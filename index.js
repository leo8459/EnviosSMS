/*───────────────────────────────────────────────────────────
  index.js   – Servidor SMS + Proxy a packagesRDD
───────────────────────────────────────────────────────────*/
const express    = require('express');
const bodyParser = require('body-parser');
const axios      = require('axios');
const path       = require('path');

const PORT       = 8453;

// ▸ API externa (paquetes) – ajusta si cambia
const API_URL   = 'http://172.65.10.52/api/packagesRDD';
const API_TOKEN = 'eZMlItx6mQMNZjxoijEvf7K3pYvGGXMvEHmQcqvtlAPOEAPgyKDVOpyF7JP0ilbK';

// ▸ Gateway local (teléfono) – IP y token del celular
const GATEWAY_URL   = 'http://10.10.100.118:8082';
const GATEWAY_TOKEN = '48f158f1-0a20-4254-bf98-61723ef8382b';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/*───────────────────────────────────────────────────────────
  GET  /api/paquetes   (proxy sin CORS para el navegador)
───────────────────────────────────────────────────────────*/
app.get('/api/paquetes', async (req, res) => {
  try {
    const r = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    res.json(r.data);
  } catch (e) {
    console.error('Proxy /api/paquetes:', e.message);
    res.status(500).json({ error: 'proxy_error' });
  }
});

/*───────────────────────────────────────────────────────────
  POST /enviar   (envía SMS a través del teléfono)
───────────────────────────────────────────────────────────*/
app.post('/enviar', async (req, res) => {
  const { numero, mensaje } = req.body;
  console.log(`📤 Enviando a ${numero}: ${mensaje}`);

  try {
    const r = await axios.post(
      GATEWAY_URL,
      { to: numero, message: mensaje },
      {
        headers: {
          Authorization: GATEWAY_TOKEN,          // << sin "Bearer"
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Respuesta gateway:', r.data);
    res.send(`<h3>✅ Enviado a ${numero}</h3><a href="/">← Volver</a>`);
  } catch (e) {
    console.error('❌ Error gateway:', e.message);
    res.status(500).send(`<h3>❌ Error: ${e.message}</h3><a href="/">← Volver</a>`);
  }
});

/*───────────────────────────────────────────────────────────*/
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Servidor listo en http://0.0.0.0:${PORT}`)
);
