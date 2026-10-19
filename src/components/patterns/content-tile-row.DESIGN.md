# Content tile row

ContentTileRow is the shared geometry for StatusCard, DeviceCard, and InstructionCard. Consumers supply the tile content, semantic tile colors, and adjacent content. By default, both tile dimensions follow the adjacent content's rendered height, so the tile stays square as titles wrap, descriptions change, or battery content appears. It has no fixed minimum height and no shadow.

Optional `tileSize` supplies a stable square size in layout pixels and centers it vertically beside the content. StatusCard uses 64px so title and description wrapping cannot change the tile width or feed back into text layout. Text is never clipped; the card grows with its content. Fixed tiles skip measurement. Device and instruction rows retain content sizing.

ResizeObserver tracks content changes after layout and font loading. Measurement uses layout pixels (offsetHeight), not transformed viewport bounds, so the docs iframe's uniform scaling does not shrink tiles a second time. The initial server-rendered fallback is a 48px square; the layout effect replaces it on hydration. Icons and resting waves scale inside the tile. The observer is disconnected on unmount.

The shared Wordmark owns SepCare spelling, Plus Jakarta Sans, bold type and letter spacing for both documentation and clinical headers. Its default size is 19px for docs; `size="lg"` is 21px for the clinical header.


## Shared surface depth

Tiles use --gradient-status-sheen over consumer-supplied semantic backgrounds. The --tile-gradient custom property allows shared state treatments to replace the default sheen: healthy device tiles use --gradient-signifier-safe and white glyphs. Tile sizing remains independent of color.
