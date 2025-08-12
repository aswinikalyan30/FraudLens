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
  fraud_details?: {
    application_behaviour?: string[];
    address?: string[];
    academic_record?: string[];
    fraud_score?: number;
  } | null; // note: real data uses root fraud_score, keeping for backward compat
  application_type?: string; // admissions | financial_aid | finaid
  program_id?: string;
  // Added program_name for display purposes
  program_name?: string;
  // Institution fields from API
  institution?: string;
  institution_address?: string;
  // Real API fields
  fraud_score?: number | string | null;
  supporting_documents?: {
    sop?: string;
    references?: Array<{ lor?: string; name?: string; email?: string; phone?: string; yearsKnown?: number; designation?: string; organization?: string; relationship?: string }>;
    // other doc types are possible (e.g., fafsa), keep as unknown here
    [key: string]: unknown;
  } | null;
  academic_history?: unknown[];
  application_details?: { mode?: string | null; term?: string | null; campus?: string | null; entryType?: string | null; intendedMajor?: string | null } & Record<string, unknown> | null;
  agent_recommendations?: string[] | null;
  address?: Array<{ city?: string; state?: string; country?: string; type?: string; postalCode?: string; street?: string }>;
  phone?: string | null;
  dob?: string | null;
  nationality?: string | null;
  sat_scores?: number | null;
}

export interface ApplicationDetail {
  application_id: string;
  id?: string | number;
  first_name?: string;
  last_name?: string;
  email?: string;
  program_name?: string;
  program_id?: string;
  application_type?: string;
  application_status?: string;
  created_at?: string;
  updated_at?: string;
  supporting_documents?: RawApplication['supporting_documents'];
  academic_history?: RawApplication['academic_history'];
  application_details?: RawApplication['application_details'];
  fraud_details?: RawApplication['fraud_details'];
  fraud_score?: number | string | null;
  agent_recommendations?: string[] | null;
  address?: RawApplication['address'];
  phone?: string | null;
  dob?: string | null;
  nationality?: string | null;
  institution?: string;
  institution_address?: string;
  sat_scores?: number | null;
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
          // Expect shape { applications: [...] } or { data: [...] } else attempt to infer
          if (Array.isArray(data)) return data as RawApplication[];
          if (Array.isArray((data as { applications?: unknown[] }).applications)) return (data as { applications?: RawApplication[] }).applications as RawApplication[];
          if (Array.isArray((data as { data?: unknown[] }).data)) return (data as { data?: RawApplication[] }).data as RawApplication[];
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

function normalizeStage(type?: string): Application['stage'] {
  const t = (type || '').toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  if (t === 'financial-aid' || t === 'financialaid' || t === 'finaid') return 'financial-aid';
  return 'admissions';
}

function getFraudDetails(obj: unknown): RawApplication['fraud_details'] {
  if (obj && typeof obj === 'object' && 'fraud_details' in obj) {
    const fd = (obj as { fraud_details?: unknown }).fraud_details as unknown;
    if (!fd || typeof fd !== 'object') return null;
    const out: Record<string, string[]> = {};
    Object.entries(fd as Record<string, unknown>).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        const strings = (v as unknown[]).filter((i): i is string => typeof i === 'string');
        if (strings.length) out[k] = strings;
      }
    });
    return out as RawApplication['fraud_details'];
  }
  return null;
}

function extractListFromLocal(raw: unknown): RawApplication[] {
  if (Array.isArray(raw)) return raw as RawApplication[];
  if (raw && typeof raw === 'object' && 'applications' in raw) {
    const apps = (raw as { applications?: unknown[] }).applications;
    if (Array.isArray(apps)) return apps as RawApplication[];
  }
  return [];
}

function normalize(raw: RawApplication[]): { queue: Application[]; processed: Application[] } {
  const queue: Application[] = [];
  const processed: Application[] = [];

  raw.forEach((app, idx) => {
    const statusRaw = (app.application_status || '').toLowerCase();
    const stage = normalizeStage(app.application_type);

    const parsedFraudScore = app.fraud_score != null ? Number(app.fraud_score) : undefined;
    const fraudScorePct = parsedFraudScore != null && !Number.isNaN(parsedFraudScore) ? Math.round(parsedFraudScore * 100) : undefined;

    const base: Application = {
      id: String(app.id ?? app.application_id ?? idx + 1),
      studentId: app.application_id || `ST-${String(app.id || idx + 1).padStart(4, '0')}`,
      name: [app.first_name, app.last_name].filter(Boolean).join(' ') || 'Unknown Applicant',
      email: app.email || 'unknown@example.com',
      stage,
      timestamp: app.updated_at || app.created_at || new Date().toISOString(),
      status: 'submitted', // will be set below
      programId: app.program_id,
      programName: app.program_name,
      updatedAt: app.updated_at,
      riskScore: fraudScorePct
    };

    const flagsFromDetails: string[] = [];
    const fd = getFraudDetails(app);
    if (fd) {
      if (Array.isArray(fd.application_behaviour)) flagsFromDetails.push(...fd.application_behaviour);
      if (Array.isArray(fd.address)) flagsFromDetails.push(...fd.address);
      if (Array.isArray(fd.academic_record)) flagsFromDetails.push(...fd.academic_record);
    }

    // Only 'submitted' goes to queue, all others to processed
    if (statusRaw === 'submitted') {
      queue.push({ ...base, status: 'submitted' });
    } else {
      // Map statusRaw to Application['status']
      let mappedStatus: Application['status'] = 'processed';
      if (statusRaw === 'approved') mappedStatus = 'approved';
      else if (statusRaw === 'rejected') mappedStatus = 'rejected';
      else if (statusRaw === 'high_suspicious') mappedStatus = 'escalated';
      else if (statusRaw === 'low_suspicious') mappedStatus = "low_risk";
      else if(statusRaw === '"in_review"') mappedStatus = "in_review";
      processed.push({ ...base, status: mappedStatus, flags: flagsFromDetails });
    }
  });

  return { queue, processed };
}

function transformLocal(): { queue: Application[]; processed: Application[] } {
  const list = extractListFromLocal(localRaw as unknown);
  return normalize(list);
}

async function transform(): Promise<{ queue: Application[]; processed: Application[] }> {
  const remote = await fetchRemoteApplications();
  if (remote) return normalize(remote);
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

// Helpers for detail parsing
function isRawApplication(obj: unknown): obj is RawApplication {
  if (typeof obj !== 'object' || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  return 'application_id' in rec || 'id' in rec || 'first_name' in rec || 'application_status' in rec;
}

// Recursively unwrap common wrappers: { application }, { data }, or combinations thereof
function unwrapRawApplication(obj: unknown): RawApplication | undefined {
  const dig = (o: unknown): unknown => {
    if (isRawApplication(o)) return o;
    if (o && typeof o === 'object') {
      const rec = o as Record<string, unknown>;
      if ('application' in rec) return dig(rec.application);
      if ('data' in rec) return dig(rec.data);
    }
    return undefined;
  };
  return dig(obj) as RawApplication | undefined;
}

function buildApplicationFromRaw(raw: RawApplication, applicationIdFallback: string): Application {
  const statusRaw = (raw.application_status || '').toLowerCase();
  const stage = normalizeStage(raw.application_type);
  const parsedFraudScore = raw.fraud_score != null ? Number(raw.fraud_score) : undefined;
  const riskScore = parsedFraudScore != null && !Number.isNaN(parsedFraudScore) ? Math.round(parsedFraudScore * 100) : undefined;

  // Build flags from fraud_details arrays
  const flags: string[] = [];
  const fd = getFraudDetails(raw);
  if (fd) Object.values(fd).forEach(arr => { if (Array.isArray(arr)) flags.push(...arr); });
  console.log('Building application from raw:', raw);
// If raw has both application_id and data, drill down to data
const actualRaw = (raw && typeof raw === 'object' && 'data' in raw && (raw as { data?: RawApplication }).data)
    ? (raw as { data?: RawApplication }).data
    : raw;

return {
    id: String((actualRaw as { id?: string | number } | undefined)?.id ?? (actualRaw as { application_id?: string })?.application_id ?? applicationIdFallback),
    studentId: (actualRaw as { application_id?: string })?.application_id || applicationIdFallback,
    name: [(actualRaw as { first_name?: string })?.first_name, (actualRaw as { last_name?: string })?.last_name].filter(Boolean).join(' ') || 'Unknown Applicant',
    email: (actualRaw as { email?: string })?.email || 'unknown@example.com',
    stage,
    timestamp: (actualRaw as { updated_at?: string })?.updated_at || (actualRaw as { created_at?: string })?.created_at || new Date().toISOString(),
    status: statusRaw === 'processed' ? 'processed' : (statusRaw as Application['status']) || 'submitted',
    programId: (actualRaw as { program_id?: string })?.program_id,
    programName: (actualRaw as { program_name?: string })?.program_name,
    updatedAt: (actualRaw as { updated_at?: string })?.updated_at,
    riskScore,
    flags
};
}

function buildApplicationDetailFromRaw(raw: RawApplication, applicationIdFallback: string): ApplicationDetail {
// If raw has both application_id and data, drill down to data
const actualRaw = (raw && typeof raw === 'object' && 'data' in raw && (raw as { data?: RawApplication }).data)
    ? (raw as { data?: RawApplication }).data
    : raw;

return {
    application_id: (actualRaw as RawApplication).application_id || String((actualRaw as { id?: string | number }).id || applicationIdFallback),
    id: (actualRaw as { id?: string | number }).id,
    first_name: (actualRaw as RawApplication).first_name,
    last_name: (actualRaw as RawApplication).last_name,
    email: (actualRaw as RawApplication).email,
    program_name: (actualRaw as RawApplication).program_name,
    program_id: (actualRaw as RawApplication).program_id,
    application_type: (actualRaw as RawApplication).application_type,
    application_status: (actualRaw as RawApplication).application_status,
    created_at: (actualRaw as RawApplication).created_at,
    updated_at: (actualRaw as RawApplication).updated_at,
    supporting_documents: (actualRaw as RawApplication).supporting_documents ?? null,
    academic_history: (actualRaw as RawApplication).academic_history,
    application_details: (actualRaw as RawApplication).application_details ?? null,
    fraud_details: getFraudDetails(actualRaw),
    fraud_score: (actualRaw as RawApplication).fraud_score ?? null,
    agent_recommendations: (actualRaw as RawApplication).agent_recommendations ?? null,
    address: (actualRaw as RawApplication).address,
    phone: (actualRaw as RawApplication).phone ?? null,
    dob: (actualRaw as RawApplication).dob ?? null,
    nationality: (actualRaw as RawApplication).nationality ?? null,
    institution: (actualRaw as RawApplication).institution,
    institution_address: (actualRaw as RawApplication).institution_address,
    sat_scores: (actualRaw as RawApplication).sat_scores ?? null,
} as ApplicationDetail;
}

// Fetch summary Application by id (application_id)
export async function fetchApplicationById(applicationId: string): Promise<Application | null> {
  try {
    const res = await fetch(`${REMOTE_ENDPOINT}/${encodeURIComponent(applicationId)}`, { method: 'GET' });
    if (res.ok) {
      const data: unknown = await res.json();
      const raw = unwrapRawApplication(data);
      if (raw) return buildApplicationFromRaw(raw, applicationId);
    }
  } catch (e) {
    console.warn('[applications] Remote summary fetch error:', e);
  }
  // Fallback to list search (remote)
  try {
    const list = await fetchRemoteApplications();
    const raw = list?.find(r => r.application_id === applicationId || String(r.id ?? '') === applicationId);
    if (raw) return buildApplicationFromRaw(raw, applicationId);
  } catch {
    // ignore fallback errors
  }
  // Last resort: search local mock
  try {
    const localList = extractListFromLocal(localRaw as unknown);
    const raw = localList.find(r => r.application_id === applicationId || String(r.id ?? '') === applicationId);
    if (raw) return buildApplicationFromRaw(raw, applicationId);
  } catch {
    // ignore local fallback errors
  }
  return null;
}

// Fetch full detail by id
export async function fetchApplicationDetailById(applicationId: string): Promise<ApplicationDetail | null> {
  try {
    const res = await fetch(`${REMOTE_ENDPOINT}/${encodeURIComponent(applicationId)}`, { method: 'GET' });
    if (res.ok) {
      const data: unknown = await res.json();
      const raw = unwrapRawApplication(data);
      if (raw) return buildApplicationDetailFromRaw(raw, applicationId);
    }
  } catch (e) {
    console.warn('[applications] Remote detail fetch error:', e);
  }
  // Fallback to list search (remote)
  try {
    const list = await fetchRemoteApplications();
    const raw = list?.find(r => r.application_id === applicationId || String(r.id ?? '') === applicationId);
    if (raw) return buildApplicationDetailFromRaw(raw, applicationId);
  } catch {
    // ignore fallback errors
  }
  // Last resort: search local mock
  try {
    const localList = extractListFromLocal(localRaw as unknown);
    const raw = localList.find(r => r.application_id === applicationId || String(r.id ?? '') === applicationId);
    if (raw) return buildApplicationDetailFromRaw(raw, applicationId);
  } catch {
    // ignore local fallback errors
  }
  return null;
}
