import type { ApiResponse } from "../../types";

interface BaseHttpConfig extends RequestInit {
  baseURL: string;
}

export class BaseHttpClient {
  private baseURL: string;

  constructor(config: BaseHttpConfig) {
    this.baseURL = config.baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseData: ApiResponse<T> = {
      data: {} as T,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      message: "",
    };

    try {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        responseData.message =
          errorData.message || `HTTP error! Status: ${response.status}`;
        throw responseData;
      }

      const data = await response.json();
      responseData.data = data;
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        responseData.message = error.message;
      }
      throw responseData;
    }
  }

  private async request<T>(
    url: string,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const fullUrl = this.baseURL + url;
      const response = await fetch(fullUrl, {
        ...config,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw {
          data: {} as T,
          status: 500,
          statusText: "Internal Server Error",
          ok: false,
          message: error.message,
        } as ApiResponse<T>;
      }
      throw error;
    }
  }

  async get<T>(url: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async patch<T>(
    url: string,
    data?: unknown,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(
    url: string,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}
