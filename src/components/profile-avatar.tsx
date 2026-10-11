type ProfileAvatarProps = {
  avatarUrl: string | null;
  displayName: string;
  size?: "xs" | "md" | "lg";
};

const sizeClasses = {
  xs: "size-6 text-xs",
  md: "size-14 text-xl",
  lg: "size-20 text-3xl",
};

export function ProfileAvatar({
  avatarUrl,
  displayName,
  size = "md",
}: ProfileAvatarProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "G";

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-lg bg-emerald-600 ${sizeClasses[size]}`}
    >
      {avatarUrl ? (
        <div
          aria-label={`${displayName} profile picture`}
          className="h-full w-full bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-white">
          {initial}
        </div>
      )}
    </div>
  );
}
