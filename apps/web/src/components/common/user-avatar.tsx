import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function UserAvatar({
  name,
  email,
  imageUrl,
  size = "md",
  showInfo = false,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name, email);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "사용자"}
          className={cn("rounded-full object-cover", sizeClasses[size])}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted font-medium",
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}

      {showInfo && (
        <div className="flex-1 truncate">
          <p className="truncate font-medium text-foreground">
            {name || "사용자"}
          </p>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
      )}
    </div>
  );
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  if (email) {
    return email[0].toUpperCase();
  }

  return "U";
}

