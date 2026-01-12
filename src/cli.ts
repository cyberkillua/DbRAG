import readline from "readline";
import { connectDatabase } from "./database/sequelize";
import { User } from "./models";

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
