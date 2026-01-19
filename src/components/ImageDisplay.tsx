"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImageDisplayProps {
  imageUrl: string | null;
  seed?: number | null;
}

export function ImageDisplay({ imageUrl, seed }: ImageDisplayProps) {
  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `character-${seed || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (!imageUrl) {
    return (
      <Card className="h-full min-h-[400px] flex items-center justify-center bg-muted/50">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Your generated character will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <img
          src={imageUrl}
          alt="Generated character"
          className="w-full h-auto"
        />
        <div className="absolute bottom-4 right-4">
          <Button onClick={handleDownload} size="sm" variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        {seed && (
          <div className="absolute bottom-4 left-4 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
            Seed: {seed}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
