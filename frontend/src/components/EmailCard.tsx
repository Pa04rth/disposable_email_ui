import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Mail, Clock, User } from "lucide-react";

export interface EmailData {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: Date;
  type: "circular" | "notice" | "newsletter" | "announcement";
  isRead: boolean;
}

interface EmailCardProps {
  email: EmailData;
  onClick?: () => void;
}

const typeColors = {
  circular: "bg-primary/10 text-primary border-primary/20",
  notice: "bg-warning/10 text-warning border-warning/20",
  newsletter: "bg-info/10 text-info border-info/20",
  announcement: "bg-success/10 text-success border-success/20",
};

export const EmailCard = ({ email, onClick }: EmailCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
        !email.isRead ? 'border-primary/30 bg-accent/50' : 'hover:border-primary/20'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className={`h-4 w-4 ${!email.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`font-medium ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {email.sender}
            </span>
          </div>
          <Badge className={typeColors[email.type]}>
            {email.type}
          </Badge>
        </div>
        <h3 className={`font-semibold text-lg leading-tight ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
          {email.subject}
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {email.preview}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{email.senderEmail}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(email.timestamp, { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};