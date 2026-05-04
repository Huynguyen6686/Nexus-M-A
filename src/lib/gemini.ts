import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateDealSummary(dealData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional and concise M&A deal summary for the following company:
      Title: ${dealData.title}
      Industry: ${dealData.industry}
      Revenue: $${dealData.financials.revenue[dealData.financials.revenue.length - 1]}
      Strategy: ${dealData.strategy.reasonForSale}
      
      Focus on key investment highlights and strategic value. Max 3 sentences.`,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini AI summary generation failed:', error);
    return null;
  }
}

export async function calculateMatchScore(investorProfile: any, dealData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate the match between this investor and deal.
      Investor Interests: ${investorProfile.interests.join(', ')}
      Investor Deal Size: $${investorProfile.minSize} - $${investorProfile.maxSize}
      
      Deal Industry: ${dealData.industry}
      Deal Value: $${dealData.mandaInfo.valuation}
      
      Provide a match score (0-100) and 1 sentence explanation in JSON format: { "score": number, "explanation": string }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Match scoring failed:', error);
    return { score: 0, explanation: 'Scoring unavailable' };
  }
}
