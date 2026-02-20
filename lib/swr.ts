import useSWR, { SWRConfiguration } from 'swr';

// Fetcher function
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

// Default SWR config
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
};

// Hook with default caching
export function useCachedData<T>(
  key: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(key, fetcher, {
    ...swrConfig,
    ...options,
  });
}

// Specific hooks for common data
export function useAgents(options?: SWRConfiguration) {
  return useCachedData<{ agents: any[] }>('/api/agents', {
    refreshInterval: 10000, // 10 seconds
    ...options,
  });
}

export function useTasks(options?: SWRConfiguration) {
  return useCachedData<any[]>('/api/tasks', {
    refreshInterval: 30000, // 30 seconds
    ...options,
  });
}

export function useSystemMetrics(options?: SWRConfiguration) {
  return useCachedData<any>('/api/system/resources', {
    refreshInterval: 5000, // 5 seconds
    ...options,
  });
}

export function useMemoryFiles(options?: SWRConfiguration) {
  return useCachedData<{ files: any[] }>('/api/memory/files', {
    refreshInterval: 60000, // 60 seconds
    ...options,
  });
}

export function useDockerContainers(options?: SWRConfiguration) {
  return useCachedData<{ containers: any[] }>('/api/docker', {
    refreshInterval: 10000, // 10 seconds
    ...options,
  });
}

export function useBusinessMetrics(options?: SWRConfiguration) {
  return useCachedData<any>('/api/business/metrics', {
    refreshInterval: 300000, // 5 minutes
    ...options,
  });
}
