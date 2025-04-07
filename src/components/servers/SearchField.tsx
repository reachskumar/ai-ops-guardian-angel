
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFieldProps {
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ searchQuery, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search servers..."
        className="w-64 pl-8"
        value={searchQuery}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchField;
