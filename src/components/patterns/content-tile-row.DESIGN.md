# Content tile row

ContentTileRow is the shared geometry for StatusCard, DeviceCard, InstructionCard, and DeviceHeader. Consumers supply the tile content, semantic tile colors, and adjacent content. Both tile dimensions follow the adjacent content's rendered height, so the tile stays square as titles wrap, descriptions change, or battery content appears. It has no fixed minimum height and no shadow.

ResizeObserver tracks content changes after layout and font loading. Measurement uses layout pixels (offsetHeight), not transformed viewport bounds, so the docs iframe's uniform scaling does not shrink tiles a second time. The initial server-rendered fallback is a 48px square; the layout effect replaces it on hydration. Icons and resting waves scale inside the tile. The observer is disconnected on unmount.

The shared Wordmark owns SepCare spelling, Plus Jakarta Sans, bold type and letter spacing for both documentation and clinical headers. Its default size is 19px for docs; `size="lg"` is 21px for the clinical header.
