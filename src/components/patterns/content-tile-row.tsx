"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./content-tile-row.module.css";

/** Tiles follow content height unless the composition supplies a stable size. */
export function ContentTileRow({
  tile,
  children,
  tileClassName,
  className,
  tileSize,
}: {
  tile: ReactNode;
  children: ReactNode;
  tileClassName?: string;
  className?: string;
  tileSize?: number;
}) {
  const row = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (tileSize !== undefined) return;
    const element = content.current;
    const root = row.current;
    if (!element || !root) return;
    const sync = () => {
      const height = element.offsetHeight;
      if (height > 0) root.style.setProperty("--tile-size", `${height}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, [tileSize]);
  return (
    <div
      ref={row}
      className={cn(styles.row, className)}
      data-fixed-tile={tileSize !== undefined || undefined}
      style={
        tileSize === undefined
          ? undefined
          : ({ "--tile-size": `${tileSize}px` } as CSSProperties)
      }
    >
      <div className={cn(styles.tile, tileClassName)}>{tile}</div>
      <div ref={content} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
