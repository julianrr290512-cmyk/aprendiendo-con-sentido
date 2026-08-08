import { memo } from 'react';
import { Skeleton } from './Skeleton';

export const PageSkeleton = memo(function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
});
