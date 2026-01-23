"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Wand2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { ImageToImageRequest } from "@/types";

const RESOLUTIONS = [
  { value: "512x512", label: "512x512" },
  { value: "512x768", label: "512x768" },
  { value: "768x512", label: "768x512" },
  { value: "768x768", label: "768x768" },
  { value: "1024x1024", label: "1024x1024" },
];

const DEFAULT_STYLES = [
  "realistic",
  "photorealistic",
  "cinematic",
  "portrait",
  "anime",
  "fantasy",
  "sci-fi",
  "3d-render",
];

interface ImageToImageFormProps {
  onTransform: (request: ImageToImageRequest) => Promise<void>;
  isLoading: boolean;
}

export function ImageToImageForm({ onTransform, isLoading }: ImageToImageFormProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [resolution, setResolution] = useState("768x768");
  const [styles, setStyles] = useState<string[]>(DEFAULT_STYLES);

  useEffect(() => {
    apiClient.getStyles().then((data) => {
      if (data.styles.length > 0) {
        setStyles(data.styles);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !prompt.trim()) return;

    await onTransform({
      image_url: imageUrl.trim(),
      prompt: prompt.trim(),
      style,
      resolution,
    });
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wand2 className="h-5 w-5 text-primary" />
          Transform Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL
            </Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transformPrompt" className="text-sm font-medium">
              Transformation
            </Label>
            <Textarea
              id="transformPrompt"
              placeholder="Describe how to transform the image... (e.g., make it anime style, add sunset lighting)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Style</Label>
              <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Resolution</Label>
              <Select value={resolution} onValueChange={setResolution} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTIONS.map((res) => (
                    <SelectItem key={res.value} value={res.value}>
                      {res.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !imageUrl.trim() || !prompt.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Transforming...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Transform Image
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
