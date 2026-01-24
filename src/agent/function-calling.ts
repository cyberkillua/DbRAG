// src/agent/function-calling.ts

import { generateWithOllama } from "../llm/ollama";

export const getFunctionCall = async (
  question: string,
  functions: Array<{ name: string; description: string; parameters: any }>,
) => {
  const toolDescription = functions
    .map((fn) => {
      return `Function Name: ${fn.name}\nDescription: ${fn.description}\nParameters: ${JSON.stringify(
        fn.parameters,
        null,
        2,
      )}`;
    })
    .join("\n\n");

  const prompt = `You are an AI assistant that can call functions to retrieve data from a database. 

Available functions:
${toolDescription}

IMPORTANT: If the user's question doesn't match any specific function, use execute_custom_sql with an appropriate SELECT query.

When the user asks a question, respond with ONLY a JSON object...

Examples:
User: How many users do we have?
Response: {"name": "get_user_count", "arguments": {}}

User: Show me the top 5 users by spending
Response: {"name": "get_top_users_by_spending", "arguments": {"limit": 5}}

User: Who has spent the most money?
Response: {"name": "get_top_users_by_spending", "arguments": {"limit": 1}}

User: What is the complex join query for users who placed orders in the last week?
Response: {"name": "execute_custom_sql", "arguments": {"sql": "SELECT u.name, COUNT(o.id) as order_count FROM users u JOIN orders o ON u.id = o.userId WHERE o.createdAt > NOW() - INTERVAL '7 days' GROUP BY u.name"}}

Now answer this:
User: ${question}
Response:`;

  const response = await generateWithOllama("llama3.1:8b", prompt);

  try {
    const functionCall = JSON.parse(response);
    return functionCall;
  } catch (error) {
    throw new Error(`Failed to parse function call: ${response}`);
  }
};
