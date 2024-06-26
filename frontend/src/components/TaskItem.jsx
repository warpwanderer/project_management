import React, { useState } from 'react';
import { List, Modal, Input, DatePicker, Select, message, Checkbox, Tag, Popover, Button, Dropdown, Menu  } from 'antd';
import { CloseSquareOutlined, EnterOutlined, EllipsisOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/ru';
moment.locale('ru');

const { TextArea } = Input;

const TaskItem = React.memo(({ task, onDelete, onUpdate, onSubtaskCreate, onToggleComplete, priorities, statuses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.due_date ? moment(task.due_date) : null);
  const [priority, setPriority] = useState(task.priority ? task.priority.id : null);
  const [status, setStatus] = useState(task.status ? task.status.id : null);

  const [subtaskName, setSubtaskName] = useState('');
  const [subtaskDescription, setSubtaskDescription] = useState('');
  const [subtaskDueDate, setSubtaskDueDate] = useState(null);
  const [subtaskPriority, setSubtaskPriority] = useState(null);
  const [subtaskStatus, setSubtaskStatus] = useState(null);

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

  const handleToggleComplete = (e) => {
    onToggleComplete(task.id, e.target.checked);
  };

  const handleSubtaskCreate = () => {
    setIsAddingSubtask(true);
  };

  const handleSubtaskSave = () => {
    if (subtaskName.trim() === '') {
      message.error('Название подзадачи не может быть пустым');
      return;
    }
    onSubtaskCreate(task.id, subtaskName, subtaskDescription, subtaskDueDate, subtaskPriority, subtaskStatus);
    setIsAddingSubtask(false);
    setSubtaskName('');
    setSubtaskDescription('');
    setSubtaskDueDate(null);
    setSubtaskPriority(null);
    setSubtaskStatus(null);
  };

  const handleSubtaskCancel = () => {
    setIsAddingSubtask(false);
    setSubtaskName('');
    setSubtaskDescription('');
    setSubtaskDueDate(null);
    setSubtaskPriority(null);
    setSubtaskStatus(null);
  };

  const getColorTag = (type, id) => {
    if (!type) return null; // Проверяем, что type не undefined
    const item = type.find(t => t.id === id);
    return item ? <Tag color={item.color}>{item.name}</Tag> : null;
  };

  return (
    <List.Item key={task.id}>
      <Checkbox checked={task.is_completed} onChange={handleToggleComplete} style={{ marginRight: '10px' }} />
      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
        <div>{task.name}</div>
        
        <div>
          
          {task.priority ? getColorTag(priorities, task.priority) : null}
          {task.status ? getColorTag(statuses, task.status) : null}
        </div>
      </div>
      <Modal
        title="Редактировать задачу"
        open={isEditing}
        onCancel={handleCancelEdit}
        onOk={handleSaveEdit}
      >
        <Input placeholder="Название" value={editedTaskName} onChange={handleChange} />
        <TextArea placeholder="Описание" value={editedDescription} onChange={handleDescriptionChange} />
        <DatePicker value={dueDate} onChange={handleDatePickerChange} />
        <Select placeholder="Приоритет" value={priority} onChange={handlePriorityChange}>
          {priorities && priorities.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
        </Select>
        <Select placeholder="Статус" value={status} onChange={handleStatusChange}>
          {statuses && statuses.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
        </Select>
        <Button onClick={handleSubtaskCreate}>Добавить подзадачу</Button>
      </Modal>
      <Modal
        title="Добавить подзадачу"
        open={isAddingSubtask}
        onCancel={handleSubtaskCancel}
        onOk={handleSubtaskSave}
      >
        <Input placeholder="Название подзадачи" value={subtaskName} onChange={(e) => setSubtaskName(e.target.value)} />
        <TextArea placeholder="Описание подзадачи" value={subtaskDescription} onChange={(e) => setSubtaskDescription(e.target.value)} />
        <DatePicker value={subtaskDueDate} onChange={(date) => setSubtaskDueDate(date)} />
        <Select placeholder="Приоритет" value={subtaskPriority} onChange={(value) => setSubtaskPriority(value)}>
          {priorities && priorities.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
        </Select>
        <Select placeholder="Статус" value={subtaskStatus} onChange={(value) => setSubtaskStatus(value)}>
          {statuses && statuses.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
        </Select>
      </Modal>
      <Dropdown
      overlay={
        <Menu>
          <Menu.Item key="delete" onClick={handleDelete}>Удалить</Menu.Item>
          <Menu.Item key="addSubtask" onClick={handleSubtaskCreate}>Добавить подзадачу</Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      <MoreOutlined  Outlined style={{ cursor: 'pointer'}} />
    </Dropdown>
    </List.Item>
  );
});

export default TaskItem;
