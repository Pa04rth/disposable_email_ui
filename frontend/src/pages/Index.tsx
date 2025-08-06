import { useState } from "react";
import  {EmailDashboard}  from "./EmailDashboard";
import { EmailData } from "@/components/EmailCard";
import DiviceVerification from "./deviceVerification";
import Cards from "./Cards";

const Index = () => {
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Email Dashboard</h1>
      <DiviceVerification />
      <Cards/>
      {/* Render EmailDashboard only if an email is selected */}
      {selectedEmail ? (
        <EmailDashboard
          selectedEmail={selectedEmail}
          onEmailSelect={setSelectedEmail}
        />
      ) : (
        <p className="text-gray-500">Please select an email to view details.</p>
      )}
    </div>
  );
};

export default Index;
