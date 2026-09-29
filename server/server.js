require("dotenv").config();
const app = require("./app");
const connectDB = require('./config/db');
const aiRoutes = require("./routes/aiRoutes");
const PORT = process.env.PORT || 5000;
connectDB();

app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})