import { supabase } from "@/integrations/supabase/client";
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
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (teamError) throw teamError;
    
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        *,
        profile:user_id(*)
      `)
      .eq('team_id', teamId);
    
    if (membersError) throw membersError;
    
    return {
      team: team as Team,
      members: members as any[]
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
    const { error } = await supabase
      .from('team_members')
      .insert({
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
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
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
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
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
    
    let query = supabase
      .from('work_items')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (teamId) {
      query = query.eq('team_id', teamId);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      items: data as WorkItem[],
      count: count || 0
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
    const { data: workItem, error: workItemError } = await supabase
      .from('work_items')
      .select('*')
      .eq('id', workItemId)
      .single();
    
    if (workItemError) throw workItemError;
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id(*)
      `)
      .eq('item_id', workItemId)
      .eq('item_type', 'work_item')
      .order('created_at', { ascending: true });
    
    if (commentsError) throw commentsError;
    
    return {
      workItem: workItem as WorkItem,
      comments: comments as any[]
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
    const { error } = await supabase
      .from('work_items')
      .update(updates)
      .eq('id', workItemId);
    
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
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select();
    
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
    const { error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    
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
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
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
  // Subscribe to work item changes
  const workItemChannel = supabase
    .channel(`work-item-${workItemId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'work_items',
        filter: `id=eq.${workItemId}`
      },
      (payload) => {
        onUpdate(payload.new as WorkItem);
      }
    )
    .subscribe();
  
  // Subscribe to new comments
  const commentsChannel = supabase
    .channel(`work-item-comments-${workItemId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `item_id=eq.${workItemId}`
      },
      async (payload) => {
        const newComment = payload.new as Comment;
        
        // Fetch user info
        const { data: user } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newComment.user_id)
          .single();
        
        onNewComment({ ...newComment, user: user as UserProfile });
      }
    )
    .subscribe();
  
  // Return cleanup function
  return () => {
    supabase.removeChannel(workItemChannel);
    supabase.removeChannel(commentsChannel);
  };
};

// User presence for team collaboration
export const trackUserPresence = async (
  userId: string,
  teamId: string,
  status: 'online' | 'away' | 'busy' | 'offline' = 'online'
): Promise<void> => {
  const channel = supabase.channel(`presence-${teamId}`);
  
  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        status,
        last_seen: new Date().toISOString(),
      });
    }
  });
};

export const getTeamPresence = (
  teamId: string,
  onPresenceSync: (state: Record<string, any>) => void
): (() => void) => {
  const channel = supabase.channel(`presence-${teamId}`);
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceSync(state);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};
