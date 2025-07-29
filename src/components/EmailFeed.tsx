import { EmailCard, EmailData } from "./EmailCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Inbox } from "lucide-react";

interface EmailFeedProps {
  emails: EmailData[];
  isLoading: boolean;
  onEmailClick: (email: EmailData) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const EmailFeed = ({ 
  emails, 
  isLoading, 
  onEmailClick, 
  onLoadMore, 
  hasMore = false 
}: EmailFeedProps) => {
  if (emails.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No emails found</h3>
        <p className="text-muted-foreground max-w-md">
          No emails matching your current filters. Try adjusting your search criteria or check back later for new notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            onClick={() => onEmailClick(email)}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading emails...</span>
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Emails
          </Button>
        </div>
      )}

      {emails.length > 0 && !hasMore && !isLoading && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the feed
          </p>
        </div>
      )}
    </div>
  );
};