// app/page.tsx (or any other page)
'use client';

import React from 'react';
import { useTodos } from '../../lib/hooks/useTodos';
import { Table, Spin, Alert } from 'antd';
import { Todo } from '../../lib/types/todo';
import type { ColumnsType } from 'antd/es/table';

export default function HomePage() {
    const { data: todos, isLoading, isError, isFetching } = useTodos();

    if (isLoading || isFetching) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (isError) {
        return <Alert message="Failed to load todos. Please try again later." type="error" showIcon />;
    }

    const columns: ColumnsType<Todo> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Title', dataIndex: 'titleUpper', key: 'titleUpper' },
        { title: 'Status', dataIndex: 'statusLabel', key: 'statusLabel', width: 120 },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h1>Todo List</h1>
            <Table
                columns={columns}
                dataSource={todos}
                rowKey="id"
                pagination={{ pageSize: 5 }}
            />
        </div>
    );
}