import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { EmailDashboard } from "./EmailDashboard"; // Assuming EmailDashboardProps is exported from here
import { EmailData } from "@/components/EmailCard";

const DeviceVerification = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Replace this URL with your actual backend API endpoint
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        // Store the email in localStorage for the EmailDashboard to use
        localStorage.setItem("verifiedEmail", email);
      } else {
        setError(data.message || "Email verification failed");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setError("Failed to verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSelect = (email: EmailData | null) => {
    setSelectedEmail(email);
  };

  const handleBackToVerification = () => {
    setIsVerified(false);
    setEmail("");
    setSelectedEmail(null);
    localStorage.removeItem("verifiedEmail");
  };

  // If verified, show the email dashboard
  if (isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Email Dashboard</h1>
              <p className="text-muted-foreground">
                Monitoring emails for: {email}
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToVerification}>
              Change Email
            </Button>
          </div>
          <EmailDashboard
            onEmailSelect={handleEmailSelect}
            selectedEmail={selectedEmail}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Email Notification Monitor</CardTitle>
          <p className="text-muted-foreground">
            Enter your email address to monitor notifications and disposable
            emails
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Submit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have access?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate("/email-dashboard")}
              >
                Go to Dashboard
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceVerification;
