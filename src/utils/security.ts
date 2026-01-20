// src/utils/security.ts
const DANGEROUS_WORDS = [
  "delete",
  "remove",
  "drop",
  "update",
  "modify",
  "create",
  "insert",
  "add",
];

export const containsDangerousWord = (query: string): boolean =>
  DANGEROUS_WORDS.some((word) => query.toLowerCase().includes(word));

export const isSelectQuery = (sql: string): boolean =>
  sql.trim().toUpperCase().startsWith("SELECT");
