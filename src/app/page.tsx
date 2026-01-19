"use client";

import { useState } from "react";
import { CharacterForm } from "@/components/CharacterForm";
import { ImageDisplay } from "@/components/ImageDisplay";
import { LoadingState } from "@/components/LoadingState";
import { apiClient } from "@/lib/api";
import { GenerateRequest } from "@/types";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (request: GenerateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.generateImage(request);
      if (response.success && response.image_url) {
        setImageUrl(response.image_url);
        setSeed(response.seed || null);
      } else {
        setError(response.error || "Failed to generate image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Artigen
          </h1>
          <p className="text-muted-foreground">
            Create stunning AI-generated images with various art styles
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <CharacterForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          <div>
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-destructive text-center">{error}</p>
              </div>
            ) : (
              <ImageDisplay imageUrl={imageUrl} seed={seed} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
