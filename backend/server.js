require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const rubricRoutes = require("./routes/rubricRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const checkAIContentRoutes = require("./routes/checkAIContentRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/rubrics", rubricRoutes);
app.use("/api/essays", fileRoutes);
app.use("/api/grade", gradeRoutes);
app.use("/api/checkAIContent", checkAIContentRoutes);

connectDB(); // Connect to MongoDB



const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
