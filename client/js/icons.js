const SVG_NS = "http://www.w3.org/2000/svg";

// Build an icon from a fixed path shape
export function createIcon(pathData) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathData);

    svg.append(path);
    return svg;
}
