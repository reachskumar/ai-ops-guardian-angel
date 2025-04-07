
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SidebarWithProvider from "@/components/Sidebar";
import Header from "@/components/Header";
import { Shield, UserCheck, UserX } from "lucide-react";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfiles}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Username</th>
                        <th className="text-left py-2 px-4">Role</th>
                        <th className="text-right py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground">
                            No users found. Sign up to create a user.
                          </td>
                        </tr>
                      ) : (
                        profiles.map((profile) => (
                          <tr key={profile.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              {profile.full_name || "No name"}
                            </td>
                            <td className="py-3 px-4">
                              {profile.username || "No username"}
                            </td>
                            <td className="py-3 px-4">
                              {profile.role === "admin" ? (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-slate-100">
                                  User
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {profile.role === "admin" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAdmin(profile.id)}
                                  className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                                >
                                  <UserX className="h-4 w-4" />
                                  Remove Admin
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => makeAdmin(profile.id)}
                                  className="flex items-center gap-1"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Make Admin
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarWithProvider>
  );
};

export default AdminPanel;
