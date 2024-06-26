import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Modal, Form, Input, Button, message } from 'antd';

const getAuthHeaders = () => {
    const accessToken = Cookies.get('jwt_token');
    const refreshToken = Cookies.get('refresh_token');
    return {
        Authorization: `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken,
    };
};

const CreateTeamForm = ({ onSuccess, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const teamResponse = await axios.post(
                'http://127.0.0.1:8000/api/teams/',
                { name: values.name },
                { headers: getAuthHeaders() }
            );
            await axios.post(
                'http://127.0.0.1:8000/api/user-invitations/',
                { email: values.email, team: teamResponse.data.id },
                { headers: getAuthHeaders() }
            );
            message.success('Team created successfully and invitation sent.');
            onSuccess();
        } catch (error) {
            message.error('Error creating team or sending invitation. Please try again.');
            console.error('Error creating team or sending invitation:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal
            title="Create Team and Invite User"
            open={true}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} onFinish={handleSubmit}>
                <Form.Item
                    label="Team Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter team name' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="User Email"
                    name="email"
                    rules={[{ required: true, message: 'Please enter user email' }]}
                >
                    <Input type="email" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Create Team and Send Invitation
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateTeamForm;
