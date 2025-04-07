
import { UserProfile } from "./authService";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";
import { Comment } from "./commentService";

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
