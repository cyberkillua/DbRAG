import readline from "readline";
import { connectDatabase } from "./database/sequelize";
import sequelize from "./database/sequelize";
import { QueryTypes } from "sequelize";

async function answerQuestion(query: string) {
  const sqlPrompt = `Generate a SQL SELECT query for this question. Return ONLY the SQL as text, no qoutes, no comments, no explanations, no table names, no aliases, no joins, and no newlines.

Database schema:
- Users table: id, name, email, created_at, status

Question: ${query}

SQL:`;

  const sqlResponse = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt: sqlPrompt,
      stream: false,
    }),
  });

  const sqlData: any = await sqlResponse.json();
  const sqlQuery = sqlData.response.trim().replaceAll("\n", " ", ` `);

  console.log("\nGenerated SQL Query:");
  console.log(sqlQuery);

  // Step 2: Execute the SQL
  const results = await sequelize.query(sqlQuery, {
    type: QueryTypes.SELECT,
  });

  console.log("\nResults:");
  console.log(JSON.stringify(results, null, 2));

  // Step 3: Answer using only relevant results
  const answerPrompt = `Based on this data, answer the question.

Data: ${JSON.stringify(results, null, 2)}
  
  Answer:`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt: answerPrompt,
      stream: false,
    }),
  });

  const data: any = await response.json();
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
