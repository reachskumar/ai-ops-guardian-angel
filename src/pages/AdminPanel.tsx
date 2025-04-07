
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SidebarWithProvider from "@/components/Sidebar";
import Header from "@/components/Header";
import { Profile } from "@/types/user";
import { 
  AdminHeader, 
  UserManagementCard 
} from "@/components/admin";

const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching profiles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", id)
        .select("username, full_name");

      if (error) throw error;

      toast({
        title: "Admin rights granted",
        description: `${data?.[0]?.full_name || data?.[0]?.username || "User"} is now an admin.`,
      });

      fetchProfiles(); // Refresh the profiles list
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", id)
        .select("username, full_name");

      if (error) throw error;

      toast({
        title: "Admin rights removed",
        description: `${data?.[0]?.full_name || data?.[0]?.username || "User"} is no longer an admin.`,
      });

      fetchProfiles(); // Refresh the profiles list
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">
          <AdminHeader refreshProfiles={fetchProfiles} loading={loading} />
          <UserManagementCard 
            profiles={profiles}
            loading={loading}
            makeAdmin={makeAdmin}
            removeAdmin={removeAdmin}
          />
        </main>
      </div>
    </SidebarWithProvider>
  );
};

export default AdminPanel;
