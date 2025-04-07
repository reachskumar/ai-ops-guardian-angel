
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, RefreshCw } from "lucide-react";

interface IAMSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRefreshing: boolean;
  handleRefresh: () => void;
}

const IAMSearchBar: React.FC<IAMSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isRefreshing,
  handleRefresh
}) => {
  return (
    <div className="flex space-x-2 mt-2 sm:mt-0">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-8 w-full sm:w-[250px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
};

export default IAMSearchBar;
