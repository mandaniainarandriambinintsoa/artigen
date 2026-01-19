export interface GenerateRequest {
  prompt: string;
  style?: string;
  resolution?: string;
  negative_prompt?: string;
}

export interface GenerateResponse {
  success: boolean;
  image_url?: string;
  seed?: number;
  error?: string;
}

export interface StylesResponse {
  styles: string[];
}

export interface ApiError {
  detail: string;
}
