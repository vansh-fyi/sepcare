# Screen example browser

ExampleBrowser owns the outer preview stage and device frame for every screen example. The stage uses --color-preview-stage, an alias of neutral-900. The frame uses --color-preview-device-frame (black) and --color-preview-device-edge for its crisp outer edge. UI inside the iframe retains the pure white --color-page-canvas.

Real iframe viewports are 390, 768, or 1280px wide and 720px tall. The decorative bezel adds 8px on each side. Scale calculations fit the full outer dimensions inside the stage content box; the frame and screen scale together. Rounded corners are concentric: outer radius equals the screen radius plus bezel padding. The frame does not simulate an operating-system status bar or obscure content with a notch.

Viewport changes update dimensions without replacing the iframe. Navigation and clinical state remain intact. Scenario controls and sample-data labels remain outside the device; postMessage checks retain both origin and source validation.

Consumers: Clinical dashboard, Forms, Sensor states, and Empty and loading documentation examples. Tokens appear in the Colors catalog under Screen previews.
