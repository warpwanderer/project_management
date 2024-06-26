// Ваш файл TaskItem.js

import React, { useState } from 'react';
import { List, Button, Modal, Input, message } from 'antd';
import { CloseSquareOutlined } from '@ant-design/icons';

const TaskItem = React.memo(({ task, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTaskName(task.name);
  };

  const handleSaveEdit = () => {
    if (editedTaskName.trim() === '') {
      message.error('Название задачи не может быть пустым');
      return;
    }
    onUpdate(task.id, editedTaskName);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedTaskName(e.target.value);
  };

  return (
    <List.Item key={task.id}>
      <span onClick={() => setIsEditing(true)}>{task.name}</span>
      <Modal
        open={isEditing}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>Отмена</Button>,
          <Button key="save" type="primary" onClick={handleSaveEdit}>Сохранить</Button>,
        ]}
      >
        <Input value={editedTaskName} onChange={handleChange} />
      </Modal>
      <CloseSquareOutlined onClick={handleDelete} style={{ marginLeft: '15px', cursor: 'pointer' }} />
    </List.Item>
  );
});

export default TaskItem;
