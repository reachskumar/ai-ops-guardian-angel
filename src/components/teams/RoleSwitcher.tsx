
import React, { useState } from 'react';
import { UserProfile } from "@/services/authService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Team } from "@/services/teamService";
import RoleLabel from "./RoleLabel";
import { useAuth } from "@/providers/AuthProvider";

interface RoleSwitcherProps {
  userTeams?: { team: Team; role: string }[];
  activeTeamId?: string;
  compact?: boolean;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  userTeams = [],
  activeTeamId,
  compact = false
}) => {
  const { profile, refreshProfile } = useAuth();
  const [isChangingTeam, setIsChangingTeam] = useState(false);

  const handleTeamChange = async (teamId: string) => {
    if (!profile || teamId === profile.team_id) return;
    
    setIsChangingTeam(true);
    try {
      // Update user's current active team
      await updateUserProfile(profile.id, { team_id: teamId });
      await refreshProfile();
    } catch (error) {
      console.error("Failed to switch teams:", error);
    } finally {
      setIsChangingTeam(false);
    }
  };

  if (userTeams.length <= 1) {
    return compact ? null : (
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground mr-2">Role:</span>
        {profile?.role && <RoleLabel role={profile.role as any} />}
      </div>
    );
  }

  return (
    <div className={compact ? "" : "flex items-center"}>
      {!compact && <span className="text-sm text-muted-foreground mr-2">Team:</span>}
      <Select
        disabled={isChangingTeam}
        value={profile?.team_id || activeTeamId || ''}
        onValueChange={handleTeamChange}
      >
        <SelectTrigger className={compact ? "w-[140px] h-8" : "w-[180px]"}>
          <SelectValue placeholder="Select team" />
        </SelectTrigger>
        <SelectContent>
          {userTeams.map(({ team, role }) => (
            <SelectItem key={team.id} value={team.id}>
              <div className="flex items-center justify-between w-full">
                <span>{team.name}</span>
                <RoleLabel role={role as any} size="sm" />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Helper function to update user's profile
const updateUserProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  const { success, error } = await import("@/services/authService")
    .then(module => module.updateUserProfile(userId, updates));
  
  if (!success) {
    throw new Error(error || "Failed to update profile");
  }
};

export default RoleSwitcher;
