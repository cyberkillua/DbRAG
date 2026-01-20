// src/rag/pipeline.ts
import { generateWithOllama } from "../llm/ollama";
import {
  buildSqlPrompt,
  buildAnswerPrompt,
  buildJudgePrompt,
} from "../prompts";
import { containsDangerousWord, isSelectQuery } from "../utils/security";
import { executeSql, extractYesNo } from "./steps";

type RagResult = {
  success: boolean;
  answer?: string;
  error?: string;
  metadata?: {
    sql: string;
    results: any[];
    judgeVerdict: string;
  };
};

export async function answerQuestion(
  question: string,
  config = {
    sqlModel: "qwen2.5:7b",
    answerModel: "qwen2.5:7b",
    judgeModel: "qwen2.5:7b",
  },
): Promise<RagResult> {
  try {
    // 1. Security check
    if (containsDangerousWord(question)) {
      return {
        success: false,
        error:
          "I can only answer questions about your data, not perform modifications.",
      };
    }

    // 2. Generate SQL
    const sqlPrompt = buildSqlPrompt(question);
    const sql = await generateWithOllama(config.sqlModel, sqlPrompt);
    console.log("\nGenerated SQL:", sql);

    // 3. Validate SQL
    if (!isSelectQuery(sql)) {
      return {
        success: false,
        error: "Only SELECT queries are allowed.",
      };
    }

    // 4. Execute SQL
    const results = await executeSql(sql);
    console.log("\nResults:", JSON.stringify(results, null, 2));

    // 5. Generate answer
    const answerPrompt = buildAnswerPrompt(question, results);
    const answer = await generateWithOllama(config.answerModel, answerPrompt);
    console.log("\nAnswer:", answer);

    // 6. Judge answer
    const judgePrompt = buildJudgePrompt(question, results, answer);
    const judgeVerdict = await generateWithOllama(
      config.judgeModel,
      judgePrompt,
    );
    console.log("\nJudge:", judgeVerdict);

    const isValid = extractYesNo(judgeVerdict);

    if (!isValid) {
      return {
        success: false,
        error: "I couldn't find a satisfactory answer based on the data.",
        metadata: { sql, results, judgeVerdict },
      };
    }

    return {
      success: true,
      answer,
      metadata: { sql, results, judgeVerdict },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
