const {GoogleGenAI, Type} = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});


const model = 'gemini-flash-lite-latest';

async function getFinancialInsights(financialData) {
  try {
  
    const systemInstruction = `
         You are a senior financial advisor AI. Analyze the following summary of a user's credit card usage.

        Primary Metrics:
        - Credit Limit: $${financialData.creditLimit}
        - Current Balance: $${financialData.currentBalance}
        - Credit Utilization: ${financialData.utilization}%

        Historical Summary (${financialData.monthsOfHistory} months):
        - Spending Trend: ${financialData.spendingTrend}
        - Average Monthly Spending: $${financialData.averageMonthlySpending}
        - Payment Behavior: The user ${financialData.isPayingInFull ? 'consistently pays their bill in full' : 'often carries a balance'}.
        - Average Payment-to-Bill Ratio: ${ (financialData.averagePaymentRatio * 100) }%
         today's date is ${new Date().toISOString().split('T')[0]}.

        Instructions:
        1.  **Risk Score:** Based on all data, determine a risk score ("Low", "Medium", "High").
        2.  **Spending Habit Analysis:** Briefly comment on the user's spending trend.
        3.  **Payment Behavior Analysis:** Briefly comment on the user's payment habits.
        4.  **Actionable Advice:** Provide one clear, actionable piece of advice.
        5.  **Predicted Limit Date:** Predict when the user might reach their limit.

        Respond ONLY with a valid JSON object matching the schema.
    `;

    // The configuration forces the model to output a JSON object matching our schema
    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        required: ["riskScore", "predictedLimitDate", "spendingHabitAnalysis", "paymentBehaviorAnalysis", "actionableAdvice", "utilization"],
        properties: {
          riskScore: { type: Type.STRING },
          predictedLimitDate: { type: Type.STRING },
          analysis: { type: Type.STRING },
          utilization: { type: Type.STRING  },
            spendingHabitAnalysis: { type: Type.STRING },
            paymentBehaviorAnalysis: { type: Type.STRING },
            actionableAdvice: { type: Type.STRING },

        },
      },
    };

    
    const contents = [{
        role: 'user',
        parts: [{ text: 'Analyze the provided financial data.' }],
    }];

    const response = await ai.models.generateContent({
      model,
      config,
      systemInstruction: [{ text: systemInstruction }],
      contents,
    });
    
    console.log('Gemini API response:', response.text);
    return JSON.parse(response.text);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      riskScore: 'Error',
      predictedLimitDate: 'N/A',
      analysis: 'Could not generate AI insights at this time.',
        utilization: 'N/A',
        spendingHabitAnalysis: 'N/A',
        paymentBehaviorAnalysis: 'N/A',
        actionableAdvice: 'N/A',

    };
  }
}

module.exports = { getFinancialInsights };