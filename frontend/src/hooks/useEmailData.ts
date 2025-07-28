import { useState, useEffect, useCallback } from "react";
import { EmailData } from "@/components/EmailCard";
import { toast } from "@/hooks/use-toast";

// Mock data generator for demonstration
const generateMockEmail = (id: number): EmailData => {
  const senders = [
    "Dr. Raj Kumar", "Prof. Priya Sharma", "Admin Office", "IT Department", 
    "Examination Cell", "Training & Placement", "Library", "Hostel Warden"
  ];
  
  const subjects = [
    "Important Circular: Academic Calendar Update",
    "Notice: Examination Schedule Released",
    "Newsletter: Monthly Campus Updates",
    "Announcement: New Course Registration Open",
    "Circular: Fee Payment Deadline Extended",
    "Notice: Guest Lecture by Industry Expert",
    "Newsletter: Student Achievement Recognition",
    "Announcement: Infrastructure Development Update"
  ];

  const types: Array<"circular" | "notice" | "newsletter" | "announcement"> = 
    ["circular", "notice", "newsletter", "announcement"];

  const previews = [
    "This is to inform all students and faculty about the updated academic calendar for the current semester...",
    "The examination schedule has been finalized and uploaded to the official portal. Students are advised to check...",
    "We are pleased to share the latest updates from our campus including new facilities, achievements, and upcoming events...",
    "Registration for the new elective courses has begun. Students can access the portal using their credentials...",
    "Due to technical difficulties, the fee payment deadline has been extended by one week. Please ensure timely payment...",
    "We are organizing a guest lecture by a renowned industry expert. All students are encouraged to attend...",
    "Congratulations to our students for their outstanding performance in various competitions and academic achievements...",
    "The campus infrastructure development project is progressing well. New facilities will be available soon..."
  ];

  const sender = senders[Math.floor(Math.random() * senders.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const preview = previews[Math.floor(Math.random() * previews.length)];

  return {
    id: `email-${id}`,
    sender,
    senderEmail: `${sender.toLowerCase().replace(/[^a-z]/g, '.')}@knit.ac.in`,
    subject,
    preview,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
    type,
    isRead: Math.random() > 0.3, // 70% read
  };
};

export const useEmailData = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  // Generate initial mock data
  useEffect(() => {
    const initialEmails = Array.from({ length: 25 }, (_, i) => generateMockEmail(i + 1));
    setEmails(initialEmails.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    setIsLoading(false);
    setLastRefresh(new Date());
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new email arrival (20% chance every 30 seconds)
      if (Math.random() < 0.2) {
        const newEmail = generateMockEmail(Date.now());
        setEmails(prev => {
          const updated = [newEmail, ...prev];
          toast({
            title: "New Email Received",
            description: `${newEmail.sender}: ${newEmail.subject}`,
          });
          return updated;
        });
      }
      setLastRefresh(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const refreshEmails = useCallback(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Add 1-3 new emails on manual refresh
      const newEmailCount = Math.floor(Math.random() * 3) + 1;
      const newEmails = Array.from({ length: newEmailCount }, (_, i) => 
        generateMockEmail(Date.now() + i)
      );
      
      setEmails(prev => {
        const combined = [...newEmails, ...prev];
        return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });
      
      setIsLoading(false);
      setLastRefresh(new Date());
      
      toast({
        title: "Emails Refreshed",
        description: `${newEmailCount} new email(s) found`,
      });
    }, 1000);
  }, []);

  const markAsRead = useCallback((emailId: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev);
    if (!isAutoRefresh) {
      toast({
        title: "Auto-refresh Enabled",
        description: "Emails will refresh automatically every 30 seconds",
      });
    } else {
      toast({
        title: "Auto-refresh Disabled",
        description: "Manual refresh required for new emails",
      });
    }
  }, [isAutoRefresh]);

  return {
    emails,
    isLoading,
    lastRefresh,
    isAutoRefresh,
    refreshEmails,
    markAsRead,
    toggleAutoRefresh,
  };
};