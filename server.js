import express from "express";
import "./config/database.js";
import Product from "./models/Product.js";
import Stock from "./models/Stock.js";
import { sequelize } from "./config/database.js";

const app = express();
app.use(express.json());

sequelize.sync().then(() => {
  console.log("Database synced");
});

app.post("/product", async (req, res) => {
  const { plu, name } = req.body;
  try {
    const product = await Product.create({ plu, name });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/stock", async (req, res) => {
  const { productId, shopId, quantityOnShelf, quantityInOrder } = req.body;
  try {
    const stock = await Stock.create({
      productId,
      shopId,
      quantityOnShelf,
      quantityInOrder,
    });
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/stock/increase", async (req, res) => {
  const { stockId, quantity } = req.body;
  try {
    const stock = await Stock.findByPk(stockId);
    stock.quantityOnShelf += quantity;
    await stock.save();

    // send data to history service
    fetch("http://localhost:4000/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "increase",
        shopId: stock.shopId,
        plu: stock.plu,
        date: new Date(),
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("History saved", data))
      .catch((error) => console.error("Error recording history", error));

    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/stock/decrease", async (req, res) => {
  const { stockId, quantity } = req.body;
  try {
    const stock = await Stock.findByPk(stockId);
    stock.quantityOnShelf -= quantity;
    await stock.save();

    // send data to history service
    fetch("http://localhost:4000/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "decrease",
        shopId: stock.shopId,
        plu: stock.plu,
        date: new Date(),
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("History saved", data))
      .catch((error) => console.error("Error recording history", error));

    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/stocks", async (req, res) => {
  const {
    plu,
    shopId,
    quantityOnShelfMin,
    quantityOnShelfMax,
    quantityInOrderMin,
    quantityInOrderMax,
  } = req.query;
  const where = {};
  if (plu) where.plu = plu;
  if (shopId) where.shopId = shopId;
  if (quantityOnShelfMin)
    where.quantityOnShelf = { [Op.gte]: quantityInOrderMin };
  if (quantityOnShelfMax)
    where.quantityOnShelf = {
      ...where.quantityOnShelf,
      [Op.lte]: quantityOnShelfMax,
    };
  if (quantityInOrderMin)
    where.quantityInOrder = { [Op.gte]: quantityInOrderMin };
  if (quantityInOrderMax)
    where.quantityInOrder = {
      ...where.quantityInOrder,
      [Op.lte]: quantityInOrderMax,
    };

  try {
    const stocks = await Stock.findAll({ where, include: Product });
    res.json(stocks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/products", async (req, res) => {
  const { name, plu } = req.query;
  const where = {};
  if (name) where.name = { [Op.like]: `%${name}%` };
  if (plu) where.plu = plu;

  try {
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
