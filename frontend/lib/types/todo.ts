// types/todo.ts
export interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
    titleUpper: string;
    description: string;
    statusLabel: string;
    _id: string;
  }


export interface TodoFormData {
  title: string;
  description: string;
  completed: boolean;
}