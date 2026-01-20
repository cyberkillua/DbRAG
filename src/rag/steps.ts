// src/rag/steps.ts
import sequelize from "../database/sequelize";
import { QueryTypes } from "sequelize";

export async function executeSql(sql: string): Promise<any[]> {
  return await sequelize.query(sql, { type: QueryTypes.SELECT });
}

export const extractYesNo = (text: string): boolean =>
  text.toLowerCase().includes("yes");
