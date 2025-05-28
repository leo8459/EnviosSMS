const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/enviar", async (req, res) => {
  const { numero, mensaje } = req.body;

  console.log("📤 Enviando SMS:");
  console.log("Número:", numero);
  console.log("Mensaje:", mensaje);

  try {
    const response = await axios.post(
      "http://10.10.100.118:8082",
      {
        to: numero,
        message: mensaje,
      },
      {
        headers: {
          Authorization: "48f158f1-0a20-4254-bf98-61723ef8382b",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Respuesta del servidor:", response.data);
    res.send(
      `<h3>✅ Mensaje enviado correctamente a ${numero}</h3><a href="/">← Volver</a>`
    );
  } catch (error) {
    console.error("❌ Error al enviar SMS:");
    if (error.response) {
      console.error("Código:", error.response.status);
      console.error("Respuesta:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    res
      .status(500)
      .send(
        `<h3>❌ Error al enviar el mensaje: ${error.message}</h3><a href="/">← Volver</a>`
      );
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor web activo en: http://localhost:${PORT}`);
});
