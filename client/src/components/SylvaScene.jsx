import { useRef } from "react";
import innerGreenSource from "../shaders/sylva-living-world/sources/inner-green-3d.html?raw";
import threeRuntime from "../shaders/sylva-living-world/sources/inner-green-assets/three.min.js?raw";

// Build the iframe srcDoc by inlining the Three.js runtime into the HTML.
// The HTML has: <script src="inner-green-assets/three.min.js"></script>
// We replace that with an inline <script>...runtime...</script>.
let cachedDoc = null;

function getSceneDoc() {
  if (cachedDoc) return cachedDoc;

  // Simple, robust replacement: swap the external script src for inline code
  const externalTag = '<script src="inner-green-assets/three.min.js">';
  const idx = innerGreenSource.indexOf(externalTag);

  if (idx !== -1) {
    // Find the closing </script> after the external tag
    const closeTag = innerGreenSource.indexOf("</script>", idx);
    if (closeTag !== -1) {
      const before = innerGreenSource.slice(0, idx);
      const after = innerGreenSource.slice(closeTag + "</script>".length);
      cachedDoc = before + "<script>" + threeRuntime + "<" + "/script>" + after;
      return cachedDoc;
    }
  }

  // Fallback: just use the HTML as-is (Three.js won't load but at least it renders)
  cachedDoc = innerGreenSource;
  return cachedDoc;
}

/**
 * <SylvaScene />
 *
 * Renders the Sylva Living World (living-green) procedural Three.js scene
 * inside a sandboxed iframe. Stretches to fill its container; overlay your
 * auth card on top with z-index.
 */
export default function SylvaScene({ style, className }) {
  const iframeRef = useRef(null);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
        ...style,
      }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={getSceneDoc()}
        sandbox="allow-scripts"
        title="Sylva Living World background"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </div>
  );
}