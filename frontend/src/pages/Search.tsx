import React, { useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MailSearch, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type FetchedEmail = {
  id: string;
  from: string;
  to: string; // Added receiver email
  subject: string;
  snippet: string;
  body: string;
  timestamp: string | number;
};

const domains = [
  "luxidevilott.com",
  "devilott.store",
  "devilott.site",
  "devilott.art",
  "devilott.online",
  "devilott.live",
];

const apiUrl = "https://api.luxidevilott.com";

const SafeEmailBody: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const cleanHTML = DOMPurify.sanitize(htmlContent || "");
  return (
    <div
      className="w-full h-auto overflow-x-auto prose max-w-none"
      style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
    >
      <div style={{ width: "100%", height: "100%" }}>{parse(cleanHTML)}</div>
      <style>{`
        .prose img { max-width: 100%; height: auto; }
        .prose table { width: 100%; border-collapse: collapse; }
        .prose iframe, .prose video { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
};

const Search = () => {
  const [domainInput, setDomainInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(domains[0]);
  const [subject, setSubject] = useState("");

  // State for each search type
  const [domainReceivers, setDomainReceivers] = useState<string[]>([]); // For block 1 results
  const [subjectEmails, setSubjectEmails] = useState<FetchedEmail[]>([]); // For block 2 results

  const [domainLoading, setDomainLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [domainError, setDomainError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    null
  );

  const fetchEmailsRaw = async (params: Record<string, string>) => {
    try {
      const resp = await axios.get(`${apiUrl}/api`, { params });
      if (Array.isArray(resp.data)) return resp.data as FetchedEmail[];
      if (resp.data?.emails && Array.isArray(resp.data.emails))
        return resp.data.emails as FetchedEmail[];
      return [];
    } catch (err: any) {
      if (err?.response?.status === 400 && params.domain) {
        try {
          // Corrected fallback logic to always include the subject if it exists
          const fallbackParams: Record<string, string> = { to: params.domain };
          if (params.subject) {
            fallbackParams.subject = params.subject;
          }

          const fallbackResp = await axios.get(`${apiUrl}/api`, {
            params: fallbackParams,
          });

          if (Array.isArray(fallbackResp.data))
            return fallbackResp.data as FetchedEmail[];
          if (
            fallbackResp.data?.emails &&
            Array.isArray(fallbackResp.data.emails)
          )
            return fallbackResp.data.emails as FetchedEmail[];
          return [];
        } catch (fbErr: any) {
          const message =
            fbErr?.response?.data ??
            fbErr?.message ??
            "Fallback request failed";
          throw new Error(String(message));
        }
      }
      const message = err?.response?.data ?? err?.message ?? "Request failed";
      throw new Error(String(message));
    }
  };

  // Domain-only search for receiver list
  const handleDomainSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Clear other search results and errors
    setSubjectEmails([]);
    setSubjectError("");

    setDomainError("");
    setDomainReceivers([]);
    const domainToUse = domainInput.trim() || selectedDomain;
    if (!domainToUse) {
      setDomainError("Please provide a domain to search.");
      return;
    }
    setDomainLoading(true);
    try {
      const data = await fetchEmailsRaw({ domain: domainToUse });
      // Extract unique receiver emails
      const uniqueReceivers = [
        ...new Set(data.map((email) => email.to).filter(Boolean)),
      ];
      setDomainReceivers(uniqueReceivers);
    } catch (err: any) {
      console.error("Domain search error:", err);
      setDomainError(String(err?.message ?? "Failed to fetch domain emails"));
    } finally {
      setDomainLoading(false);
    }
  };

  // Domain + subject search with client-side filtering
  const handleDomainSubjectSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Clear other search results and errors
    setDomainReceivers([]);
    setDomainError("");

    setSubjectError("");
    setSubjectEmails([]);
    const domainToUse = selectedDomain;
    const subjectToSearch = subject.trim().toLowerCase();

    if (!domainToUse) {
      setSubjectError("Please select a domain.");
      return;
    }
    if (!subjectToSearch) {
      setSubjectError("Please enter a subject keyword.");
      return;
    }
    setSubjectLoading(true);
    try {
      // 1. Fetch all emails for the domain.
      const allEmailsForDomain = await fetchEmailsRaw({
        domain: domainToUse,
      });

      // 2. Filter the results on the client-side.
      const filteredEmails = allEmailsForDomain.filter(
        (email) =>
          email.subject && email.subject.toLowerCase().includes(subjectToSearch)
      );

      setSubjectEmails(filteredEmails);
    } catch (err: any) {
      console.error("Domain+Subject search error:", err);
      setSubjectError(
        String(err?.message ?? "Failed to fetch filtered emails")
      );
    } finally {
      setSubjectLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <form
        onSubmit={handleDomainSearch}
        className="border-2 w-full border-red-500 p-4 rounded"
      >
        <h1 className="text-2xl font-bold mb-4">Search Receivers by Domain</h1>
        <div className="flex flex-col gap-3">
          <Label htmlFor="domain">Domain:</Label>
          <Input
            id="domain"
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="Enter domain (e.g., example.com)"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={domainLoading}>
              <Users className="mr-2 h-4 w-4" />
              {domainLoading ? "Searching..." : "Find Receivers"}
            </Button>
          </div>
        </div>
      </form>

      <form
        onSubmit={handleDomainSubjectSearch}
        className="border-2 w-full border-blue-500 p-4 rounded"
      >
        <h1 className="text-2xl font-bold mb-4">
          Search Full Emails by Domain and Subject
        </h1>
        <div className="flex flex-col gap-3">
          <Label htmlFor="domainSelect">Select Domain:</Label>
          <select
            id="domainSelect"
            className="px-3 py-2 border rounded"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Label htmlFor="subject">Subject Keyword:</Label>
          <Input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject keyword"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={subjectLoading}>
              <MailSearch className="mr-2 h-4 w-4" />
              {subjectLoading ? "Searching..." : "Search Emails"}
            </Button>
          </div>
        </div>
      </form>

      {domainError && (
        <Alert variant="destructive">
          <AlertDescription>{domainError}</AlertDescription>
        </Alert>
      )}
      {subjectError && (
        <Alert variant="destructive">
          <AlertDescription>{subjectError}</AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Receiver List ({domainReceivers.length})
        </h2>
        <div className="space-y-2">
          {domainReceivers.map((receiver, index) => (
            <div
              key={index}
              className="p-2 border rounded bg-card text-card-foreground"
            >
              {receiver}
            </div>
          ))}
          {!domainLoading && domainReceivers.length === 0 && (
            <p className="text-muted-foreground">
              No receivers found for this domain.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Email Results ({subjectEmails.length})
        </h2>
        <div className="space-y-2">
          {subjectEmails.map((email) => (
            <Card
              key={email.id}
              className="cursor-pointer"
              onClick={() =>
                setExpandedSubjectId(
                  expandedSubjectId === email.id ? null : email.id
                )
              }
            >
              <CardHeader className="p-4 flex justify-between items-start">
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">From:</span> {email.from}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">To:</span> {email.to}
                  </p>
                  <p className="font-bold mt-1">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {email.snippet}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground text-right flex-shrink-0 ml-4">
                  <p>{new Date(email.timestamp).toLocaleString()}</p>
                  <p className="text-xs mt-1">
                    {expandedSubjectId === email.id
                      ? "Click to collapse"
                      : "Click to expand"}
                  </p>
                </div>
              </CardHeader>
              {expandedSubjectId === email.id && (
                <CardContent className="p-4 border-t">
                  <SafeEmailBody htmlContent={email.body} />
                </CardContent>
              )}
            </Card>
          ))}
          {!subjectLoading && subjectEmails.length === 0 && (
            <p className="text-muted-foreground">
              No emails found for this domain and subject.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
