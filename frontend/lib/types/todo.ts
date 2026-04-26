// types/todo.ts - UPDATE
export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// 🆕 Pagination response type
export interface PaginatedResponse {
  todos: Todo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// 🆕 Query params type
export interface TodoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'completed' | 'pending';
}