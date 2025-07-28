import { useState } from "react";
import { EmailDashboard } from "./EmailDashboard";
import { EmailData } from "@/components/EmailCard";

const Index = () => {
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

  return (
    <EmailDashboard 
      selectedEmail={selectedEmail}
      onEmailSelect={setSelectedEmail}
    />
  );
};

export default Index;
