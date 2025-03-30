app.post("/webhook", async (req, res) => {
  console.log("✅ Webhook llamado desde Dialogflow");

  try {
    const userInput = req.body.queryResult.queryText;

    // --- 1. Análisis de sentimiento ---
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

    const sentiment = sentimentResponse.data.choices[0].message.content.trim().toLowerCase();
    console.log("🎭 Sentimiento detectado:", sentiment);

    // --- 2. Respuesta habitual del bot (puedes personalizar según el sentimiento) ---
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
