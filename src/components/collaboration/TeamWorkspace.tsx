
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  Users,
  Plus,
  MessageSquare,
  CalendarDays,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { 
  getTeams, 
  getTeamById, 
  getWorkItems,
  getTeamPresence,
  Team,
  TeamMember,
  WorkItem
} from "@/services/collaborationService";

interface TeamMemberWithPresence extends TeamMember {
  profile: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  presence?: {
    status: 'online' | 'away' | 'busy' | 'offline';
    last_seen: string;
  };
}

interface TeamWorkspaceProps {
  onCreateWorkItem?: () => void;
  onViewWorkItem?: (workItemId: string) => void;
}

const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ 
  onCreateWorkItem, 
  onViewWorkItem 
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithPresence[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState({
    teams: true,
    teamDetails: false,
    workItems: false,
  });
  const [userPresence, setUserPresence] = useState<Record<string, any>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
        
        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0]);
        }
      } catch (error) {
        console.error("Error loading teams:", error);
        toast({
          title: "Failed to load teams",
          description: "Could not retrieve team information",
          variant: "destructive",
        });
      } finally {
        setLoading((prev) => ({ ...prev, teams: false }));
      }
    };
    
    if (user) {
      loadTeams();
    }
  }, [user, toast]);
  
  // Load team details and work items when selected team changes
  useEffect(() => {
    if (!selectedTeam) return;
    
    const loadTeamDetails = async () => {
      setLoading((prev) => ({ ...prev, teamDetails: true, workItems: true }));
      
      try {
        // Load team details
        const { team, members } = await getTeamById(selectedTeam.id);
        
        if (team) {
          setTeamMembers(members);
          
          // Start presence tracking
          const unsubscribe = getTeamPresence(selectedTeam.id, (state) => {
            setUserPresence(state);
          });
          
          return unsubscribe;
        }
      } catch (error) {
        console.error("Error loading team details:", error);
        toast({
          title: "Failed to load team details",
          description: "Could not retrieve team member information",
          variant: "destructive",
        });
      } finally {
        setLoading((prev) => ({ ...prev, teamDetails: false }));
      }
      
      // Load work items for this team
      try {
        const { items } = await getWorkItems({ teamId: selectedTeam.id });
        setWorkItems(items);
      } catch (error) {
        console.error("Error loading work items:", error);
        toast({
          title: "Failed to load work items",
          description: "Could not retrieve team tasks",
          variant: "destructive",
        });
      } finally {
        setLoading((prev) => ({ ...prev, workItems: false }));
      }
    };
    
    const unsubscribePromise = loadTeamDetails();
    
    return () => {
      // Cleanup presence tracking
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [selectedTeam, toast]);
  
  // Get merged team members with presence data
  const getMembersWithPresence = (): TeamMemberWithPresence[] => {
    return teamMembers.map(member => {
      const presenceData = userPresence[member.user_id];
      
      return {
        ...member,
        presence: presenceData ? {
          status: presenceData.status,
          last_seen: presenceData.last_seen,
        } : { status: 'offline', last_seen: '' }
      };
    });
  };
  
  // Get status badge color
  const getStatusColor = (status: WorkItem['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: WorkItem['priority']) => {
    switch (priority) {
      case 'critical': 
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'high': 
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'low': 
        return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>;
      default: 
        return null;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: WorkItem['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'review': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {loading.teams ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {teams.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Teams Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create a team to start collaborating with your colleagues.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <select
                    value={selectedTeam?.id || ''}
                    onChange={(e) => {
                      const team = teams.find(t => t.id === e.target.value);
                      if (team) setSelectedTeam(team);
                    }}
                    className="w-full p-2 rounded border border-input bg-background"
                  >
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Team
                </Button>
              </div>
              
              {selectedTeam && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="work">Work Items</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedTeam.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Description</h4>
                            <p className="text-muted-foreground text-sm">
                              {selectedTeam.description || "No description provided."}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Team Stats</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-secondary/50 p-3 rounded-md text-center">
                                <div className="text-2xl font-bold">{teamMembers.length}</div>
                                <div className="text-xs text-muted-foreground">Members</div>
                              </div>
                              <div className="bg-secondary/50 p-3 rounded-md text-center">
                                <div className="text-2xl font-bold">
                                  {workItems.filter(w => w.status === 'open' || w.status === 'in_progress').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Active Tasks</div>
                              </div>
                              <div className="bg-secondary/50 p-3 rounded-md text-center">
                                <div className="text-2xl font-bold">
                                  {workItems.filter(w => w.status === 'done').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Completed</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium">Recent Activity</h4>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>AB</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <p><span className="font-medium">Alex Brown</span> updated task <span className="font-medium">Deploy to production</span></p>
                                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <p><span className="font-medium">Jane Doe</span> commented on <span className="font-medium">Security monitoring setup</span></p>
                                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>MS</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <p><span className="font-medium">Mark Smith</span> completed task <span className="font-medium">Update AWS IAM policies</span></p>
                                  <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="members">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Team Members</CardTitle>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Member
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loading.teamDetails ? (
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {getMembersWithPresence().map((member, index) => (
                                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                                  <div className="flex items-center space-x-3">
                                    <div className="relative">
                                      <Avatar>
                                        <AvatarImage src={member.profile.avatar_url || "/placeholder.svg"} />
                                        <AvatarFallback>
                                          {member.profile.full_name?.[0] || member.profile.username?.[0] || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span 
                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                          member.presence?.status === 'online' ? 'bg-green-500' : 
                                          member.presence?.status === 'away' ? 'bg-yellow-500' : 
                                          member.presence?.status === 'busy' ? 'bg-red-500' : 
                                          'bg-gray-500'
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {member.profile.full_name || member.profile.username || "Unknown User"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon">
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="work">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Work Items</CardTitle>
                        <Button size="sm" onClick={onCreateWorkItem}>
                          <Plus className="mr-2 h-4 w-4" />
                          New Item
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loading.workItems ? (
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : workItems.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No Work Items</h3>
                            <p className="text-muted-foreground mb-4">
                              Create your first work item to start tracking progress.
                            </p>
                            <Button onClick={onCreateWorkItem}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Work Item
                            </Button>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                              {workItems.map((item) => (
                                <div 
                                  key={item.id} 
                                  className="p-3 rounded-md border border-border hover:bg-accent/50 cursor-pointer"
                                  onClick={() => onViewWorkItem?.(item.id)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(item.status)}
                                      <h4 className="font-medium">{item.title}</h4>
                                    </div>
                                    {getPriorityBadge(item.priority)}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                      {item.status.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3" />
                                      {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
                                    </div>
                                    {item.assigned_to ? (
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src="/placeholder.svg" />
                                        <AvatarFallback>
                                          {teamMembers.find(m => m.user_id === item.assigned_to)?.profile.full_name?.[0] || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <span>Unassigned</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TeamWorkspace;
