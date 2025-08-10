import { apiClient } from './client';
import { Application } from '../contexts/ApplicationContext';

export interface PaginatedResult<T> { data: T[]; total: number; }

export async function fetchQueueApplications(): Promise<Application[]> {
  return apiClient.get('/applications/queue', () => mockQueueApplications());
}

export async function fetchProcessedApplications(): Promise<Application[]> {
  return apiClient.get('/applications/processed', () => mockProcessedApplications());
}

export async function updateApplicationStatusApi(id: string, status: Application['status']): Promise<Application> {
  return apiClient.post(`/applications/${id}/status`, { status }, () => ({ id, status } as Application));
}

// Mock generators (could be replaced with MSW later)
function mockQueueApplications(): Application[] {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `${i+1}`,
    studentId: `ST-2024-${(i+1).toString().padStart(3,'0')}`,
    name: ['Emma Thompson','Marcus Johnson','Sarah Chen','David Rodriguez','Lisa Wang','James Wilson','Maria Garcia','Robert Kim','Jennifer Brown','Michael Davis'][i] || `Student ${(i+1)}`,
    email: `student${(i+1)}@email.com`,
    stage: i % 2 === 0 ? 'admission' : 'financial-aid',
    timestamp: new Date(Date.now() - i*300000).toISOString(),
    status: 'pending',
    avatar: `https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
  }));
}

function mockProcessedApplications(): Application[] {
  return [
    {
      id: 'p1',
      studentId: 'ST-2024-089',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      stage: 'admission',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'escalated',
      riskScore: 95,
      flags: ['Essay Similarity', 'Email Age', 'Rapid Submission'],
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 'p2',
      studentId: 'ST-2024-087',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      stage: 'financial-aid',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'approved',
      riskScore: 25,
      flags: [],
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];
}
