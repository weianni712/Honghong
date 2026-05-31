// API 客户端封装，统一处理错误和重试

interface ApiOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        const status = response.status;

        // 处理 HTTP 错误
        if (!response.ok) {
          let errorMessage = `HTTP ${status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // 如果解析 JSON 失败，使用默认错误信息
          }

          return { data: null, error: errorMessage, status };
        }

        // 处理 204 No Content
        if (status === 204) {
          return { data: null as T, error: null, status };
        }

        const data = await response.json();
        return { data, error: null, status };

      } catch (error) {
        lastError = error as Error;
        
        // 如果是最后一次尝试，抛出错误
        if (i === retries - 1) {
          break;
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }

    return {
      data: null,
      error: lastError?.message || '网络请求失败，请检查网络连接',
      status: 0,
    };
  }

  async get<T>(url: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, body: unknown, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(url: string, body: unknown, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(url: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(url, { ...options, method: 'DELETE' });
  }
}

// 导出单例实例
export const apiClient = new ApiClient();

// 导出便捷函数
export async function apiGet<T>(url: string, options?: ApiOptions) {
  return apiClient.get<T>(url, options);
}

export async function apiPost<T>(url: string, body: unknown, options?: ApiOptions) {
  return apiClient.post<T>(url, body, options);
}

export async function apiPut<T>(url: string, body: unknown, options?: ApiOptions) {
  return apiClient.put<T>(url, body, options);
}

export async function apiDelete<T>(url: string, options?: ApiOptions) {
  return apiClient.delete<T>(url, options);
}
