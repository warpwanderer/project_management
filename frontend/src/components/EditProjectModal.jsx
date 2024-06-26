import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const EditProjectModal = ({ visible, project, onUpdate, onCancel }) => {
    const [form] = Form.useForm(); 
    const [statuses, setStatuses] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/statuses/');
                setStatuses(response.data);
            } catch (error) {
                message.error('Ошибка загрузки статусов: ' + error.message);
            }
        };

        fetchStatuses();
    }, []);


    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/teams/');
                setTeams(response.data);
            } catch (error) {
                message.error('Ошибка загрузки команд: ' + error.message);
            }
        };

        fetchTeams();
    }, []);

    useEffect(() => {
        if (project) {
            form.setFieldsValue(project); // Заполнение формы данными о проекте
        }
    }, [project, form]);

    const onFinish = values => {
        onUpdate(values);
        form.resetFields();
    };

    return (
        <Modal
            open={visible}
            title="Редактировать проект"
            okText="Сохранить"
            cancelText="Отмена"
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        onFinish(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="edit_project_form" 
            >
                <Form.Item
                    name="name"
                    label="Название проекта"
                    rules={[
                        {
                            required: true,
                            message: 'Пожалуйста, введите название проекта',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Описание проекта"
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Статус"
                    name="status"
                    rules={[{ required: true, message: 'Выберите Статус' }]}
                >
                    <Select placeholder="Статус" loading={statuses.length === 0}>
                        {statuses.map((status) => (
                            <Option key={status.id} value={status.id}>
                                {status.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Команда"
                    name="team"
                    rules={[{ required: false, message: 'Выберите Команду' }]}
                >
                <Select placeholder="Команда" loading={teams.length === 0}>
                    {teams.map((team) => (
                        <Option key={team.id} value={team.id}>
                            {team.name}
                        </Option>
                    ))}
                </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditProjectModal;
