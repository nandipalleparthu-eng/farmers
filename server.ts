import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for crop recommendation
  app.post("/api/recommend", async (req, res) => {
    try {
      const { n, p, k, temperature, humidity, ph, rainfall, location } = req.body;

      // Initialize AI inside the handler to ensure fresh environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment");
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Act as an expert agricultural scientist. Based on the following soil and environmental data, recommend the most suitable crops.
      
      Data:
      - Nitrogen (N): ${n}
      - Phosphorus (P): ${p}
      - Potassium (K): ${k}
      - Temperature: ${temperature}°C
      - Humidity: ${humidity}%
      - pH level: ${ph}
      - Rainfall: ${rainfall}mm
      ${location ? `- Location: ${location}` : ""}

      Provide a detailed recommendation in JSON format including:
      1. recommendedCrop: The best crop.
      2. confidence: Confidence score (0-100).
      3. alternatives: Top 3 alternative crops with their suitability scores.
      4. reasoning: Brief explanation of why these crops were chosen based on the input factors.
      5. featureImportance: An object showing how much each factor (N, P, K, Temp, Humidity, pH, Rainfall) influenced the decision (total 100%).
      6. tips: 3-4 specific farming tips for the recommended crop.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedCrop: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    suitability: { type: Type.NUMBER }
                  }
                }
              },
              reasoning: { type: Type.STRING },
              featureImportance: {
                type: Type.OBJECT,
                properties: {
                  N: { type: Type.NUMBER },
                  P: { type: Type.NUMBER },
                  K: { type: Type.NUMBER },
                  Temperature: { type: Type.NUMBER },
                  Humidity: { type: Type.NUMBER },
                  pH: { type: Type.NUMBER },
                  Rainfall: { type: Type.NUMBER }
                }
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["recommendedCrop", "confidence", "alternatives", "reasoning", "featureImportance", "tips"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Error in recommendation:", error);
      res.status(500).json({ error: "Failed to get recommendation" });
    }
  });

  // API route for chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a helpful agricultural expert assistant. You help farmers with their queries about crops, soil, pests, and general farming practices. Keep your answers concise and practical.",
        },
        history: history || [],
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to get chat response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
