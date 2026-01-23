"use client";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Creating your masterpiece..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      {/* Animated gradient spinner */}
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-secondary animate-pulse" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 h-12 w-12 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1">
        <p className="text-muted-foreground text-sm">{message}</p>
        <span className="flex gap-1">
          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-pink-500 to-primary animate-pulse rounded-full"
             style={{
               width: '60%',
               animation: 'loading 2s ease-in-out infinite'
             }}
        />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
