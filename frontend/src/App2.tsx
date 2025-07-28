"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Search, Filter, RefreshCw, Inbox, Calendar, Eye, EyeOff } from "lucide-react"

interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  timestamp: Date
  isRead: boolean
  priority: "high" | "medium" | "low"
  category: "work" | "personal" | "promotion" | "social"
}

interface MailStats {
  totalMails: number
  todayMails: number
  unreadMails: number
}

// Mock API functions
const fetchMails = async (): Promise<Email[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const senders = [
    "john@company.com",
    "sarah@startup.io",
    "notifications@github.com",
    "team@slack.com",
    "newsletter@medium.com",
    "alerts@aws.com",
  ]
  const subjects = [
    "Weekly Team Meeting",
    "Project Update Required",
    "New Pull Request",
    "System Maintenance Notice",
    "Monthly Newsletter",
    "Security Alert",
    "Invoice #12345",
    "Welcome to our platform",
    "Password Reset Request",
    "New Comment on your post",
  ]
  const categories: Email["category"][] = ["work", "personal", "promotion", "social"]
  const priorities: Email["priority"][] = ["high", "medium", "low"]

  const mails: Email[] = []
  const mailCount = Math.floor(Math.random() * 5) + 15 // 15-20 mails

  for (let i = 0; i < mailCount; i++) {
    const isToday = Math.random() > 0.3
    const timestamp = isToday
      ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Today
      : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last week

    mails.push({
      id: `mail-${i}`,
      sender: senders[Math.floor(Math.random() * senders.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      preview: `This is a preview of the email content. It contains important information about ${subjects[Math.floor(Math.random() * subjects.length)].toLowerCase()}.`,
      timestamp,
      isRead: Math.random() > 0.4,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
    })
  }

  return mails.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

const calculateStats = (mails: Email[]): MailStats => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return {
    totalMails: mails.length,
    todayMails: mails.filter((mail) => mail.timestamp >= today).length,
    unreadMails: mails.filter((mail) => !mail.isRead).length,
  }
}

export default function MailDashboard() {
  const [mails, setMails] = useState<Email[]>([])
  const [filteredMails, setFilteredMails] = useState<Email[]>([])
  const [stats, setStats] = useState<MailStats>({ totalMails: 0, todayMails: 0, unreadMails: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch mails function
  const loadMails = async () => {
    try {
      const fetchedMails = await fetchMails()
      setMails(fetchedMails)
      setStats(calculateStats(fetchedMails))
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch mails:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadMails()
  }, [])

  // Auto-refresh every second
  useEffect(() => {
    const interval = setInterval(() => {
      loadMails()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Filter mails based on search and filters
  useEffect(() => {
    let filtered = mails

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (mail) =>
          mail.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mail.preview.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((mail) => mail.category === filterCategory)
    }

    // Status filter
    if (filterStatus === "read") {
      filtered = filtered.filter((mail) => mail.isRead)
    } else if (filterStatus === "unread") {
      filtered = filtered.filter((mail) => !mail.isRead)
    }

    setFilteredMails(filtered)
  }, [mails, searchTerm, filterCategory, filterStatus])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getPriorityColor = (priority: Email["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryColor = (category: Email["category"]) => {
    switch (category) {
      case "work":
        return "bg-blue-100 text-blue-800"
      case "personal":
        return "bg-green-100 text-green-800"
      case "promotion":
        return "bg-purple-100 text-purple-800"
      case "social":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const markAsRead = (mailId: string) => {
    setMails((prevMails) => prevMails.map((mail) => (mail.id === mailId ? { ...mail, isRead: true } : mail)))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Mail Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {isLoading && <RefreshCw className="inline ml-2 h-4 w-4 animate-spin" />}
            </p>
          </div>
          <Button onClick={loadMails} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mails</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMails}</div>
              <p className="text-xs text-muted-foreground">All time emails</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Mails</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayMails}</div>
              <p className="text-xs text-muted-foreground">Received today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Mails</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unreadMails}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mail List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Mail List ({filteredMails.length} {filteredMails.length === 1 ? "mail" : "mails"})
            </CardTitle>
            <CardDescription>
              {searchTerm && `Filtered by: "${searchTerm}"`}
              {filterCategory !== "all" && ` • Category: ${filterCategory}`}
              {filterStatus !== "all" && ` • Status: ${filterStatus}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredMails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No mails found matching your criteria</p>
                  </div>
                ) : (
                  filteredMails.map((mail) => (
                    <div
                      key={mail.id}
                      className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                        !mail.isRead ? "bg-blue-50 border-blue-200" : "bg-white"
                      }`}
                      onClick={() => markAsRead(mail.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(mail.priority)}`} />
                            <span className="font-medium text-gray-900 truncate">{mail.sender}</span>
                            <Badge variant="secondary" className={getCategoryColor(mail.category)}>
                              {mail.category}
                            </Badge>
                            {!mail.isRead && (
                              <Badge variant="default" className="bg-blue-600">
                                New
                              </Badge>
                            )}
                          </div>
                          <h3 className={`text-sm mb-1 truncate ${!mail.isRead ? "font-semibold" : "font-medium"}`}>
                            {mail.subject}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{mail.preview}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {mail.isRead ? (
                            <Eye className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(mail.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
