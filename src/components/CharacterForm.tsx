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
import { StyleSelector } from "./StyleSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api";
import { GenerateRequest } from "@/types";

const RESOLUTIONS = [
  { value: "512x512", label: "512x512 (Square)" },
  { value: "512x768", label: "512x768 (Portrait)" },
  { value: "768x512", label: "768x512 (Landscape)" },
  { value: "768x768", label: "768x768 (Large Square)" },
];

const DEFAULT_STYLES = [
  "anime",
  "realistic",
  "fantasy",
  "sci-fi",
  "cartoon",
  "oil-painting",
  "watercolor",
  "pixel-art",
  "comic-book",
  "3d-render",
];

interface CharacterFormProps {
  onGenerate: (request: GenerateRequest) => Promise<void>;
  isLoading: boolean;
}

export function CharacterForm({ onGenerate, isLoading }: CharacterFormProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("anime");
  const [resolution, setResolution] = useState("512x768");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [styles, setStyles] = useState<string[]>(DEFAULT_STYLES);

  useEffect(() => {
    apiClient.getStyles().then((data) => {
      if (data.styles.length > 0) {
        setStyles(data.styles);
      }
    }).catch(() => {
      // Use default styles if API fails
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await onGenerate({
      prompt: prompt.trim(),
      style,
      resolution,
      negative_prompt: negativePrompt.trim() || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Character Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Character Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your character... (e.g., a warrior with blue eyes and silver armor)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <StyleSelector
            styles={styles}
            value={style}
            onChange={setStyle}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select
              value={resolution}
              onValueChange={setResolution}
              disabled={isLoading}
            >
              <SelectTrigger id="resolution">
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
            <Label htmlFor="negative">Negative Prompt (optional)</Label>
            <Textarea
              id="negative"
              placeholder="What to avoid... (e.g., blurry, bad quality)"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              disabled={isLoading}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "Generating..." : "Generate Character"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
