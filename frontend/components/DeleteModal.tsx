// components/todos/ViewModal.tsx
'use client';

import { Modal, Button } from 'antd';
import { Todo } from '../lib/types/todo';
import { useDeleteTodo } from '../lib/hooks/useTodos';

interface DeleteModalProps {
    open: boolean;
    todo: Todo | null;
    onClose: () => void;
}

export function DeleteModal({ open, todo, onClose }: DeleteModalProps) {
    const deleteMutation = useDeleteTodo();
    if (!todo) return null;

    const handleDelete = () => {
        deleteMutation.mutate(todo._id);
        onClose();
    };

    return (
        <Modal
            title="Delete Todo"
            open={open}
            onCancel={onClose}
            footer={
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button type="primary" danger onClick={handleDelete}>
                        Yes, Delete
                    </Button>
                    <Button onClick={onClose}>
                        No, Cancel
                    </Button>
                </div>
            }
            width={600}
        >
            <p>Are you sure you want to delete this todo?</p>
        </Modal>
    );
}