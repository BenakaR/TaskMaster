import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface OrganizationUser {
    id: number;
    username: string;
    email: string;
}

export const useOrganizationUsers = () => {
    return useQuery({
        queryKey: ['organizationUsers'],
        queryFn: async () => {
            const response = await api.get<OrganizationUser[]>('/users/organization-users');
            return response.data;
        }
    });
};