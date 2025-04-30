
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { updateResource, deleteResource, CloudResource } from '@/services/cloud';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ResourceActionsProps {
  resource: CloudResource;
  onActionComplete: () => void;
}

const ResourceActions: React.FC<ResourceActionsProps> = ({ resource, onActionComplete }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = async (action: string) => {
    setIsLoading(action);
    try {
      const result = await updateResource(resource.id, action);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Resource ${action} operation initiated`,
        });
        onActionComplete();
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to ${action} resource`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading('delete');
    try {
      const result = await deleteResource(resource.id);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Resource deleted successfully',
        });
        onActionComplete();
        setDeleteDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete resource',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Determine which actions are available based on resource status
  const canStart = resource.status === 'stopped' || resource.status === 'terminated';
  const canStop = resource.status === 'running' || resource.status === 'starting';
  const canRestart = resource.status === 'running';
  
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canStart && (
          <Button 
            size="sm" 
            onClick={() => handleAction('start')}
            disabled={!!isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading === 'start' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" /> Start
              </>
            )}
          </Button>
        )}
        
        {canStop && (
          <Button 
            size="sm" 
            onClick={() => handleAction('stop')}
            disabled={!!isLoading}
            variant="secondary"
          >
            {isLoading === 'stop' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <StopCircle className="h-4 w-4 mr-1" /> Stop
              </>
            )}
          </Button>
        )}
        
        {canRestart && (
          <Button 
            size="sm" 
            onClick={() => handleAction('restart')}
            disabled={!!isLoading}
            variant="outline"
          >
            {isLoading === 'restart' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" /> Restart
              </>
            )}
          </Button>
        )}
        
        <Button 
          size="sm" 
          onClick={() => setDeleteDialogOpen(true)}
          disabled={!!isLoading}
          variant="destructive"
        >
          {isLoading === 'delete' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </>
          )}
        </Button>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Resource
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{resource.name}</strong>? This action cannot be undone
              and will permanently remove the resource from your cloud account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading === 'delete'}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading === 'delete'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading === 'delete' ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete Resource
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ResourceActions;
