import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("task-1-db", "postgres", "1111", {
  host: "localhost",
  dialect: "postgres",
});
