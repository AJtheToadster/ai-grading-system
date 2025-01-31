require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const rubricRoutes = require("./routes/rubricRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/rubrics", rubricRoutes);


connectDB(); // Connect to MongoDB

app.use("/api/essays", fileRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
