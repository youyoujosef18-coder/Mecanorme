import React from 'react';

/**
 * Stand-in for `next/dynamic` used only by the single-file preview bundle.
 * Everything is already bundled, so the loader resolves immediately; the
 * component renders null for the first tick instead of suspending, which
 * keeps it safe to use outside a <Suspense> boundary.
 */
type Loader = () => Promise<unknown>;

export default function dynamic<P extends object>(loader: Loader) {
  const Dynamic: React.FC<P> = (props) => {
    const [Comp, setComp] = React.useState<React.ComponentType<P> | null>(null);

    React.useEffect(() => {
      let alive = true;
      Promise.resolve(loader())
        .then((mod) => {
          if (!alive) return;
          const resolved =
            mod && typeof mod === 'object' && 'default' in (mod as Record<string, unknown>)
              ? (mod as { default: React.ComponentType<P> }).default
              : (mod as React.ComponentType<P>);
          setComp(() => resolved);
        })
        .catch(() => {
          /* a failed chunk simply renders nothing — LazyScene shows its fallback */
        });
      return () => {
        alive = false;
      };
    }, []);

    if (!Comp) return null;
    return React.createElement(Comp, props);
  };

  Dynamic.displayName = 'DynamicPreview';
  return Dynamic;
}
