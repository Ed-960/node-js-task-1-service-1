import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Product from "./Product.js";

const Stock = sequelize.define("Stock", {
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: "id",
    },
    allowNull: false,
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantityOnShelf: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  quantityInOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

Product.hasMany(Stock, { foreignKey: "productId" });
Stock.belongsTo(Product, { foreignKey: "productId" });

export default Stock;
