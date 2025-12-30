/**
 * API 服务基础配置
 * 为未来的后端 API 集成做准备
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

/**
 * 基础 fetch 封装
 */
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) => 
    request<T>(endpoint, { method: 'GET', params }),
    
  post: <T>(endpoint: string, data?: unknown) => 
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    
  put: <T>(endpoint: string, data?: unknown) => 
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' }),
};
