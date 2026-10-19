"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DEVICE_BEZEL = 8;
const VIEWPORTS = { phone: 390, tablet: 768, desktop: 1280 };

export function ExampleBrowser({
  title,
  description,
  source,
  clinical = false,
}: {
  title: string;
  description: string;
  source: string;
  clinical?: boolean;
}) {
  const [device, setDevice] = useState<keyof typeof VIEWPORTS>("phone");
  const [status, setStatus] = useState("safe");
  const [available, setAvailable] = useState({ width: 0, height: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const width = VIEWPORTS[device];
  const outerWidth = width + DEVICE_BEZEL * 2;
  const outerHeight = 720 + DEVICE_BEZEL * 2;
  const scale =
    available.width > 0
      ? Math.min(1, available.width / outerWidth, available.height / outerHeight)
      : 0;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailable({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (clinical)
      frame.current?.contentWindow?.postMessage(
        { type: "sepcare-preview-status", status },
        window.location.origin,
      );
  }, [status, clinical]);

  useEffect(() => {
    const ready = (event: MessageEvent) => {
      if (
        !clinical ||
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== "sepcare-preview-ready"
      )
        return;
      frame.current?.contentWindow?.postMessage(
        { type: "sepcare-preview-status", status },
        window.location.origin,
      );
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [clinical, status]);

  return (
    <article className="docs-example-article" aria-label={title}>
      <header className="docs-example-heading">
        <div className="docs-example-title-row">
          <h1>{title}</h1>
          <ToggleGroup
            type="single"
            value={device}
            onValueChange={(value) => {
              if (value in VIEWPORTS)
                setDevice(value as keyof typeof VIEWPORTS);
            }}
            aria-label="Preview viewport"
          >
            {Object.keys(VIEWPORTS).map((value) => (
              <ToggleGroupItem key={value} value={value} className="capitalize">
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <p>{description}</p>
      </header>
      {clinical && (
        <div className="docs-example-options">
          <span>Scenario</span>
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(value) => {
              if (value) setStatus(value);
            }}
            aria-label="Clinical example scenario"
          >
            {["safe", "caution", "critical"].map((value) => (
              <ToggleGroupItem key={value} value={value} className="capitalize">
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="docs-example-sample-label">Sample data</span>
        </div>
      )}
      <div className="docs-example-stage" ref={stage}>
        <div
          style={{
            width: outerWidth * scale,
            height: outerHeight * scale,
            visibility: scale ? "visible" : "hidden",
          }}
        >
          <div
            className="docs-example-device"
            style={{
              "--preview-bezel": `${DEVICE_BEZEL}px`,
              width: outerWidth,
              height: outerHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            } as CSSProperties}
          >
            <iframe
              ref={frame}
              title={`${title} — ${device} preview`}
              src={source}
              width={width}
              height={720}
              className="docs-example-frame"
              onLoad={() => {
                if (clinical)
                  frame.current?.contentWindow?.postMessage(
                    { type: "sepcare-preview-status", status },
                    window.location.origin,
                  );
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
