// File: /api/index.js

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
app.use(cors());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// ======================================================================
// --- NEW HEALTH CHECK ROUTE ---
// This is the new code block. It handles requests to the root URL.
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "API for disposable-email-ui is running correctly.",
    timestamp: new Date().toISOString(), // Show current server time
  });
});
// ======================================================================

// --- YOUR EXISTING API ROUTE ---
// This remains unchanged.
app.get("/api", async (req, res) => {
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
    const emailPromises = messages.map((msg) =>
      gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" })
    );
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

// This part for local testing remains unchanged and correct.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `Backend server ready for local development at http://localhost:${PORT}`
    );
  });
}


const EmailDashboard = () => {
  const [emails, setEmails] = useState<FetchedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<FetchedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { emailAddress } = useParams<{ emailAddress: string }>();
  const navigate = useNavigate();

  const fetchEmails = async () => {
    if (!emailAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      // const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const apiUrl = "https://api.luxidevilott.com"

      const response = await fetch(
        `${apiUrl}/api?to=${encodeURIComponent(emailAddress)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch emails from server.");
      }
      const data: FetchedEmail[] = await response.json();
      setEmails(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [emailAddress]);

  if (!emailAddress) {
    return <div>Error: No email address provided.</div>;
  }

  // View for displaying the list of emails
  if (!selectedEmail) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Inbox for {emailAddress}</h1>
            <p className="text-muted-foreground">
              {emails.length} message(s) found.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={fetchEmails} disabled={isLoading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading && <p>Loading emails...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        <div className="space-y-2">
          {emails.map((email) => (
            <Card
              key={email.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedEmail(email)}
            >
              <CardContent className="p-4 flex justify-between">
                <div>
                  <p className="font-semibold">{email.from}</p>
                  <p className="font-bold">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {email.snippet}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(email.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // View for displaying a single selected email's content
  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        onClick={() => setSelectedEmail(null)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inbox
      </Button>
      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            From: {selectedEmail.from}
          </p>
          <CardTitle>{selectedEmail.subject}</CardTitle>
          <p className="text-sm text-muted-foreground">
            At: {new Date(selectedEmail.timestamp).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDashboard;

module.exports = app;

