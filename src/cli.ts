// src/cli.ts
import readline from "readline";
import { connectDatabase } from "./database/sequelize";
import { answerQuestion } from "./rag/pipeline";

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
      const result = await answerQuestion(query);

      console.log(
        result.success ? `\n✅ ${result.answer}` : `\n❌ ${result.error}`,
      );

      askQuestion();
    });
  };

  askQuestion();
}

main();
