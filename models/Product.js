import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Product = sequelize.define("Product", {
  plu: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Product;
