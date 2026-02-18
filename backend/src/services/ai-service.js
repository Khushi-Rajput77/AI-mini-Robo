// const {GoogleGenAI} = require("@google/genai")

// const ai = new GoogleGenAI({});

// async function generateResponse(prompt){
//     const response = await ai.models.generateContent({
//         model:"gemini-2.0-flash",
//         contents:prompt,
//     })

//     return response.text;
// }

// module.exports = generateResponse;

// import { OpenRouter } from '@openrouter/sdk';

// const openRouter = new OpenRouter({
//   apiKey: 'Your Api key',
//   defaultHeaders: {
//     'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
//     'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
//   },
// });

// const completion = await openRouter.chat.send({
//   model: 'openai/gpt-5.2',
//   messages: [
//     {
//       role: 'user',
//       content: 'What is the meaning of life?',
//     },
//   ],
//   stream: false,
// });

// console.log(completion.choices[0].message.content);


const { OpenRouter } = require("@openrouter/sdk");

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY, // safer
});

async function generateResponse(chatHistory) {
  const completion = await openRouter.chat.send({
    chatGenerationParams: {   // ✅ THIS IS REQUIRED
      model: "openai/gpt-4o-mini", // use valid model
      messages: chatHistory,

      stream: false,
    },
  });

  return completion.choices[0].message.content;
}

module.exports = generateResponse;
