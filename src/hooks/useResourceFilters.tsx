
import { useState, useEffect, useMemo } from 'react';
import { CloudResource } from '@/services/cloudProviderService';

export const useResourceFilters = (resources: CloudResource[]) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    region: '',
    status: ''
  });
  
  const [filteredResources, setFilteredResources] = useState<CloudResource[]>([]);

  // Extract unique values for filter dropdowns
  const typeOptions = useMemo(() => {
    const types = [...new Set(resources.map(r => r.type))];
    return types;
  }, [resources]);

  const regionOptions = useMemo(() => {
    const regions = [...new Set(resources.map(r => r.region))];
    return regions;
  }, [resources]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(resources.map(r => r.status))];
    return statuses;
  }, [resources]);

  // Apply filters to resources
  useEffect(() => {
    let result = resources;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(resource => 
        resource.name.toLowerCase().includes(searchTerm) ||
        resource.type.toLowerCase().includes(searchTerm) ||
        resource.region.toLowerCase().includes(searchTerm) ||
        resource.status.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.type && filters.type !== 'all-types') {
      result = result.filter(resource => 
        resource.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.region && filters.region !== 'all-regions') {
      result = result.filter(resource => 
        resource.region === filters.region
      );
    }

    if (filters.status && filters.status !== 'all-statuses') {
      result = result.filter(resource => 
        resource.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredResources(result);
  }, [resources, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleFilterRemove = (key: string) => {
    setFilters({
      ...filters,
      [key]: ''
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      region: '',
      status: ''
    });
  };

  return {
    filters,
    filteredResources,
    typeOptions,
    regionOptions,
    statusOptions,
    handleFilterChange,
    handleFilterRemove,
    clearFilters
  };
};
