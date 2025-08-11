import { apiClient } from './client';
import { Application } from '../contexts/ApplicationContext';
import localRaw from './mockdata.json';

export interface PaginatedResult<T> { data: T[]; total: number; }

interface RawApplication {
  id?: number | string;
  application_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  application_status?: string; // Submitted | processed | ...
  updated_at?: string;
  created_at?: string;
  fraud_details?: { fraud_score?: number } | null;
  application_type?: string; // admissions | financial_aid
}

const REMOTE_ENDPOINT = 'https://4xituwvy3i.execute-api.us-east-1.amazonaws.com/dev/applications';

// Cache remote fetch to avoid duplicate calls when queue & processed both requested
let remoteFetchPromise: Promise<RawApplication[] | null> | null = null;

async function fetchRemoteApplications(): Promise<RawApplication[] | null> {
  try {
    if (!remoteFetchPromise) {
      remoteFetchPromise = fetch(REMOTE_ENDPOINT, { method: 'GET' })
        .then(async r => {
          if (!r.ok) throw new Error(`Remote fetch failed: ${r.status}`);
          const data = await r.json();
          // Expect shape { applications: [...] } else attempt to infer
          if (Array.isArray(data)) return data as RawApplication[];
          if (Array.isArray((data as { applications?: unknown[] }).applications)) return (data as { applications?: RawApplication[] }).applications as RawApplication[];
          return null;
        })
        .catch(err => {
          console.warn('[applications] Remote fetch error, falling back to local mock:', err);
          return null;
        });
    }
    return await remoteFetchPromise;
  } catch {
    return null;
  }
}

function normalize(raw: RawApplication[], includeProcessed: boolean): { queue: Application[]; processed: Application[] } {
  const queue: Application[] = [];
  const processed: Application[] = [];

  raw.forEach((app, idx) => {
    const statusRaw = (app.application_status || '').toLowerCase();
    const stage = app.application_type === 'financial_aid' ? 'financial-aid' : 'admission';

    const base: Application = {
      id: String(app.id ?? app.application_id ?? idx + 1),
      studentId: app.application_id || `ST-${String(app.id || idx + 1).padStart(4, '0')}`,
      name: [app.first_name, app.last_name].filter(Boolean).join(' ') || 'Unknown Applicant',
      email: app.email || 'unknown@example.com',
      stage,
      timestamp: app.updated_at || app.created_at || new Date().toISOString(),
      status: statusRaw === 'processed' ? 'processed' : 'pending',
    };

    if (statusRaw === 'processed') {
      processed.push({
        ...base,
        status: 'processed',
        riskScore: Math.round(((app.fraud_details?.fraud_score) ?? 0) * 100) || undefined,
        flags: app.fraud_details ? ['Fraud Indicator'] : []
      });
    } else if (statusRaw === 'submitted' || statusRaw === 'pending') {
      queue.push(base);
    } else {
      // Unknown status: put into queue by default unless includeProcessed indicates otherwise
      if (includeProcessed && statusRaw === 'approved') {
        processed.push({ ...base, status: 'processed' });
      } else {
        queue.push(base);
      }
    }
  });

  return { queue, processed };
}

function transformLocal(): { queue: Application[]; processed: Application[] } {
  const applications: RawApplication[] = (localRaw as { applications?: RawApplication[] }).applications || [];
  return normalize(applications, true);
}

async function transform(): Promise<{ queue: Application[]; processed: Application[] }> {
  const remote = await fetchRemoteApplications();
  if (remote) return normalize(remote, true);
  return transformLocal();
}

export async function fetchQueueApplications(): Promise<Application[]> {
  // Use apiClient latency simulation but supply async loader
  return apiClient.get('/applications/queue', async () => (await transform()).queue);
}

export async function fetchProcessedApplications(): Promise<Application[]> {
  return apiClient.get('/applications/processed', async () => (await transform()).processed);
}

export async function updateApplicationStatusApi(id: string, status: Application['status']): Promise<Application> {
  // This still mocks; real implementation would POST to backend
  return apiClient.post(`/applications/${id}/status`, { status }, () => ({ id, status } as Application));
}
