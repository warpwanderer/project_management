import React, { useState } from 'react';
import { Tabs, Button, Input, Space, message, Popconfirm } from 'antd';
import Editor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import axios from 'axios';

const { TabPane } = Tabs;

const LearningMaterialsPage = () => {
  const [activeKey, setActiveKey] = useState('1');
  const [tabs, setTabs] = useState([{ key: '1', title: 'Вкладка 1', content: '' }]);
  const [newTabKey, setNewTabKey] = useState(2);

  const mdParser = new MarkdownIt();

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleContentChange = (key, content) => {
    const updatedTabs = tabs.map(tab => {
      if (tab.key === key) {
        return { ...tab, content };
      }
      return tab;
    });
    setTabs(updatedTabs);
  };

  const handleTitleChange = (key, title) => {
    const updatedTabs = tabs.map(tab => {
      if (tab.key === key) {
        return { ...tab, title };
      }
      return tab;
    });
    setTabs(updatedTabs);
  };

  const addNewTab = () => {
    const newTab = { key: `${newTabKey}`, title: `Вкладка ${newTabKey}`, content: '' };
    setTabs([...tabs, newTab]);
    setNewTabKey(newTabKey + 1);
    setActiveKey(`${newTabKey}`);
  };

  const removeTab = (targetKey) => {
    const newTabs = tabs.filter(tab => tab.key !== targetKey);
    if (newTabs.length && activeKey === targetKey) {
      setActiveKey(newTabs[0].key);
    }
    setTabs(newTabs);
  };

  const saveData = async (key, content) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/learning-materials/', { title: tabs.find(tab => tab.key === key).title, content });
      message.success('Данные успешно сохранены!');
      console.log(response.data);
    } catch (error) {
      message.error('Ошибка при сохранении данных');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button type="primary" onClick={addNewTab}>Добавить вкладку</Button>
      </Space>
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        type="editable-card"
        onEdit={(targetKey, action) => {
          if (action === 'remove') {
            removeTab(targetKey);
          }
        }}
      >
        {tabs.map(tab => (
          <TabPane
            tab={
              <Input
                value={tab.title}
                onChange={(e) => handleTitleChange(tab.key, e.target.value)}
                onBlur={() => saveData(tab.key, tab.content)}
                style={{ width: '200px' }}
              />
            }
            key={tab.key}
            closable={tabs.length > 1}
          >
            <Editor
              className="custom-editor"
              value={tab.content}
              onChange={({ text }) => handleContentChange(tab.key, text)}
              onBlur={() => {
                if (tab.content.trim() !== '') { // Проверяем, что содержимое не пустое
                  saveData(tab.key, tab.content);
                }
              }}
              renderHTML={text => mdParser.render(text)}
            />
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default LearningMaterialsPage;
