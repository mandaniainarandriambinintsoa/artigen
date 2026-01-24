import { GenerateRequest, GenerateResponse, StylesResponse, ModelsResponse, ImageToImageRequest } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Timeout constants (in milliseconds)
const DEFAULT_TIMEOUT = 10000; // 10 seconds for simple requests
const GENERATION_TIMEOUT = 300000; // 5 minutes max for queue polling
const POLL_INTERVAL = 2000; // 2 seconds between status checks

// Queue job response types
interface QueueJobResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  position?: number;
  message?: string;
  result?: GenerateResponse;
  error?: string;
}

interface QueueStatusResponse {
  pending: number;
  processing: number;
  max_concurrent: number;
  available_slots: number;
}

// Callback for progress updates
type ProgressCallback = (status: string, position?: number) => void;

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

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  /**
   * Get current queue status
   */
  async getQueueStatus(): Promise<QueueStatusResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/api/v1/generate/queue`);
    if (!response.ok) {
      throw new Error("Failed to get queue status");
    }
    return response.json();
  }

  /**
   * Submit a job to the queue and poll until completion
   */
  private async submitAndPoll(
    endpoint: string,
    request: GenerateRequest | ImageToImageRequest,
    onProgress?: ProgressCallback
  ): Promise<GenerateResponse> {
    // Submit job to queue
    const submitResponse = await fetchWithTimeout(
      `${this.baseUrl}${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map((e: { msg?: string }) => e.msg || "Validation error").join(", ");
        throw new Error(messages);
      }
      if (error.error && error.details) {
        throw new Error(error.details.join(", "));
      }
      throw new Error(error.detail || error.error || "Failed to submit job");
    }

    const jobData: QueueJobResponse = await submitResponse.json();
    const jobId = jobData.job_id;

    onProgress?.(`Queued - Position: ${jobData.position}`, jobData.position);

    // Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < GENERATION_TIMEOUT) {
      await sleep(POLL_INTERVAL);

      const statusResponse = await fetchWithTimeout(
        `${this.baseUrl}/api/v1/generate/queue/${jobId}`
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to check job status");
      }

      const status: QueueJobResponse = await statusResponse.json();

      switch (status.status) {
        case "pending":
          onProgress?.(`In queue - Position: ${status.position}`, status.position);
          break;

        case "processing":
          onProgress?.("Generating image...");
          break;

        case "completed":
          if (status.result) {
            onProgress?.("Complete!");
            return status.result;
          }
          throw new Error("Job completed but no result");

        case "failed":
          throw new Error(status.error || "Image generation failed");
      }
    }

    throw new Error("Generation timed out - please try again");
  }

  /**
   * Generate image using queue system (recommended for high traffic)
   */
  async generateImageQueued(
    request: GenerateRequest,
    onProgress?: ProgressCallback
  ): Promise<GenerateResponse> {
    return this.submitAndPoll("/api/v1/generate/queue", request, onProgress);
  }

  /**
   * Generate image directly (legacy - may timeout under high load)
   */
  async generateImageDirect(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/v1/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
      GENERATION_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map((e: { msg?: string }) => e.msg || "Validation error").join(", ");
        throw new Error(messages);
      }
      if (error.error && error.details) {
        throw new Error(error.details.join(", "));
      }
      throw new Error(error.detail || error.error || "Failed to generate image");
    }

    return response.json();
  }

  /**
   * Main generate method - uses queue by default
   */
  async generateImage(
    request: GenerateRequest,
    onProgress?: ProgressCallback
  ): Promise<GenerateResponse> {
    // Always use queue for better reliability
    return this.generateImageQueued(request, onProgress);
  }

  /**
   * Image-to-image transformation (direct - no queue for img2img yet)
   */
  async imageToImage(request: ImageToImageRequest): Promise<GenerateResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/v1/generate/img2img`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
      GENERATION_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map((e: { msg?: string }) => e.msg || "Validation error").join(", ");
        throw new Error(messages);
      }
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
