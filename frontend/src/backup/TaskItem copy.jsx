// TaskItem.js

import React, { useState } from 'react';
import { List, Modal, Input, DatePicker, Select, message } from 'antd';
import { CloseSquareOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/ru';
moment.locale('ru');

const { TextArea } = Input;
// const { Option } = Select;

const TaskItem = React.memo(({ task, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.due_date ? moment(task.due_date) : null);
  const [priority, setPriority] = useState(task.priority ? task.priority.id : null);
  const [status, setStatus] = useState(task.status ? task.status.id : null);

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTaskName(task.name);
    setEditedDescription(task.description);
    setDueDate(task.due_date ? moment(task.due_date) : null);
    setPriority(task.priority ? task.priority.id : null);
    setStatus(task.status ? task.status.id : null);
  };

  const handleSaveEdit = () => {
    if (editedTaskName.trim() === '') {
      message.error('Название задачи не может быть пустым');
      return;
    }
    onUpdate(task.id, editedTaskName, editedDescription, dueDate, priority, status);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedTaskName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setEditedDescription(e.target.value);
  };

  const handleDatePickerChange = (date) => {
    setDueDate(date);
  };

  const handlePriorityChange = (value) => {
    setPriority(value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  return (
    <List.Item key={task.id}>
      <span onClick={() => setIsEditing(true)}>{task.name}</span>
      <Modal
        title="Редактировать задачу"
        open={isEditing}
        onCancel={handleCancelEdit}
        onOk={handleSaveEdit}
      >
        <Input value={editedTaskName} onChange={handleChange} />
        <TextArea value={editedDescription} onChange={handleDescriptionChange} />
        <DatePicker value={dueDate} onChange={handleDatePickerChange} />
        <Select value={priority} onChange={handlePriorityChange}>
          {/* Опции для приоритета */}
        </Select>
        <Select value={status} onChange={handleStatusChange}>
          {/* Опции для статуса */}
        </Select>
      </Modal>
      <CloseSquareOutlined onClick={handleDelete} style={{ marginLeft: '15px', cursor: 'pointer' }} />
    </List.Item>
  );
});

export default TaskItem;
