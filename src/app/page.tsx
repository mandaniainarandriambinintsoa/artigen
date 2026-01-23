"use client";

import { useState, useEffect } from "react";
import { ImageDisplay } from "@/components/ImageDisplay";
import { LoadingState } from "@/components/LoadingState";
import { apiClient } from "@/lib/api";
import { GenerateRequest, ImageToImageRequest } from "@/types";
import {
  ImageIcon,
  Wand2,
  Sparkles,
  Settings2,
  Plus,
  Send,
  Ratio,
  Palette,
  Cpu,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

const RESOLUTIONS = [
  { value: "512x512", label: "1:1", icon: "square" },
  { value: "512x768", label: "2:3", icon: "portrait" },
  { value: "768x512", label: "3:2", icon: "landscape" },
  { value: "1024x1024", label: "1:1 HD", icon: "square" },
];

const DEFAULT_STYLES = [
  { id: "realistic", name: "Realistic", color: "from-blue-500 to-cyan-500" },
  { id: "photorealistic", name: "Photo", color: "from-green-500 to-emerald-500" },
  { id: "cinematic", name: "Cinematic", color: "from-amber-500 to-orange-500" },
  { id: "portrait", name: "Portrait", color: "from-pink-500 to-rose-500" },
  { id: "anime", name: "Anime", color: "from-purple-500 to-violet-500" },
  { id: "fantasy", name: "Fantasy", color: "from-indigo-500 to-purple-500" },
  { id: "sci-fi", name: "Sci-Fi", color: "from-cyan-500 to-blue-500" },
  { id: "3d-render", name: "3D", color: "from-red-500 to-pink-500" },
];

const DEFAULT_MODELS = [
  { id: "sana", name: "Sana", desc: "High quality realistic" },
  { id: "zimage", name: "Zimage", desc: "Alternative model" },
  { id: "turbo", name: "Turbo", desc: "Fast generation" },
];

const INSPIRATIONS = [
  "Beautiful sunset over mountains",
  "Cyberpunk city at night",
  "Portrait of a warrior",
  "Fantasy dragon",
  "Futuristic spaceship",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"txt2img" | "img2img">("txt2img");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("realistic");
  const [resolution, setResolution] = useState("1024x1024");
  const [model, setModel] = useState("sana");
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [models, setModels] = useState(DEFAULT_MODELS);

  useEffect(() => {
    apiClient.getStyles().then((data) => {
      if (data.styles.length > 0) {
        setStyles(data.styles.map((s, i) => ({
          id: s,
          name: s.charAt(0).toUpperCase() + s.slice(1).replace("-", " "),
          color: DEFAULT_STYLES[i % DEFAULT_STYLES.length]?.color || "from-gray-500 to-gray-600"
        })));
      }
    }).catch(() => {});

    apiClient.getModels().then((data) => {
      if (Object.keys(data.models).length > 0) {
        const filtered = Object.entries(data.models)
          .filter(([key]) => key !== "kontext")
          .map(([key, desc]) => ({
            id: key,
            name: key.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            desc: desc as string
          }));
        setModels(filtered);
      }
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateRequest = {
        prompt: prompt.trim(),
        style,
        resolution,
        model,
        enhance: true,
      };
      const response = await apiClient.generateImage(request);
      if (response.success && response.image_url) {
        setGeneratedImage(response.image_url);
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

  const handleTransform = async () => {
    if (!prompt.trim() || !imageUrl.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const request: ImageToImageRequest = {
        prompt: prompt.trim(),
        image_url: imageUrl.trim(),
        style,
        resolution,
      };
      const response = await apiClient.imageToImage(request);
      if (response.success && response.image_url) {
        setGeneratedImage(response.image_url);
        setSeed(response.seed || null);
      } else {
        setError(response.error || "Failed to transform image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "txt2img") {
      handleGenerate();
    } else {
      handleTransform();
    }
  };

  const currentStyle = styles.find(s => s.id === style);

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-20 bg-card/50 backdrop-blur-xl border-r border-border/50
        flex flex-col items-center py-6 gap-2
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Nav Items */}
        <button
          onClick={() => { setActiveTab("txt2img"); setSidebarOpen(false); }}
          className={`sidebar-item ${activeTab === "txt2img" ? "active" : ""}`}
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Txt2Img</span>
        </button>

        <button
          onClick={() => { setActiveTab("img2img"); setSidebarOpen(false); }}
          className={`sidebar-item ${activeTab === "img2img" ? "active" : ""}`}
        >
          <Wand2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Img2Img</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`sidebar-item ${showSettings ? "active" : ""}`}
        >
          <Settings2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-8">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile */}
          <h1 className="text-xl font-bold">
            <span className="gradient-text">Artigen</span>
          </h1>
          <div className="text-sm text-muted-foreground">
            Free AI Image Generator
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              {activeTab === "txt2img" ? "Text to Image AI" : "Image to Image AI"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {activeTab === "txt2img"
                ? "Create stunning images from text descriptions using advanced AI models."
                : "Transform existing images with AI-powered style transfer."}
            </p>
          </div>

          {/* Generated Image Display */}
          {(generatedImage || isLoading || error) && (
            <div className="w-full max-w-2xl mb-8">
              <div className="gradient-border p-1">
                <div className="bg-card rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  {isLoading ? (
                    <LoadingState />
                  ) : error ? (
                    <div className="text-center p-6">
                      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-destructive text-xl">!</span>
                      </div>
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  ) : generatedImage ? (
                    <ImageDisplay imageUrl={generatedImage} seed={seed} />
                  ) : null}
                </div>
              </div>
              {seed && (
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">Seed: {seed}</span>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="w-full max-w-2xl">
            <div className="gradient-border p-6">
              {/* Image URL input for img2img */}
              {activeTab === "img2img" && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-lg input-glow">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="url"
                      placeholder="Paste image URL here..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div className="flex items-start gap-3 mb-4">
                <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </button>
                <textarea
                  placeholder={activeTab === "txt2img"
                    ? "Enter your idea to generate..."
                    : "Describe how to transform the image..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-base placeholder:text-muted-foreground min-h-[80px]"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Model Selector */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm">
                    <Cpu className="h-4 w-4" />
                    <span>{models.find(m => m.id === model)?.name || model}</span>
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-card border border-border rounded-lg shadow-xl p-2 min-w-[180px]">
                      {models.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setModel(m.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            model === m.id ? "bg-primary/20 text-primary" : "hover:bg-secondary"
                          }`}
                        >
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resolution Selector */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm">
                    <Ratio className="h-4 w-4" />
                    <span>{RESOLUTIONS.find(r => r.value === resolution)?.label}</span>
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-card border border-border rounded-lg shadow-xl p-2">
                      {RESOLUTIONS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setResolution(r.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            resolution === r.value ? "bg-primary/20 text-primary" : "hover:bg-secondary"
                          }`}
                        >
                          {r.label} <span className="text-muted-foreground text-xs">({r.value})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Style Selector */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm">
                    <Palette className="h-4 w-4" />
                    <span>{currentStyle?.name || style}</span>
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-card border border-border rounded-lg shadow-xl p-2 min-w-[160px] max-h-[300px] overflow-y-auto">
                      {styles.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            style === s.id ? "bg-primary/20 text-primary" : "hover:bg-secondary"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${s.color}`} />
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1" />

                {/* Generate Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !prompt.trim() || (activeTab === "img2img" && !imageUrl.trim())}
                  className="btn-gradient flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Inspiration Chips */}
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <button
                onClick={() => setPrompt(INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)])}
                className="chip flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Random
              </button>
              {INSPIRATIONS.slice(0, 3).map((insp, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(insp)}
                  className="chip"
                >
                  {insp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-y-0 right-0 w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 p-6 z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Settings</h3>
            <button onClick={() => setShowSettings(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <div className="space-y-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      model === m.id
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      style === s.id
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${s.color}`} />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setResolution(r.value)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      resolution === r.value
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
