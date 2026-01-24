import { User } from "../models";
import Order from "../models/Order";

export const dbTools = [
  {
    name: "get_user_count",
    description: "Fetches the total number of users in the database.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_top_users_by_spending",
    description: "Fetches the top N users by total amount spent.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of top users to return" },
      },
      required: ["limit"],
    },
  },
  {
    name: "get_recent_orders",
    description: "Fetches the most recent N orders placed in the database.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of recent orders to return",
        },
      },
      required: ["limit"],
    },
  },
  {
    name: "get_average_order_value",
    description: "Fetches the average value of all orders placed.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "execute_custom_sql",
    description:
      "Execute a custom SQL SELECT query for complex questions or when no specific function matches. Use this as a fallback for any database query not covered by other functions.",
    parameters: {
      type: "object",
      properties: {
        sql: { type: "string", description: "SELECT query to execute" },
      },
      required: ["sql"],
    },
  },
];

export async function executeDatabaseFunction(
  name: string,
  args: any,
): Promise<any> {
  switch (name) {
    case "get_user_count":
      const userCount = await User.count();
      return { count: userCount };
    case "get_top_users_by_spending":
      const limit = args.limit || 10;
      const topUsers = await User.findAll({
        order: [["totalSpent", "DESC"]],
        limit,
      });
      return topUsers;
    case "get_recent_orders":
      const recentLimit = args.limit || 10;

      const recentOrders = await Order.findAll({
        order: [["createdAt", "DESC"]],
        limit: recentLimit,
      });
      return recentOrders;
    case "get_average_order_value":
      const orders = await Order.findAll();
      const totalValue = orders.reduce(
        (sum, order) => sum + order.price * order.quantity,
        0,
      );
      const averageOrderValue =
        orders.length > 0 ? totalValue / orders.length : 0;
      return { averageOrderValue };
    case "execute_custom_sql":
      const sql = args.sql;

      const normalized = sql.trim().toUpperCase();
      if (!normalized.startsWith("SELECT")) {
        throw new Error("Only SELECT queries are allowed");
      }

      const [results] = await Order.sequelize!.query(sql);
      return results;
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}
