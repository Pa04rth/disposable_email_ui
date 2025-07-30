// File: /api/index.js

require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
app.use(cors()); // It's good practice to keep this

// --- Authentication Setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// --- API Endpoint ---
// The path becomes /api because of the folder name.
app.get("/", async (req, res) => {
  const targetEmail = req.query.to;

  if (!targetEmail) {
    return res.status(400).json({ error: "Target email is required" });
  }

  try {
    const searchResponse = await gmail.users.messages.list({
      userId: "me",
      q: `to:${targetEmail}`,
      maxResults: 50,
    });

    const messages = searchResponse.data.messages;
    if (!messages || messages.length === 0) {
      return res.json([]);
    }

    const emailPromises = messages.map((msg) => {
      return gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });
    });

    const emailResponses = await Promise.all(emailPromises);

    const formattedEmails = emailResponses.map((response) => {
      const detail = response.data;
      const headers = detail.payload.headers;
      const getHeader = (name) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
          ?.value || "";
      const subject = getHeader("subject");
      const from = getHeader("from");
      const date = getHeader("date");
      const to = getHeader("to");
      let body = "";
      if (detail.payload.parts) {
        const part =
          detail.payload.parts.find((p) => p.mimeType === "text/html") ||
          detail.payload.parts.find((p) => p.mimeType === "text/plain");
        if (part && part.body.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf8");
        }
      } else if (detail.payload.body.data) {
        body = Buffer.from(detail.payload.body.data, "base64").toString("utf8");
      }
      return {
        id: detail.id,
        subject,
        from,
        to,
        body,
        snippet: detail.snippet,
        timestamp: new Date(date),
        isRead: !detail.labelIds.includes("UNREAD"),
      };
    });

    res.json(formattedEmails);
  } catch (error) {
    console.error("Error fetching from Gmail API:", error);
    res.status(500).json({ error: "Failed to fetch emails from Gmail." });
  }
});

// THIS IS THE CRUCIAL CHANGE
// We no longer listen on a port. We export the app for Vercel.
module.exports = app;
