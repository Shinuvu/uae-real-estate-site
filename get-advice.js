// File: /api/get-advice.js

// This specifies that this is a Vercel Edge Function for speed
export const config = {
  runtime: 'edge',
};

// The main function that Vercel will run
export default async function handler(request) {
  try {
    // Get the user's data that was sent from the browser
    const userData = await request.json();

    // Your secret Gemini API key
    // IMPORTANT: We will add this to Vercel's settings later, NOT here in the code.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // The Gemini API endpoint. Note the model name 'gemini-1.5-flash'.
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `
      As an expert real estate analyst, provide concise and highly specific investment advice for the UAE market based on the following data and user preferences:

      **UAE Market H1 2025 Data Overview:**
      - UAE Total Population (June 2025): 11.35 million
      - Millionaires Relocating to UAE (2025 net inflow): 9,800+
      - Dubai Market H1 2025 Data: Total Sales Value: AED 327 Billion (+40% YoY)
      - Villa prices in 2024: +26%
      ... (include all the other market data from your original prompt here for the best results) ...

      **User Preferences:**
      - Interested Property Type: ${userData.propertyType}
      - Unit Details: ${userData.unitDetails}
      - Location: ${userData.location}
      - Developer: ${userData.developer}
      - Property Status: ${userData.propertyStatus}
      - Investment Horizon: ${userData.investmentHorizon}

      Considering all this information, what is your strategic recommendation? Be specific about risks and opportunities.
    `;

    // The data structure (payload) to send to Google
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Make the call to the Gemini API
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        console.error("Gemini API Error:", errorBody);
        throw new Error('Failed to fetch from Gemini API.');
    }

    const geminiResult = await geminiResponse.json();
    const adviceText = geminiResult.candidates[0].content.parts[0].text;

    // Send the generated text back to the browser
    return new Response(JSON.stringify({ advice: adviceText }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to generate advice.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}