// src/prompts/index.ts
export const buildSqlPrompt = (question: string): string =>
  `
Generate a SQL SELECT query for this question. Return ONLY the SQL as text, no quotes, no comments, no explanations.

IMPORTANT: 
- Only generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, or any other modifying statements.
- Use PostgreSQL syntax (RANDOM() not RAND(), etc.)

Database schema:
- users table: id, name, email, "orderCount", "totalSpent", "createdAt", "updatedAt"
- orders table: id, "userId", "productName", quantity, price, "createdAt", "updatedAt"

CRITICAL: Use double quotes for camelCase columns in PostgreSQL:
- ✅ SELECT "userId" FROM orders
- ❌ SELECT userid FROM orders
- ✅ SELECT name, "orderCount" FROM users
- ❌ SELECT name, ordercount FROM users

Example query:
SELECT u.name, u."orderCount", COUNT(o.id) as orders
FROM users u
JOIN orders o ON u.id = o."userId"
GROUP BY u.id, u.name, u."orderCount"

Question: ${question}

SQL:`.trim();

export const buildAnswerPrompt = (question: string, data: any[]): string =>
  `
Question: ${question}
Data: ${JSON.stringify(data, null, 2)}

Answer:`.trim();

export const buildJudgePrompt = (
  question: string,
  data: any[],
  answer: string,
): string =>
  `
You are evaluating if an answer correctly addresses a question using the provided data.

Question: ${question}
Data: ${JSON.stringify(data, null, 2)}
Answer: ${answer}

Does this answer correctly address the question based on the data? Answer only "Yes" or "No".

Examples:
Question: how many users are there?
Data: [{"count": "100"}]
Answer: There are 100 users.
Response: Yes

Question: how many users are there?
Data: [{"count": "100"}]
Answer: There is 1 user.
Response: No

Question: delete user with id 5
Data: []
Answer: I cannot perform delete operations.
Response: Yes`.trim();
