
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateResourceTags } from "@/services/cloud";

interface Tag {
  key: string;
  value: string;
}

interface ResourceTagsManagerProps {
  resourceId: string;
  initialTags?: Record<string, string>;
  onUpdate?: () => void;
}

const ResourceTagsManager: React.FC<ResourceTagsManagerProps> = ({
  resourceId,
  initialTags = {},
  onUpdate,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTags && Object.keys(initialTags).length > 0) {
      const tagsArr = Object.entries(initialTags).map(([key, value]) => ({ key, value }));
      setTags(tagsArr);
    }
  }, [initialTags]);

  const handleAddTag = () => {
    if (!newTagKey.trim()) {
      toast({
        description: "Tag key cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const tagExists = tags.some(tag => tag.key === newTagKey);
    if (tagExists) {
      toast({
        description: "A tag with this key already exists",
        variant: "destructive",
      });
      return;
    }

    setTags([...tags, { key: newTagKey, value: newTagValue }]);
    setNewTagKey("");
    setNewTagValue("");
  };

  const handleRemoveTag = (keyToRemove: string) => {
    setTags(tags.filter(tag => tag.key !== keyToRemove));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const tagObject: Record<string, string> = {};
      tags.forEach(tag => {
        tagObject[tag.key] = tag.value;
      });
      
      const result = await updateResourceTags(resourceId, tagObject);
      
      if (result.success) {
        toast({
          title: "Tags updated",
          description: "Resource tags have been updated successfully",
        });
        
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update resource tags",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating tags:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the tags",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <span>Resource Tags</span>
        </CardTitle>
        <CardDescription>
          Manage tags to organize and categorize your cloud resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags available. Add tags below.</p>
            ) : (
              tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <span className="font-semibold">{tag.key}:</span>
                  <span>{tag.value}</span>
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                    onClick={() => handleRemoveTag(tag.key)}
                  />
                </Badge>
              ))
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <Input 
                className="col-span-5" 
                placeholder="Key" 
                value={newTagKey}
                onChange={(e) => setNewTagKey(e.target.value)}
              />
              <Input 
                className="col-span-5" 
                placeholder="Value" 
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
              />
              <Button 
                className="col-span-2"
                variant="outline" 
                onClick={handleAddTag}
                disabled={!newTagKey.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Tags"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceTagsManager;
