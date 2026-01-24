// src/cli.ts
import readline from "readline";
import { connectDatabase } from "./database/sequelize";
import { answerQuestion } from "./rag/pipeline";
import { getFunctionCall } from "./agent/function-calling";
import { dbTools, executeDatabaseFunction } from "./tools/database";

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

      try {
        console.log("\nThinking...");

        // 1. Get function call from LLM
        const functionCall = await getFunctionCall(query, dbTools);
        console.log("Function call:", functionCall);

        // 2. Execute the database function
        const result = await executeDatabaseFunction(
          functionCall.name,
          functionCall.arguments,
        );

        console.log("\nResult:", JSON.stringify(result, null, 2));
      } catch (error: any) {
        console.error("\n❌ Error:", error.message);
      }
      askQuestion();
    });
  };
  console.log("Welcome to the RAG CLI! Type your questions below.");
  askQuestion();
}

main();
