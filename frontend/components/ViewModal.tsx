// components/todos/ViewModal.tsx
'use client';

import { Modal, Descriptions, Tag, message } from 'antd';
import { Todo } from '../lib/types/todo';
import { useTodo } from '../lib/hooks/useTodos';

interface ViewModalProps {
    open: boolean;
    todo: Todo | null;
    onClose: () => void;
}

export function ViewModal({ open, todo, onClose }: ViewModalProps) {
    if (!todo) return null;

    return (
        <Modal
            title="Todo Details"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
                <Descriptions.Item label="User ID">{todo.userId}</Descriptions.Item>
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="ID">{todo._id}</Descriptions.Item>
                <Descriptions.Item label="Title">{todo.title}</Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={todo.completed ? 'green' : 'red'}>
                        {todo.completed ? '✅ Completed' : '❌ Pending'}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}