export default function ScheduleCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl p-6 border border-border animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-20 bg-surface-hover rounded-full"></div>
        <div className="h-4 w-16 bg-surface-hover rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-surface-hover rounded mb-2"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-surface-hover rounded"></div>
        <div className="h-4 w-5/6 bg-surface-hover rounded"></div>
        <div className="h-4 w-4/6 bg-surface-hover rounded"></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="h-5 w-24 bg-surface-hover rounded"></div>
        <div className="h-4 w-16 bg-surface-hover rounded"></div>
      </div>
    </div>
  );
}

export default function EventCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl p-6 border border-border animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-20 bg-surface-hover rounded-full"></div>
        <div className="h-4 w-16 bg-surface-hover rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-surface-hover rounded mb-2"></div>
      <div className="h-4 w-full bg-surface-hover rounded mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-surface-hover rounded"></div>
        <div className="h-4 w-5/6 bg-surface-hover rounded"></div>
        <div className="h-4 w-4/6 bg-surface-hover rounded"></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="h-5 w-24 bg-surface-hover rounded"></div>
        <div className="h-4 w-16 bg-surface-hover rounded"></div>
      </div>
    </div>
  );
}
