import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Project } from '../types/project';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    }
  });
};