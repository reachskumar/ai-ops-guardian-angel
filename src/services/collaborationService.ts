
import { UserProfile } from "./authService";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  team_id?: string;
  tags?: string[];
  related_resources?: string[];
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  item_id: string;
  item_type: 'work_item' | 'incident' | 'resource';
  created_at: string;
  updated_at: string;
  attachments?: string[];
}

// Team operations
export const createTeam = async (
  team: Omit<Team, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; teamId?: string; error?: string }> => {
  try {
    // Use mock service
    const { data, error } = mockInsert('teams', team);
    
    if (error) throw error;
    
    return { 
      success: true, 
      teamId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error("Create team error:", error);
    return { success: false, error: error.message };
  }
};

export const getTeams = async (): Promise<Team[]> => {
  try {
    // Use mock service
    const { data, error } = mockSelect('teams');
    
    if (error) throw error;
    
    return data as Team[];
  } catch (error) {
    console.error("Get teams error:", error);
    return [];
  }
};

export const getTeamById = async (
  teamId: string
): Promise<{ team: Team | null; members: (TeamMember & { profile: UserProfile })[] }> => {
  try {
    // Get team
    const { data: team, error: teamError } = mockSelect('teams', { id: teamId });
    if (teamError) throw teamError;
    
    // Get team members
    const { data: members, error: membersError } = mockSelect('team_members', { team_id: teamId });
    if (membersError) throw membersError;
    
    // Enhance member data with user profiles
    const enhancedMembers = [];
    for (const member of members) {
      const { data: profile } = mockSelect('profiles', { id: member.user_id });
      
      enhancedMembers.push({
        ...member,
        profile: profile?.[0]
      });
    }
    
    return {
      team: team?.[0] as Team || null,
      members: enhancedMembers as (TeamMember & { profile: UserProfile })[]
    };
  } catch (error) {
    console.error("Get team by ID error:", error);
    return { team: null, members: [] };
  }
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: TeamMember['role']
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = mockInsert('team_members', {
      team_id: teamId,
      user_id: userId,
      role
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Add team member error:", error);
    return { success: false, error: error.message };
  }
};

export const updateTeamMemberRole = async (
  teamId: string,
  userId: string,
  role: TeamMember['role']
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Find the member first
    const { data: members } = mockSelect('team_members', { 
      team_id: teamId,
      user_id: userId
    });
    
    if (!members || members.length === 0) {
      throw new Error("Team member not found");
    }
    
    // Update the role
    const { error } = mockUpdate('team_members', members[0].id, { role });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Update team member role error:", error);
    return { success: false, error: error.message };
  }
};

export const removeTeamMember = async (
  teamId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Find the member first
    const { data: members } = mockSelect('team_members', { 
      team_id: teamId,
      user_id: userId
    });
    
    if (!members || members.length === 0) {
      throw new Error("Team member not found");
    }
    
    // Delete the member
    const { error } = mockDelete('team_members', members[0].id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Remove team member error:", error);
    return { success: false, error: error.message };
  }
};

// Work item operations
export const createWorkItem = async (
  workItem: Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; workItemId?: string; error?: string }> => {
  try {
    // Use mock service
    const { data, error } = mockInsert('work_items', workItem);
    
    if (error) throw error;
    
    return { 
      success: true, 
      workItemId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error("Create work item error:", error);
    return { success: false, error: error.message };
  }
};

export const getWorkItems = async (
  options?: {
    teamId?: string;
    assignedTo?: string;
    status?: WorkItem['status'] | WorkItem['status'][];
    limit?: number;
    offset?: number;
  }
): Promise<{ items: WorkItem[]; count: number }> => {
  try {
    const { teamId, assignedTo, status, limit = 50, offset = 0 } = options || {};
    
    // Build filters
    const filters: Record<string, any> = {};
    
    if (teamId) filters.team_id = teamId;
    if (assignedTo) filters.assigned_to = assignedTo;
    if (status) {
      if (Array.isArray(status)) {
        // For simplicity in mock implementation we'll only use the first status
        filters.status = status[0];
      } else {
        filters.status = status;
      }
    }
    
    // Use mock service
    const { data, count, error } = mockSelect('work_items', filters);
    
    if (error) throw error;
    
    // Handle pagination manually
    const paginatedData = data.slice(offset, offset + limit);
    
    return {
      items: paginatedData as WorkItem[],
      count: count
    };
  } catch (error) {
    console.error("Get work items error:", error);
    return { items: [], count: 0 };
  }
};

export const getWorkItemById = async (
  workItemId: string
): Promise<{ workItem: WorkItem | null; comments: (Comment & { user: UserProfile })[] }> => {
  try {
    // Get work item
    const { data: workItem, error: workItemError } = mockSelect('work_items', { id: workItemId });
    if (workItemError) throw workItemError;
    
    // Get comments
    const { data: comments, error: commentsError } = mockSelect('comments', { 
      item_id: workItemId,
      item_type: 'work_item'
    });
    if (commentsError) throw commentsError;
    
    // Enhance comments with user profiles
    const enhancedComments = [];
    for (const comment of comments) {
      const { data: profile } = mockSelect('profiles', { id: comment.user_id });
      
      enhancedComments.push({
        ...comment,
        user: profile?.[0]
      });
    }
    
    return {
      workItem: workItem?.[0] as WorkItem || null,
      comments: enhancedComments as (Comment & { user: UserProfile })[]
    };
  } catch (error) {
    console.error("Get work item by ID error:", error);
    return { workItem: null, comments: [] };
  }
};

export const updateWorkItem = async (
  workItemId: string,
  updates: Partial<Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = mockUpdate('work_items', workItemId, updates);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Update work item error:", error);
    return { success: false, error: error.message };
  }
};

// Comment operations
export const addComment = async (
  comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; commentId?: string; error?: string }> => {
  try {
    const { data, error } = mockInsert('comments', comment);
    
    if (error) throw error;
    
    return { 
      success: true, 
      commentId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error("Add comment error:", error);
    return { success: false, error: error.message };
  }
};

export const updateComment = async (
  commentId: string,
  content: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = mockUpdate('comments', commentId, { 
      content, 
      updated_at: new Date().toISOString() 
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Update comment error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteComment = async (
  commentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = mockDelete('comments', commentId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return { success: false, error: error.message };
  }
};

// Real-time collaboration
export const setupWorkItemListener = (
  workItemId: string,
  onUpdate: (workItem: WorkItem) => void,
  onNewComment: (comment: Comment & { user: UserProfile }) => void
): (() => void) => {
  console.log(`Setting up listener for work item ${workItemId}`);
  
  // In a real implementation, we would set up Supabase realtime subscriptions
  // For now, we just return a dummy cleanup function
  return () => {
    console.log(`Cleaning up listener for work item ${workItemId}`);
  };
};

// User presence for team collaboration
export const trackUserPresence = async (
  userId: string,
  teamId: string,
  status: 'online' | 'away' | 'busy' | 'offline' = 'online'
): Promise<void> => {
  console.log(`User ${userId} is now ${status} in team ${teamId}`);
};

export const getTeamPresence = (
  teamId: string,
  onPresenceSync: (state: Record<string, any>) => void
): (() => void) => {
  console.log(`Setting up presence listener for team ${teamId}`);
  
  // In a real implementation, we would set up Supabase presence subscriptions
  // For now, we just return a dummy cleanup function
  return () => {
    console.log(`Cleaning up presence listener for team ${teamId}`);
  };
};
