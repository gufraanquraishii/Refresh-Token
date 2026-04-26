// components/todos/CreateEditModal.tsx
'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import { Todo } from '../lib/types/todo';
import { useCreateTodo, useUpdateTodo } from '@/lib/hooks/useTodos';

interface CreateEditModalProps {
  open: boolean;
  type: 'create' | 'edit' | null;
  initialData?: Todo | null;
  onClose: () => void;
}

export function CreateEditModal({ open, type, initialData, onClose }: CreateEditModalProps) {
  const [form] = Form.useForm();

        // 🪄 All data & mutations through TanStack
        const createMutation = useCreateTodo();
        const updateMutation = useUpdateTodo();
      
        const handleCreate = (values: { title: string, description: string }) => {
          createMutation.mutate(values, {
            onSuccess: () => {
              message.success('Todo created!');
              onClose();
            },
            onError: () => message.error('Failed to create'),
          });
        };
      
        const handleUpdate = (id: string | undefined, values: { title: string, description: string }) => {
          if (!id) return;
          updateMutation.mutate(
            { id, ...values },
            {
              onSuccess: () => {
                message.success('Todo updated!');
                onClose();
              },
              onError: () => message.error('Failed to update'),
            }
          );
        };

  const isEdit = type === 'edit';

  // Set form values for edit
  useEffect(() => {
    if (open && isEdit && initialData) {
      form.setFieldsValue({
        title: initialData.title,
        description: initialData.description || '',
        completed: initialData.completed,
      });
    } else {
      form.resetFields();
    }
  }, [open, isEdit, initialData]);

  const handleSubmit = (values: { title: string, description: string }) => {
    if (isEdit) {
      handleUpdate(initialData?._id, values);
    } else {
      handleCreate(values);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Todo' : 'Create Todo'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ completed: false }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { min: 3, message: 'Title must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter todo title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter todo description" />
        </Form.Item>

        <Form.Item name="completed" label="Completed" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}   