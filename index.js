const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  console.log("✅ Webhook llamado desde Dialogflow");

  try {
    const userInput = req.body.queryResult.queryText;

    // Análisis de sentimiento
    const sentimentResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Analiza el siguiente mensaje y responde solo con 'positivo', 'negativo' o 'neutral'.",
          },
          { role: "user", content: userInput },
        ],
        temperature: 0.0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const sentimiento = sentimentResponse.data.choices[0].message.content.trim();
    console.log("🎭 Sentimiento detectado:", sentimiento);

    // Generación de respuesta
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente del departamento de compras. Responde de forma clara y breve a proveedores.",
          },
          { role: "user", content: userInput },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ fulfillmentText: reply });

  } catch (error) {
    console.error("❌ Error al llamar a OpenAI:", error.response?.data || error.message);
    res.json({
      fulfillmentText: "Hubo un error al conectar con la IA.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Servidor funcionando en puerto " + PORT);
});
