"use strict";
import { randomUUID } from "crypto";

const productNames = [
  "Laptop",
  "Mouse",
  "Keyboard",
  "Monitor",
  "Headphones",
  "Webcam",
  "USB Hub",
  "Desk Lamp",
  "Phone Charger",
  "USB Cable",
];

export async function up(queryInterface, Sequelize) {
  // Get all user IDs from the users table
  const users = await queryInterface.sequelize.query("SELECT id FROM users;", {
    type: Sequelize.QueryTypes.SELECT,
  });

  if (users.length === 0) {
    console.warn("No users found. Skipping order seeding.");
    return;
  }

  const orders = [];
  const now = new Date();

  // Create 100 orders
  for (let i = 0; i < 100; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    orders.push({
      id: randomUUID(),
      userId: randomUser.id,
      productName:
        productNames[Math.floor(Math.random() * productNames.length)],
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Math.floor(Math.random() * 50000) + 1000,
      createdAt: now,
      updatedAt: now,
    });
  }

  await queryInterface.bulkInsert("orders", orders, {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("orders", {}, {});
}
