/*───────────────────────────────────────────────
   index.js  –  Backend SMS + proxy packagesRDD
───────────────────────────────────────────────*/
const express    = require('express');
const bodyParser = require('body-parser');
const axios      = require('axios');
const path       = require('path');

const PORT = 8453;

/* ◉ API externa (paquetes) */
const API_URL   = 'http://172.65.10.52/api/packagesRDD';
const API_TOKEN = 'eZMlItx6mQMNZjxoijEvf7K3pYvGGXMvEHmQcqvtlAPOEAPgyKDVOpyF7JP0ilbK';

/* ◉ Gateway (tu celular) */
const GATEWAY_URL   = 'http://10.10.100.118:8082';
const GATEWAY_TOKEN = '48f158f1-0a20-4254-bf98-61723ef8382b';   // sin “Bearer”

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/*──── proxy sin CORS ────*/
app.get('/api/paquetes', async (_req, res) => {
  try {
    const r = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    res.json(r.data);
  } catch (e) {
    console.error('Proxy paquetes:', e.message);
    res.status(500).json({ ok:false, error:'proxy_error' });
  }
});

/*──── enviar SMS ────*/
app.post('/enviar', async (req, res) => {
  const { numero, mensaje } = req.body;
  console.log(`📤 Enviando a ${numero}: ${mensaje}`);

  try {
    const r = await axios.post(
      GATEWAY_URL,
      { to: numero, message: mensaje },
      { headers:{ Authorization: GATEWAY_TOKEN, 'Content-Type':'application/json' } }
    );
    console.log('✅ Gateway respondió:', r.data);
    res.json({ ok:true, numero });
  } catch (e) {
    console.error('❌ Gateway error:', e.message);
    res.status(500).json({ ok:false, error:e.message });
  }
});

app.listen(PORT,'0.0.0.0', () =>
  console.log(`🚀  http://0.0.0.0:${PORT} listo`)
);
