import React, { createContext, useContext, useState } from 'react';

export interface Application {
  id: string;
  studentId: string;
  name: string;
  email: string;
  stage: 'admission' | 'financial-aid' | 'enrollment';
  timestamp: string;
  status: 'pending' | 'processing' | 'processed' | 'approved' | 'rejected' | 'escalated';
  riskScore?: number;
  flags?: string[];
  avatar: string;
  aiProcessing?: boolean;
  processingStage?: string;
}

interface ApplicationContextType {
  queueApplications: Application[];
  processedApplications: Application[];
  startFraudDetection: (applicationId: string) => void;
  startBulkFraudDetection: () => void;
  isBulkProcessing: boolean;
  bulkProcessingStatus: {
    processed: number;
    total: number;
  };
  updateApplicationStatus: (applicationId: string, status: Application['status'], riskScore?: number, flags?: string[]) => void;
  totalApplications: number;
  totalEscalated: number;
  totalClosed: number;
  flagsResolved: number;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queueApplications, setQueueApplications] = useState<Application[]>([
    {
      id: '1',
      studentId: 'ST-2024-001',
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      stage: 'admission',
      timestamp: new Date().toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '2',
      studentId: 'ST-2024-002',
      name: 'Marcus Johnson',
      email: 'marcus.johnson@email.com',
      stage: 'financial-aid',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '3',
      studentId: 'ST-2024-003',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      stage: 'admission',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '4',
      studentId: 'ST-2024-004',
      name: 'David Rodriguez',
      email: 'david.rodriguez@email.com',
      stage: 'enrollment',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '5',
      studentId: 'ST-2024-005',
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      stage: 'financial-aid',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '6',
      studentId: 'ST-2024-006',
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      stage: 'admission',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '7',
      studentId: 'ST-2024-007',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      stage: 'enrollment',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '8',
      studentId: 'ST-2024-008',
      name: 'Robert Kim',
      email: 'robert.kim@email.com',
      stage: 'financial-aid',
      timestamp: new Date(Date.now() - 2100000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '9',
      studentId: 'ST-2024-009',
      name: 'Jennifer Brown',
      email: 'jennifer.brown@email.com',
      stage: 'admission',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '10',
      studentId: 'ST-2024-010',
      name: 'Michael Davis',
      email: 'michael.davis@email.com',
      stage: 'enrollment',
      timestamp: new Date(Date.now() - 2700000).toISOString(),
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ]);

  const [processedApplications, setProcessedApplications] = useState<Application[]>([
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
  ]);

  // Bulk processing state
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProcessingStatus, setBulkProcessingStatus] = useState({
    processed: 0,
    total: 0
  });

  const startFraudDetection = (applicationId: string) => {
    setQueueApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status: 'processing', aiProcessing: true, processingStage: 'Initializing AI agents...' }
        : app
    ));

    // Simulate AI processing stages
    const stages = [
      'Memory Agent analyzing patterns...',
      'Explainer Agent generating insights...',
      'Decision Agent evaluating risk...',
      'Finalizing analysis...'
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setQueueApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, processingStage: stage }
            : app
        ));
      }, (index + 1) * 2000);
    });

    // Complete processing after 10 seconds
    setTimeout(() => {
      const app = queueApplications.find(a => a.id === applicationId);
      if (app) {
        const riskScore = Math.floor(Math.random() * 100);
        const flags = riskScore > 70 ? ['Document Anomaly', 'Behavioral Pattern'] : [];
        
        const processedStatus = riskScore > 80 ? 'escalated' : 'approved';

        const processedApp: Application = {
          ...app,
          status: processedStatus,
          riskScore,
          flags,
          aiProcessing: false,
          processingStage: undefined
        };

        setProcessedApplications(prev => [processedApp, ...prev]);
        setQueueApplications(prev => prev.filter(a => a.id !== applicationId));
      }
    }, 10000);
  };

  // Function to process applications in bulk
  const startBulkFraudDetection = () => {
    if (queueApplications.length === 0 || isBulkProcessing) return;
    
    setIsBulkProcessing(true);
    setBulkProcessingStatus({
      processed: 0,
      total: queueApplications.length
    });

    // Mark all applications as processing
    setQueueApplications(prev => prev.map(app => ({
      ...app,
      status: 'processing',
      aiProcessing: true,
      processingStage: 'Queued for processing...'
    })));

    // Process each application one by one with a delay
    queueApplications.forEach((app, index) => {
      setTimeout(() => {
        // Update processing stage
        setQueueApplications(prev => prev.map(a => 
          a.id === app.id 
            ? { ...a, processingStage: 'Memory Agent analyzing patterns...' }
            : a
        ));
        
        setTimeout(() => {
          setQueueApplications(prev => prev.map(a => 
            a.id === app.id 
              ? { ...a, processingStage: 'Explainer Agent generating insights...' }
              : a
          ));
        }, 1500);
        
        setTimeout(() => {
          setQueueApplications(prev => prev.map(a => 
            a.id === app.id 
              ? { ...a, processingStage: 'Decision Agent evaluating risk...' }
              : a
          ));
        }, 3000);
        
        setTimeout(() => {
          setQueueApplications(prev => prev.map(a => 
            a.id === app.id 
              ? { ...a, processingStage: 'Finalizing analysis...' }
              : a
          ));
        }, 4500);
        
        // Complete processing for this application
        setTimeout(() => {
          // Find the app in the current state
          const application = queueApplications.find(a => a.id === app.id);
          
          if (application) {
            const riskScore = Math.floor(Math.random() * 100);
            const riskLevel = riskScore >= 80 ? 'high' : (riskScore >= 60 ? 'medium' : 'low');
            const flags = [];
            
            // Generate random flags based on risk level
            if (riskLevel === 'high') {
              flags.push('Essay Similarity', 'Document Anomaly');
            } else if (riskLevel === 'medium') {
              flags.push('Behavioral Pattern');
            }
            
            // Determine status based on risk level
            const processedStatus = riskLevel === 'high' ? 'escalated' : 'approved';
            
            const processedApp: Application = {
              ...application,
              status: processedStatus,
              riskScore,
              flags,
              aiProcessing: false,
              processingStage: undefined,
              timestamp: new Date().toISOString() // Update timestamp to now
            };
            
            // Update processed applications (add to beginning)
            setProcessedApplications(prev => [processedApp, ...prev]);
            
            // Remove from queue
            setQueueApplications(prev => prev.filter(a => a.id !== app.id));
            
            // Update bulk processing status
            setBulkProcessingStatus(prev => ({
              ...prev,
              processed: prev.processed + 1
            }));
            
            // If all applications are processed, reset bulk processing state
            if (index === queueApplications.length - 1) {
              setTimeout(() => {
                setIsBulkProcessing(false);
              }, 1000);
            }
          }
        }, 6000);
      }, index * 3000); // Stagger the processing of each application
    });
  };

  const updateApplicationStatus = (applicationId: string, status: Application['status'], riskScore?: number, flags?: string[]) => {
    setProcessedApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status, riskScore: riskScore || app.riskScore, flags: flags || app.flags }
        : app
    ));
  };

  const totalApplications = queueApplications.length + processedApplications.length;
  const totalEscalated = processedApplications.filter(app => app.status === 'escalated').length;
  const totalClosed = processedApplications.filter(app => app.status === 'approved' || app.status === 'rejected').length;
  const flagsResolved = processedApplications.reduce((sum, app) => sum + (app.flags?.length || 0), 0);

  return (
    <ApplicationContext.Provider value={{
      queueApplications,
      processedApplications,
      startFraudDetection,
      startBulkFraudDetection,
      isBulkProcessing,
      bulkProcessingStatus,
      updateApplicationStatus,
      totalApplications,
      totalEscalated,
      totalClosed,
      flagsResolved
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};