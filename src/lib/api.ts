import { GenerateRequest, GenerateResponse, StylesResponse, ModelsResponse, ImageToImageRequest } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Timeout constants (in milliseconds)
const DEFAULT_TIMEOUT = 10000; // 10 seconds for simple requests
const GENERATION_TIMEOUT = 180000; // 3 minutes for image generation

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout / 1000} seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getStyles(): Promise<StylesResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/api/v1/styles`);
    if (!response.ok) {
      throw new Error("Failed to fetch styles");
    }
    return response.json();
  }

  async getModels(): Promise<ModelsResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/api/v1/models`);
    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }
    return response.json();
  }

  async generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/v1/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
      GENERATION_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      // Handle Pydantic validation errors (array format)
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map((e: { msg?: string; loc?: string[] }) =>
          e.msg || "Validation error"
        ).join(", ");
        throw new Error(messages);
      }
      // Handle formatted error response from our API
      if (error.error && error.details) {
        throw new Error(error.details.join(", "));
      }
      throw new Error(error.detail || error.error || "Failed to generate image");
    }

    return response.json();
  }

  async imageToImage(request: ImageToImageRequest): Promise<GenerateResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/v1/generate/img2img`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
      GENERATION_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      // Handle Pydantic validation errors (array format)
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map((e: { msg?: string; loc?: string[] }) =>
          e.msg || "Validation error"
        ).join(", ");
        throw new Error(messages);
      }
      // Handle formatted error response from our API
      if (error.error && error.details) {
        throw new Error(error.details.join(", "));
      }
      throw new Error(error.detail || error.error || "Failed to transform image");
    }

    return response.json();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/health`, {}, 5000);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
