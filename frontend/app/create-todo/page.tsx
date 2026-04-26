// app/todos/page.tsx
'use client';

import { useState } from 'react';
import { Todo } from '../../lib/types/todo';
import { CreateEditModal } from '../../components/CreateEditModal';
import { ViewModal } from '../../components/ViewModal';
import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import {
    useTodos,   
    useToggleTodo
} from '../../lib/hooks/useTodos';
import { DeleteModal } from '../../components/DeleteModal';

type ModalActionType = 'create' | 'edit' | 'view' | 'delete' | null;
interface ModalState {
    type: ModalActionType;
    data: Todo | null;
}

export default function TodoListScreen() {
    const [modalState, setModalState] = useState<ModalState>({
        type: null,
        data: null,
    });

    // 🪄 All data & mutations through TanStack
    const { data: todos, isLoading } = useTodos();
    const toggleMutation = useToggleTodo();

    const handleToggle = (id: string) => {
        toggleMutation.mutate(id);
    };

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Status',
            dataIndex: 'completed',
            key: 'completed',
            render: (completed: boolean, record: Todo) => (
                <Tag
                    color={completed ? 'green' : 'red'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleToggle(record._id)}
                >
                    {completed ? '✅ Done' : '❌ Pending'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Todo) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => setModalState({ type: 'edit', data: record })}
                    >
                        Edit
                    </Button>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => setModalState({ type: 'view', data: record })}
                    >
                        View
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setModalState({ type: 'delete', data: record })}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1>Todo List</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalState({ type: 'create', data: null })}
                >
                    Add Todo
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={todos}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 5 }}
            />

            {/* Create/Edit Modal */}
            <CreateEditModal
                open={modalState.type === 'create' || modalState.type === 'edit'}
                type={modalState.type as 'create' | 'edit'}
                initialData={modalState.data}
                onClose={() => setModalState({ type: null, data: null })}
            />

            {/* View Modal */}
            <ViewModal
                open={modalState.type === 'view'}
                todo={modalState.data}
                onClose={() => setModalState({ type: null, data: null })}
            />

            {/* Delete Modal */}
            <DeleteModal
                open={modalState.type === 'delete'}
                todo={modalState.data}
                onClose={() => setModalState({ type: null, data: null })}
            />
        </div>
    );
}