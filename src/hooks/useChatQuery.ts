
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatMessage, DevOpsContext, sendChatMessage } from "@/services/aiChatService";

export function useChatQuery(initialMessages: ChatMessage[] = []) {
  const queryClient = useQueryClient();
  
  // Query for fetching messages
  const { data: messages = initialMessages } = useQuery({
    queryKey: ["chat-messages"],
    initialData: initialMessages,
  });

  // Mutation for sending messages
  const { mutate: sendMessage, isPending: isLoading } = useMutation({
    mutationFn: async ({ 
      input, 
      context 
    }: { 
      input: string; 
      context?: DevOpsContext 
    }) => {
      const userMessage: ChatMessage = {
        type: "user",
        content: input,
        timestamp: new Date(),
      };

      // Optimistically update messages
      queryClient.setQueryData(
        ["chat-messages"], 
        (oldData: ChatMessage[] = []) => [...oldData, userMessage]
      );

      // Send message to API
      const response = await sendChatMessage(
        input,
        messages.slice(-10), // Recent context
        context
      );

      const systemMessage: ChatMessage = {
        type: "system",
        content: response,
        timestamp: new Date(),
      };

      // Update with system response
      queryClient.setQueryData(
        ["chat-messages"], 
        (oldData: ChatMessage[] = []) => [...oldData, systemMessage]
      );

      return systemMessage;
    },
  });

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
