
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Users, 
  CheckCircle,
  Star,
  Eye,
  Calendar
} from "lucide-react";

const VideoTutorials: React.FC = () => {
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const toggleWatched = (videoId: string) => {
    setWatchedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const videoCategories = [
    {
      category: "Getting Started",
      videos: [
        {
          id: "intro-platform",
          title: "Platform Introduction & Overview",
          description: "Complete walkthrough of the CloudOps Manager platform",
          duration: "12:30",
          level: "Beginner",
          views: "2.1k",
          rating: 4.8,
          publishDate: "2024-01-15",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "first-login",
          title: "First Login & Account Setup",
          description: "Step-by-step guide to setting up your account and profile",
          duration: "8:15",
          level: "Beginner",
          views: "1.8k",
          rating: 4.7,
          publishDate: "2024-01-16",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "connect-cloud",
          title: "Connecting Your First Cloud Provider",
          description: "How to securely connect AWS, Azure, or GCP accounts",
          duration: "15:45",
          level: "Beginner",
          views: "1.5k",
          rating: 4.9,
          publishDate: "2024-01-18",
          thumbnail: "/api/placeholder/320/180"
        }
      ]
    },
    {
      category: "Dashboard & Monitoring",
      videos: [
        {
          id: "dashboard-deep-dive",
          title: "Dashboard Deep Dive",
          description: "Understanding all dashboard components and metrics",
          duration: "18:20",
          level: "Intermediate",
          views: "1.2k",
          rating: 4.6,
          publishDate: "2024-01-20",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "custom-alerts",
          title: "Setting Up Custom Alerts",
          description: "Create and configure monitoring alerts for your infrastructure",
          duration: "14:30",
          level: "Intermediate",
          views: "980",
          rating: 4.8,
          publishDate: "2024-01-22",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "real-time-monitoring",
          title: "Real-time Monitoring Best Practices",
          description: "Optimize your monitoring setup for better insights",
          duration: "22:15",
          level: "Advanced",
          views: "756",
          rating: 4.7,
          publishDate: "2024-01-25",
          thumbnail: "/api/placeholder/320/180"
        }
      ]
    },
    {
      category: "Security & Compliance",
      videos: [
        {
          id: "security-scanning",
          title: "Automated Security Scanning",
          description: "Configure and run security scans on your infrastructure",
          duration: "16:40",
          level: "Intermediate",
          views: "1.1k",
          rating: 4.9,
          publishDate: "2024-01-28",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "compliance-reporting",
          title: "Compliance Reporting & Management",
          description: "Generate compliance reports for SOC 2, PCI DSS, and more",
          duration: "19:25",
          level: "Advanced",
          views: "642",
          rating: 4.8,
          publishDate: "2024-02-01",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "vulnerability-management",
          title: "Vulnerability Management Workflow",
          description: "Complete workflow for managing security vulnerabilities",
          duration: "24:10",
          level: "Advanced",
          views: "534",
          rating: 4.7,
          publishDate: "2024-02-05",
          thumbnail: "/api/placeholder/320/180"
        }
      ]
    },
    {
      category: "Administration",
      videos: [
        {
          id: "user-management",
          title: "User Management & Roles",
          description: "Managing team members, roles, and permissions",
          duration: "13:50",
          level: "Intermediate",
          views: "892",
          rating: 4.6,
          publishDate: "2024-02-08",
          thumbnail: "/api/placeholder/320/180"
        },
        {
          id: "admin-panel",
          title: "Admin Panel Deep Dive",
          description: "Complete guide to administrative features and settings",
          duration: "26:30",
          level: "Advanced",
          views: "445",
          rating: 4.9,
          publishDate: "2024-02-12",
          thumbnail: "/api/placeholder/320/180"
        }
      ]
    }
  ];

  const learningPaths = [
    {
      title: "Complete Beginner Path",
      description: "Perfect for users new to cloud infrastructure management",
      duration: "2 hours",
      videos: 6,
      path: ["intro-platform", "first-login", "connect-cloud", "dashboard-deep-dive", "custom-alerts", "user-management"]
    },
    {
      title: "Security Professional Path", 
      description: "Focused on security and compliance features",
      duration: "1.5 hours",
      videos: 4,
      path: ["security-scanning", "compliance-reporting", "vulnerability-management", "admin-panel"]
    },
    {
      title: "Administrator Path",
      description: "Complete training for platform administrators",
      duration: "3 hours",
      videos: 8,
      path: ["intro-platform", "dashboard-deep-dive", "security-scanning", "user-management", "admin-panel", "real-time-monitoring", "compliance-reporting", "vulnerability-management"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Learning Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningPaths.map((path, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2">{path.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                <div className="flex items-center space-x-4 mb-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{path.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Play className="h-4 w-4" />
                    <span>{path.videos} videos</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">Start Learning Path</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Categories */}
      <div className="space-y-6">
        {videoCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.videos.map((video) => (
                  <div key={video.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Video Thumbnail */}
                    <div className="relative bg-gray-200 h-40 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white bg-black bg-opacity-50 rounded-full p-3" />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWatched(video.id)}
                          className="p-1 h-auto bg-black bg-opacity-50 hover:bg-opacity-70"
                        >
                          {watchedVideos.includes(video.id) ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <div className="h-4 w-4 border-2 border-white rounded-full" />
                          )}
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.duration}
                        </Badge>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {video.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={video.level === 'Beginner' ? 'default' : video.level === 'Intermediate' ? 'secondary' : 'destructive'}>
                          {video.level}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span>{video.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{video.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(video.publishDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {watchedVideos.length}
              </div>
              <div className="text-sm text-muted-foreground">Videos Watched</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((watchedVideos.length / videoCategories.reduce((total, cat) => total + cat.videos.length, 0)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.floor(watchedVideos.length * 15 / 60)}h {(watchedVideos.length * 15) % 60}m
              </div>
              <div className="text-sm text-muted-foreground">Watch Time</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {videoCategories.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTutorials;
