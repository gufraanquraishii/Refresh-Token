// app/todos/page.tsx
'use client';

import { useState } from 'react';
import { Todo } from '../../lib/types/todo';
import { CreateEditModal } from '../../components/CreateEditModal';
import { ViewModal } from '../../components/ViewModal';
import { Table, Button, Space, Tag, type TablePaginationConfig, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import {
    useTodos,
    useToggleTodo
} from '../../lib/hooks/useTodos';
import { DeleteModal } from '../../components/DeleteModal';
import type { ColumnType, FilterValue, SorterResult } from 'antd/es/table/interface';

type ModalActionType = 'create' | 'edit' | 'view' | 'delete' | null;
interface ModalState {
    type: ModalActionType;
    data: Todo | null;
}

export default function TodoListScreen() {

    // 🆕 Pagination state
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 5,        // 5 per page as you wanted
        search: '',
        status: undefined as 'completed' | 'pending' | undefined,
    });

    const [modalState, setModalState] = useState<ModalState>({
        type: null,
        data: null,
    });

    // 🪄 Fetch with current params
    const {
        data : todos,   // todos is the data from the useTodos hook
        isLoading,   // isLoading is the loading state from the useTodos hook
        isFetching, // Shows loading indicator even with cached data
    } = useTodos(queryParams);

    // 🆕 Handle table changes (pagination, filters, sorting)
    const handleTableChange = (
        pagination: TablePaginationConfig,
    ) => {
        setQueryParams((prev) => ({
            ...prev,
            page: pagination.current || 1,
            limit: pagination.pageSize || 5,
        }));
    };

    // 🆕 Handle search
    const handleSearch = (value: string) => {
        setQueryParams((prev) => ({
            ...prev,
            page: 1,       // Reset to first page when searching
            search: value,
        }));
    };


    // 🪄 All data & mutations through TanStack
    const toggleMutation = useToggleTodo();

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            // 🆕 Show search filter in column header
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Input.Search
                        placeholder="Search todos..."
                        onSearch={handleSearch}
                        style={{ width: 200 }}
                    />
                </div>
            ),
            filterIcon: <SearchOutlined />,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Status',
            dataIndex: 'completed',
            key: 'completed',
            width: 120,
            render: (completed: boolean, record: Todo) => (
                <Tag
                    color={completed ? 'green' : 'red'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleMutation.mutate(record._id)}
                >
                    {completed ? '✅ Done' : '❌ Pending'}
                </Tag>
            ),
            // 🆕 Status filter
            filters: [
                { text: 'Completed', value: 'completed' },
                { text: 'Pending', value: 'pending' },
            ],
            onFilter: (value: string) => {
                // This is handled server-side now, so we update queryParams
                setQueryParams((prev) => ({
                    ...prev,
                    page: 1,
                    status: value as 'completed' | 'pending',
                }));
                return true; // Let server handle filtering
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_: unknown, record: Todo) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setModalState({ type: 'edit', data: record })}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setModalState({ type: 'view', data: record })}
                    >
                        View
                    </Button>
                    <Button
                        size="small"
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
                columns={columns as ColumnType<Todo>[]}
                dataSource={todos?.todos || []}         // Only current page data
                rowKey="_id"
                loading={isLoading || isFetching}
                onChange={handleTableChange as (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<Todo> | SorterResult<Todo>[]) => void}
                pagination={{
                    current: todos?.pagination?.page,
                    pageSize: todos?.pagination?.limit,
                    total: todos?.pagination?.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} todos`,
                }}
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