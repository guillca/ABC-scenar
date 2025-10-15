import { GoogleGenAI, Type } from "@google/genai";
import type { LearningType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateActivityIdeas = async (
  context: { title: string; objectives: string },
  learningType: LearningType
): Promise<string[]> => {
  try {
    const prompt = `
      Vous êtes un expert en conception pédagogique spécialisé dans la méthode ABC Learning Design.
      Pour un module intitulé "${context.title}", et plus spécifiquement pour une séquence visant les objectifs suivants : "${context.objectives}",
      veuillez suggérer 3 idées d'activités concrètes et créatives pour le type d'apprentissage "${learningType.name}".

      Description du type d'apprentissage : "${learningType.description}".

      Les suggestions doivent être courtes (une phrase ou deux), pertinentes et directement utilisables.
      Structurez votre réponse en JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "Une idée d'activité.",
              }
            }
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && Array.isArray(result.suggestions)) {
      return result.suggestions;
    }
    return [];
  } catch (error) {
    console.error("Error generating activity ideas:", error);
    return ["Une erreur est survenue lors de la génération d'idées."];
  }
};
