const {GoogleGenAI, Type} = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});


const model = 'gemini-flash-lite-latest';

async function getFinancialInsights(financialData) {
  try {
  
    const systemInstruction = `
        You are a senior financial advisor AI. Your task is to perform a detailed analysis of a user's credit card usage based on their last 20 transactions.

        Primary Metrics:
        - Credit Limit: $${financialData.creditLimit}
        - Current Balance: $${financialData.currentBalance}
        - Credit Utilization: ${financialData.utilization}%

        Recent Transaction History (up to 20 most recent bills):
        ${financialData.bills}

        Instructions:
        1.  **Top Spending Category:** Identify the category with the highest spending from the recent history provided.
        2.  **Spending Habit Analysis:** Briefly describe the user's recent spending pattern. Are they spending on needs (Groceries, Utilities) or wants (Shopping, Entertainment)? Is their spending frequent?
        3.  **Payment Behavior Analysis:** Based on the billed vs. paid amounts in the recent history, does the user tend to pay in full or carry a balance?
        4.  **Actionable Advice:** Provide one clear, actionable piece of advice directly related to the transaction history. For example, "Your recent spending on 'Dining Out' is high; exploring home-cooked meals could offer significant savings."
        5.  **Risk Score:** Based on all the data, determine a risk score ("Low", "Medium", "High").
         6.**Predicted Limit Date:** Based on the recent spending velocity and current balance, predict a likely date the user might reach their credit limit. If not likely in the near future, respond with the string "Not in the near future". Provide the date in YYYY-MM-DD format if applicable.
        todays date is ${new Date().toISOString().split('T')[0]}. all in rupees.
        Respond ONLY with a valid JSON object matching the schema. Do not include any other text, explanations, or markdown formatting.`;

    // The configuration forces the model to output a JSON object matching our schema
     const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    imageConfig: {
      imageSize: '1K',
    },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["riskScore", "topSpendingCategory", "spendingHabitAnalysis", "paymentBehaviorAnalysis", "actionableAdvice", "predictedLimitDate"],
      properties: {
        riskScore: {
          type: Type.STRING,
        },
        topSpendingCategory: {
          type: Type.STRING,
        },
        spendingHabitAnalysis: {
          type: Type.STRING,
        },
        paymentBehaviorAnalysis: {
          type: Type.STRING,
        },
        actionableAdvice: {
          type: Type.STRING,
        },
        predictedLimitDate: {
          type: Type.STRING,
        },
      },
    },
  };

    
    const contents = [{
        role: 'user',
        parts: [{ text: systemInstruction}],
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
      topSpendingCategory: 'Error',
      spendingHabitAnalysis: 'Error',
      paymentBehaviorAnalysis: 'Error',
      actionableAdvice: 'Ai can not reached right now',
      predictedLimitDate: 'Error',

    };
  }
}

module.exports = { getFinancialInsights };