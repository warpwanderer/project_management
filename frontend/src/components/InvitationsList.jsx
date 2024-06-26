import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { List, Button, message } from 'antd';
import { useQuery, useQueryClient } from 'react-query';

const getAuthHeaders = () => {
    const accessToken = Cookies.get('jwt_token');
    const refreshToken = Cookies.get('refresh_token');
    return {
        Authorization: `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken,
    };
};

const fetchInvitations = async () => {
    const response = await axios.get('http://127.0.0.1:8000/api/user-invitations/', {
        headers: getAuthHeaders()
    });
    return response.data;
};

const InvitationsList = () => {
    const queryClient = useQueryClient();
    const { data: invitations, isLoading, error } = useQuery('invitations', fetchInvitations);

    const handleAcceptInvitation = async (userinvitationId) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/user-invitations/${userinvitationId}/`, {
                accepted: true
            }, {
                headers: getAuthHeaders()
            });
            message.success('Invitation accepted successfully!');
            queryClient.invalidateQueries('invitations');
        } catch (error) {
            message.error('Error accepting invitation');
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDeclineInvitation = async (userinvitationId) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/user-invitations/${userinvitationId}/`, {
                declined: true
            }, {
                headers: getAuthHeaders()
            });
            message.success('Invitation declined successfully!');
            queryClient.invalidateQueries('invitations');
        } catch (error) {
            message.error('Error declining invitation');
            console.error('Error declining invitation:', error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    return (
        <div className="invitations-container">
            <h3>Приглашения</h3>
            <List
                itemLayout="horizontal"
                dataSource={invitations}
                renderItem={userinvitation => (
                    <List.Item
                        actions={[
                            <Button onClick={() => handleAcceptInvitation(userinvitation.id)} type="primary">Accept</Button>,
                            <Button onClick={() => handleDeclineInvitation(userinvitation.id)} danger>Decline</Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={userinvitation.team.name}
                            description={userinvitation.email}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default InvitationsList;
