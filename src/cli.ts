import readline from "readline";
import { connectDatabase } from "./database/sequelize";
import sequelize from "./database/sequelize";
import { QueryTypes } from "sequelize";

async function answerQuestion(query: string) {
  // After getting the query, before SQL generation
  const dangerousWords = [
    "delete",
    "remove",
    "drop",
    "update",
    "modify",
    "create",
    "insert",
    "add",
  ];
  const queryLower = query.toLowerCase();

  if (dangerousWords.some((word) => queryLower.includes(word))) {
    return {
      answer:
        "I can only answer questions about your data, not perform modifications. Try rephrasing as a question.",
    };
  }
  const sqlPrompt = `Generate a SQL SELECT query for this question. Return ONLY the SQL as text, no quotes, no comments, no explanations.

IMPORTANT: 
- Only generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, or any other modifying statements.
- Use PostgreSQL syntax (RANDOM() not RAND(), etc.)

Database schema:
- Users table: id, name, email, created_at, status

Question: ${query}

SQL:`;

  const sqlResponse = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "qwen2.5:7b",
      prompt: sqlPrompt,
      stream: false,
    }),
  });

  const sqlData: any = await sqlResponse.json();
  const sqlQuery = sqlData.response.trim().replaceAll("\n", " ");

  console.log("\nGenerated SQL Query:");
  console.log(sqlQuery);

  const normalizedQuery = sqlQuery.trim().toUpperCase();
  if (!normalizedQuery.startsWith("SELECT")) {
    console.error("❌ Security: Only SELECT queries are allowed");
    return {
      answer: "I can only answer questions that read data, not modify it.",
    };
  }

  // Step 2: Execute the SQL
  const results = await sequelize.query(sqlQuery, {
    type: QueryTypes.SELECT,
  });

  console.log("\nResults:");
  console.log(JSON.stringify(results, null, 2));

  // Step 3: Answer using only relevant results
  const answerPrompt = `Question: ${query}

Data: ${JSON.stringify(results, null, 2)}

Answer:`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen2.5:7b",
      prompt: answerPrompt,
      stream: false,
    }),
  });

  const data: any = await response.json();

  // add a judge to see if the answer matches the question

  return {
    answer: data.response,
  };
}

async function main() {
  await connectDatabase();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question("Ask a question (or 'quit' to exit): ", async (query) => {
      if (!query || query.toLowerCase() === "quit") {
        rl.close();
        process.exit(0);
      }

      console.log("\nSearching...");
      const { answer } = await answerQuestion(query);

      console.log("\nAnswer:");
      console.log(answer);

      askQuestion();
    });
  };

  askQuestion();
}

main();
