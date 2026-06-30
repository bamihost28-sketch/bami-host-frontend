import { cn } from "@/lib/utils";

interface BamiHostLogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
}

export const BamiHostLogo = ({ 
  className, 
  showTagline = true, 
  variant = 'default' 
}: BamiHostLogoProps) => {
  if (variant === 'icon-only') {
    return (
      <div className={cn("flex items-center", className)}>
        <div className="h-8 w-8 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-6 w-6 bg-gradient-to-br from-green-600 to-green-800 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <span className="font-bold text-lg">Bami Host</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Bami Host
          </h1>
          {showTagline && (
            <p className="text-sm text-muted-foreground -mt-1">
              Your Personal Growth Platform
            </p>
          )}
        </div>
      </div>
    </div>
  );
};