// index.js para OpenAI

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Se importa la nueva librería

const app = express();
app.use(express.json());
app.use(cors());

// Se inicializa el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Busca la clave en los "Secrets"
});

app.post('/askStylist', async (req, res) => {
  const { message, wardrobe, styleProfile } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }
  
  // El "super-prompt" se adapta al formato de OpenAI
  const systemPrompt = `
  Eres "Pro", un estilista de moda de clase mundial, amigable y empoderador.
  - Contexto: Hoy es ${new Date().toLocaleDateString()}.
  - Datos del Usuario:
    - Perfil de Estilo: ${JSON.stringify(styleProfile, null, 2)}
    - Armario: ${JSON.stringify(wardrobe, null, 2)}
  - Responde siempre en Markdown bien formateado.
  - CUANDO MUESTRES UNA PRENDA DEL ARMARIO, USA ESTE FORMATO EXACTO EN UNA SOLA LÍNEA. ES CRÍTICO QUE EL LINK Y LA PALABRA [Foto] ESTÉN JUNTOS SIN SALTOS DE LÍNEA.
  - Ejemplo de formato correcto: "- Top: Camisa de vestir. [Foto](https://link.com/imagen.jpg)"
`;

  try {
    // Así se llama a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Usamos el modelo más nuevo y eficiente
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply: reply });

  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    res.status(500).json({ error: 'Hubo un error al contactar a la IA.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
