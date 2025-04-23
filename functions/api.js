require("dotenv").config();
const express = require("express");
const path = require("path");
const { findStorageLocations } = require("../storage-service");
const ServerlessHttp = require("serverless-http");

// import express from "express";
// import path from "path";
// import { findStorageLocations } from "../storage-service";
// import ServerlessHttp from "serverless-http";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/.netlify/functions/api", (req, res) => {
  res.json({ message: "Welcome to the Riley Neighbor Challenge API" });
});

app.get("/.netlify/functions/api/status", (req, res) => {
  res.json({ status: "Server is running" });
});

// Endpoint for vehicle storage search
app.post("/.netlify/functions/api/search", (req, res) => {
  try {
    const vehicles = req.body;
    if (!Array.isArray(vehicles)) {
      return res
        .status(400)
        .json({ error: "Request body must be an array of vehicles" });
    }

    const results = findStorageLocations(vehicles);
    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server Error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const handler = ServerlessHttp(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
