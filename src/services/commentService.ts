
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";

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
