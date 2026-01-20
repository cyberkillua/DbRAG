"use strict";
import { randomUUID } from "crypto";

export async function up(queryInterface, Sequelize) {
  const users = [];
  const now = new Date();
  for (let i = 1; i <= 50; i++) {
    users.push({
      id: randomUUID(),
      name: `User ${i}`,
      email: `user${i}@example.com`,
      orderCount: Math.floor(Math.random() * 10),
      totalSpent: Math.floor(Math.random() * 100000),
      createdAt: now,
      updatedAt: now,
    });
  }

  await queryInterface.bulkInsert("users", users, {});
}

export async function down(queryInterface, Sequelize) {
  const Op = Sequelize.Op;
  await queryInterface.bulkDelete(
    "users",
    { email: { [Op.like]: "user%@example.com" } },
    {},
  );
}
