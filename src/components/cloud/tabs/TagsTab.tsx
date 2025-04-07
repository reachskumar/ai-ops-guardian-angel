
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { ResourceTagsManager } from '@/components/cloud';

interface TagsTabProps {
  selectedResource: any | null;
  setActiveTab: (tab: string) => void;
  fetchResources: () => void;
}

const TagsTab: React.FC<TagsTabProps> = ({
  selectedResource,
  setActiveTab,
  fetchResources,
}) => {
  return (
    <>
      {selectedResource ? (
        <ResourceTagsManager 
          resourceId={selectedResource.id}
          initialTags={selectedResource.tags || {}}
          onUpdate={fetchResources}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
          <Tag className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No Resource Selected</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-center max-w-md">
            Select a resource from the Inventory tab to manage its tags
          </p>
          <Button variant="outline" onClick={() => setActiveTab("inventory")}>
            Go to Inventory
          </Button>
        </div>
      )}
    </>
  );
};

export default TagsTab;
