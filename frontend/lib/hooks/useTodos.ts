// hooks/useTodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../app/api/todoApi';
import { Todo, type PaginatedResponse, type TodoQueryParams } from '../types/todo';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERIES (Reading Data)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get all todos
// 🆕 Accept pagination params
export const useTodos = (params: TodoQueryParams = {}) => {
  const { page = 1, limit = 5, search = '', status } = params;
  
  return useQuery({
    // Include ALL params in queryKey (cache per page/search/status)
    queryKey: ['todos', { page, limit, search, status }],
    queryFn: () => todoApi.getAll(params),
    // Keep previous data while loading new page (smooth transition)
    placeholderData: (previousData) => previousData,
  });
};

// Get single todo
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todoApi.getById(id),
    enabled: !!id,            // Don't fetch without ID
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MUTATIONS (Creating/Updating/Deleting)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Create todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoApi.create, // 👈 TanStack calls axios here
    
    onSuccess: () => {
      // Invalidate cache → auto refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Update todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; completed?: boolean }) =>
      todoApi.update(id, data),
    
    // Optimistic update example
    onMutate: async ({ id, ...data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      // Snapshot previous data
      const previousTodos = queryClient.getQueryData(['todos']);
      
      // Optimistically update cache
      queryClient.setQueryData(['todos'], (old: Todo[]) =>
        old?.map((todo: Todo) =>
          todo._id === id ? { ...todo, ...data } : todo
        )
      );
      
      return { previousTodos };
    },
    
    // If error, rollback
    onError: (err, variables, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    // Refetch anyway
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Delete todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoApi.delete,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Toggle todo
export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoApi.toggle,
    
    // Optimistic toggle
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      const previousTodos = queryClient.getQueryData(['todos']);
      
      queryClient.setQueryData(['todos'], (old: Todo[]) =>
        old?.map((todo: Todo) =>
          todo._id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
      
      return { previousTodos };
    },
    
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};