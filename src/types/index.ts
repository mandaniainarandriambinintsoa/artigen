export interface GenerateRequest {
  prompt: string;
  style?: string;
  resolution?: string;
  negative_prompt?: string;
  model?: string;
  enhance?: boolean;
}

export interface ImageToImageRequest {
  prompt: string;
  image_url: string;
  style?: string;
  resolution?: string;
  negative_prompt?: string;
}

export interface GenerateResponse {
  success: boolean;
  image_url?: string;
  seed?: number;
  model?: string;
  error?: string;
}

export interface StylesResponse {
  styles: string[];
}

export interface ModelsResponse {
  models: Record<string, string>;
}

export interface ApiError {
  detail: string;
}
