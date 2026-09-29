"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./content-tile-row.module.css";

/** The adjacent content determines both dimensions of the leading tile. */
export function ContentTileRow({
  tile,
  children,
  tileClassName,
  className,
}: {
  tile: ReactNode;
  children: ReactNode;
  tileClassName?: string;
  className?: string;
}) {
  const row = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
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
  }, []);
  return (
    <div ref={row} className={cn(styles.row, className)}>
      <div className={cn(styles.tile, tileClassName)}>{tile}</div>
      <div ref={content} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
