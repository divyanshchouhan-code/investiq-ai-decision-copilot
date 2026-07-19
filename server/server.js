const express = require('express');
const app = express();

const PORT = 5000

app.get("/", (request, response) => {
    response.send("InvestIq backend is running");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
