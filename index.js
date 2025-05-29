/*──────────────────────────────────────────────
   index.js  –  Paquetes + SMS + mensajes guardados
──────────────────────────────────────────────*/
const express = require('express');
const body    = require('body-parser');
const axios   = require('axios');
const path    = require('path');
const Database= require('better-sqlite3');

/* ─ Config fijos ─ */
const PORT          = 8453;
const API_URL       = 'http://172.65.10.52/api/packagesRDD';
const API_TOKEN     = 'eZMlItx6mQMNZjxoijEvf7K3pYvGGXMvEHmQcqvtlAPOEAPgyKDVOpyF7JP0ilbK';
const GATEWAY_URL   = 'http://10.10.100.118:8082';
const GATEWAY_TOKEN = '48f158f1-0a20-4254-bf98-61723ef8382b';

const app = express();
app.use(body.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname,'public')));

/* ─ SQLite mensajes ─ */
const db = new Database('mensajes.db');
db.prepare(`CREATE TABLE IF NOT EXISTS mensajes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  texto TEXT NOT NULL
)`).run();

/* ╔══════════════════════╗
   ║     API  Paquetes    ║
   ╚══════════════════════╝ */
app.get('/api/paquetes', async (_req,res)=>{
  try{
    const r = await axios.get(API_URL,{ headers:{Authorization:`Bearer ${API_TOKEN}`}});
    res.json(r.data);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

/* ╔══════════════════════╗
   ║  CRUD Mensajes texto ║
   ╚══════════════════════╝ */
app.get('/api/mensajes', (_r,res)=>{
  res.json( db.prepare('SELECT * FROM mensajes ORDER BY id DESC').all() );
});

app.post('/api/mensajes', (req,res)=>{
  const {texto}=req.body;
  if(!texto) return res.status(400).json({error:'texto vacío'});
  const info = db.prepare('INSERT INTO mensajes(texto) VALUES(?)').run(texto);
  res.json({id:info.lastInsertRowid, texto});
});

app.delete('/api/mensajes/:id', (req,res)=>{
  db.prepare('DELETE FROM mensajes WHERE id=?').run(req.params.id);
  res.json({ok:true});
});

/* ╔══════════════════════╗
   ║   Enviar  SMS        ║
   ╚══════════════════════╝ */
app.post('/enviar', async (req,res)=>{
  const {numero,mensaje}=req.body;
  try{
    await axios.post(GATEWAY_URL,
      {to:numero,message:mensaje},
      {headers:{Authorization:GATEWAY_TOKEN,'Content-Type':'application/json'}});
    res.json({ok:true});
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

app.listen(PORT,()=>console.log(`🚀  http://localhost:${PORT}`));
