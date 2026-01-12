import type { Request, Response } from "express";
import { User } from "../models";

async function getUsers() {
  const users = await User.findAll();
  return users;
}

async function answerQuestion(query: string) {
  const users = await getUsers();

  const prompt = `Based on the following context, answer the question. If the answer is not in the context, say so.
  
  Context:
  ${JSON.stringify(users, null, 2)}
  
  Question: ${query}
  
  Answer:`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt,
      stream: false,
    }),
  });

  const data: any = await response.json();
  return {
    answer: data.response,
    sources: users,
  };
}

export const ragQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const result = await answerQuestion(query);
    res.json(result);
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
};
