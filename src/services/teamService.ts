import { UserProfile, UserRole } from "./authService";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";
import { hasResourcePermission } from "./permissions/teamPermissionsService";

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

// Team operations with permission checks
export const createTeam = async (
  team: Omit<Team, 'id' | 'created_at' | 'updated_at'>,
  userRole: UserRole
): Promise<{ success: boolean; teamId?: string; error?: string }> => {
  try {
    // Check if user has permission to create teams
    if (!hasResourcePermission(userRole, 'admin')) {
      throw new Error("You don't have permission to create teams");
    }
    
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
  role: TeamMember['role'],
  currentUserRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to add team members
    if (!hasResourcePermission(currentUserRole, 'admin')) {
      throw new Error("You don't have permission to add team members");
    }
    
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
  role: TeamMember['role'],
  currentUserRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to update team member roles
    if (!hasResourcePermission(currentUserRole, 'admin')) {
      throw new Error("You don't have permission to update team member roles");
    }
    
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
  userId: string,
  currentUserRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to remove team members
    if (!hasResourcePermission(currentUserRole, 'admin')) {
      throw new Error("You don't have permission to remove team members");
    }
    
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
