import { useState, useMemo } from "react";
import { useEmailData } from "@/hooks/useEmailData";
import { EmailData } from "@/components/EmailCard";
import { EmailFeed } from "@/components/EmailFeed";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { StatsCards } from "@/components/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { isToday, isThisWeek, isThisMonth } from "date-fns";

interface EmailDashboardProps {
  onEmailSelect?: (email: EmailData | null) => void;
  selectedEmail?: EmailData | null;
}

export const EmailDashboard = ({ onEmailSelect, selectedEmail }: EmailDashboardProps) => {
  const { 
    emails, 
    isLoading, 
    lastRefresh, 
    isAutoRefresh, 
    refreshEmails, 
    markAsRead, 
    toggleAutoRefresh 
  } = useEmailData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");

  // Filter emails based on search and filters
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Search filter
      const matchesSearch = !searchQuery || 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.senderEmail.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = selectedType === "all" || email.type === selectedType;

      // Date filter
      const matchesDate = selectedDate === "all" || 
        (selectedDate === "today" && isToday(email.timestamp)) ||
        (selectedDate === "week" && isThisWeek(email.timestamp)) ||
        (selectedDate === "month" && isThisMonth(email.timestamp));

      return matchesSearch && matchesType && matchesDate;
    });
  }, [emails, searchQuery, selectedType, selectedDate]);

  // Calculate stats
  const stats = useMemo(() => {
    const unreadEmails = emails.filter(email => !email.isRead).length;
    const todayEmails = emails.filter(email => isToday(email.timestamp)).length;
    
    return {
      totalEmails: emails.length,
      unreadEmails,
      todayEmails,
    };
  }, [emails]);

  const handleEmailClick = (email: EmailData) => {
    markAsRead(email.id);
    onEmailSelect?.(email);
  };

  if (selectedEmail) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => onEmailSelect?.(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold">{selectedEmail.subject}</h1>
                    <p className="text-muted-foreground">From: {selectedEmail.sender} ({selectedEmail.senderEmail})</p>
                  </div>
                </div>
                <Badge className="text-sm">
                  {selectedEmail.type}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedEmail.timestamp.toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-foreground leading-relaxed">
                  {selectedEmail.preview}
                </p>
                
                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This is a demonstration of the email content view. In a real implementation, 
                    this would display the full email content retrieved from your email service or API.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Email Notification Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Tracking emails from <Badge variant="outline" className="mx-1">For Particular</Badge> domain
          </p>
        </div>

        <StatsCards 
          totalEmails={stats.totalEmails}
          unreadEmails={stats.unreadEmails}
          todayEmails={stats.todayEmails}
          lastRefresh={lastRefresh}
        />

        <div className="mb-6">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            isAutoRefresh={isAutoRefresh}
            onAutoRefreshToggle={toggleAutoRefresh}
            onManualRefresh={refreshEmails}
            totalEmails={emails.length}
            filteredEmails={filteredEmails.length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Email Feed</span>
                  <Badge variant="secondary">
                    {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmailFeed
                  emails={filteredEmails}
                  isLoading={isLoading}
                  onEmailClick={handleEmailClick}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};