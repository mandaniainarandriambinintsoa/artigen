"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Cpu } from "lucide-react";
import { apiClient } from "@/lib/api";
import { GenerateRequest } from "@/types";

const RESOLUTIONS = [
  { value: "512x512", label: "512x512 (Square)" },
  { value: "512x768", label: "512x768 (Portrait)" },
  { value: "768x512", label: "768x512 (Landscape)" },
  { value: "768x768", label: "768x768 (Large Square)" },
  { value: "1024x1024", label: "1024x1024 (HD Square)" },
  { value: "1024x768", label: "1024x768 (HD Landscape)" },
  { value: "768x1024", label: "768x1024 (HD Portrait)" },
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

const DEFAULT_MODELS: Record<string, string> = {
  "flux-realism": "Hyper-realistic (Recommended)",
  "flux": "High quality general",
  "turbo": "Fast generation",
};

interface CharacterFormProps {
  onGenerate: (request: GenerateRequest) => Promise<void>;
  isLoading: boolean;
}

export function CharacterForm({ onGenerate, isLoading }: CharacterFormProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [resolution, setResolution] = useState("768x768");
  const [negativePrompt, setNegativePrompt] = useState("cartoon, anime, illustration, drawing, art, painting, sketch, cgi, 3d, render, fake, artificial");
  const [styles, setStyles] = useState<string[]>(DEFAULT_STYLES);
  const [model, setModel] = useState("flux-realism");
  const [models, setModels] = useState<Record<string, string>>(DEFAULT_MODELS);

  useEffect(() => {
    // Fetch styles and models from API
    apiClient.getStyles().then((data) => {
      if (data.styles.length > 0) {
        setStyles(data.styles);
      }
    }).catch(() => {
      // Use default styles if API fails
    });

    apiClient.getModels().then((data) => {
      if (Object.keys(data.models).length > 0) {
        // Filter out kontext (img2img only)
        const filteredModels = Object.fromEntries(
          Object.entries(data.models).filter(([key]) => key !== "kontext")
        );
        setModels(filteredModels);
      }
    }).catch(() => {
      // Use default models if API fails
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await onGenerate({
      prompt: prompt.trim(),
      style,
      resolution,
      model,
      negative_prompt: negativePrompt.trim() || undefined,
      enhance: true,
    });
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Describe your image
            </Label>
            <Textarea
              id="prompt"
              placeholder="A beautiful sunset over mountains with golden light..."
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
              <Label className="text-sm font-medium flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                Model
              </Label>
              <Select value={model} onValueChange={setModel} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(models).map(([key, description]) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="negative" className="text-sm font-medium">
              Negative Prompt
            </Label>
            <Textarea
              id="negative"
              placeholder="Things to avoid..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              disabled={isLoading}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Image
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
