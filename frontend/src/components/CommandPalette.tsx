import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const goto = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => goto('/dashboard')}>Open Dashboard</CommandItem>
          <CommandItem onSelect={() => goto('/chat')}>Open AI Chat</CommandItem>
          <CommandItem onSelect={() => goto('/cloud-connection')}>Open Cloud Connection</CommandItem>
          <CommandItem onSelect={() => goto('/resources')}>Open Resources</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Centers">
          <CommandItem onSelect={() => goto('/sre')}>SRE Center</CommandItem>
          <CommandItem onSelect={() => goto('/finops')}>FinOps Center</CommandItem>
          <CommandItem onSelect={() => goto('/security')}>Security & Compliance</CommandItem>
          <CommandItem onSelect={() => goto('/mlops')}>MLOps Center</CommandItem>
          <CommandItem onSelect={() => goto('/integrations-rag')}>Integrations & RAG</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => goto('/iac/generator')}>IaC Generator</CommandItem>
          <CommandItem onSelect={() => goto('/iac/validator')}>IaC Validator</CommandItem>
          <CommandItem onSelect={() => goto('/plugins/marketplace')}>Plugin Marketplace</CommandItem>
          <CommandItem onSelect={() => goto('/knowledge')}>Knowledge Base</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;


