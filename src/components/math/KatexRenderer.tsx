import { memo, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/utils/cn';

interface KatexRendererProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export const KatexRenderer = memo(function KatexRenderer({
  latex,
  display = false,
  className,
}: KatexRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
      });
    } catch {
      return latex;
    }
  }, [latex, display]);

  return (
    <span
      className={cn('font-math', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
