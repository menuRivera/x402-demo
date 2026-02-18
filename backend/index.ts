import express from "express";
import cors from "cors";
import { paymentRequired } from "./middleware/paymentRequired";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("x402 Demo Server. Go to /protected to test.");
});

app.get("/protected", paymentRequired, (req, res) => {
  res.json({
    message: "Access Granted! You have paid explicitly.",
    content: "This is the secret content you paid for.",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
