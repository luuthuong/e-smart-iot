import * as functions from "firebase-functions";
import express from "express";
import { addEntry } from "./controller/addEntry";
import { ask } from "./controller/ask";

const app = express();
app.get("/", (req, res) => res.status(200).send("Hey there!"));
app.post("/add-entry", addEntry);
app.post("/ask", ask);
exports.app = functions.https.onRequest(app);
