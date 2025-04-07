
import React from 'react';
import { ResourceFilters } from '@/components/cloud';
import { ResourceInventory } from '@/components/cloud';

interface InventoryTabProps {
  filters: {
    search: string;
    type: string;
    region: string;
    status: string;
  };
  filteredResources: any[];
  typeOptions: string[];
  regionOptions: string[];
  statusOptions: string[];
  loading: boolean;
  handleFilterChange: (key: string, value: string) => void;
  handleFilterRemove: (key: string) => void;
  clearFilters: () => void;
  handleViewDetails: (resource: any) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({
  filters,
  filteredResources,
  typeOptions,
  regionOptions,
  statusOptions,
  loading,
  handleFilterChange,
  handleFilterRemove,
  clearFilters,
  handleViewDetails,
}) => {
  return (
    <>
      {/* Resource Filters Component */}
      <ResourceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        typeOptions={typeOptions}
        regionOptions={regionOptions}
        statusOptions={statusOptions}
      />

      {/* Resource Inventory Component */}
      <ResourceInventory 
        resources={filteredResources} 
        loading={loading} 
        onViewDetails={handleViewDetails}
        filters={filters}
        onFilterRemove={handleFilterRemove}
      />
    </>
  );
};

export default InventoryTab;
