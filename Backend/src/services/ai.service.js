import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";   
import { searchWeb } from "./internet.service.js";

const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const searchWebtool = tool(
  searchWeb,
  {
    name: "search-web",
    description: "Search the web for relevant information to answer user queries. Use this tool when you need to find up-to-date information or verify facts.",
    schema: z.object({
      query: z.string().describe("The search query to find relevant information on the internet.")
    })
  }
);

const agent = createAgent({
  model: geminimodel,
  tools: [searchWebtool],
});


export async function generateResponse(messages) {
  const response = await agent.invoke({
    messages:[
      new SystemMessage(`You are a helpful assistant that provides accurate and concise answers to user queries. You have access to a tool called "search-web" that allows you to search the internet for relevant information to answer user questions. Use this tool when you need to find up-to-date information or verify facts. Always provide accurate and concise answers based on the information available to you.`),
      ...messages.map(msg => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    })]
  });

  return response.messages[response.messages.length - 1].content;
}

export async function generateChatTitle(message) {
  const response = await mistralmodel.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise titles for chat conversations.
       User will provide a message from a chat conversation, and you will generate a concise title for that conversation in 3 words or less. The title should capture the essence of the conversation and be relevant to the content of the message. Please provide only the title without any additional text or explanation.`),
    new HumanMessage(`Generate a concise title for the following chat message: ${message}`)
  ]);
  return response.content;
}
