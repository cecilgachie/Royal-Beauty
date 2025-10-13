require('dotenv').config();
const express = require("express");
const app = express();
const payments = require("./routes/payment");
const cors = require("cors");
const errorHandler = require("./errors/errorHandler");

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/api", payments);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
