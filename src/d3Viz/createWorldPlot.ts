// src/viz/createWorldPlot.ts
import * as d3 from "d3";

export type WorldPoint = {
  id: string;        // 唯一 key（用狗名就行）
  lon: number;
  lat: number;
  label?: string;    // tooltip title
  subtitle?: string; // tooltip subtitle
};

export type CreateWorldPlotOptions = {
  width: number;
  height: number;

  // 建议你把 world.geojson 放 public/，然后默认用这个
  worldGeoJsonUrl?: string;

  // 交互回调（Vue 去做 tooltip / 选中）
  onHover?: (d: WorldPoint, ev: MouseEvent) => void;
  onMove?: (d: WorldPoint, ev: MouseEvent) => void;
  onLeave?: () => void;
  onClick?: (d: WorldPoint, ev: MouseEvent) => void;

  highlightId?: string | null;
};

export type WorldPlotApi = {
  update: (points: WorldPoint[]) => void;
  setHighlight: (id: string | null) => void;
  resize: (w: number, h: number) => void;
  destroy: () => void;
};

export function createWorldPlot(
  container: HTMLElement,
  opt: CreateWorldPlotOptions,
): WorldPlotApi {
  const worldUrl = opt.worldGeoJsonUrl ?? "/world.geojson";

  let width = opt.width;
  let height = opt.height;

  // ---- SVG root ----
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  const gRoot = svg.append("g");
  const gLand = gRoot.append("g");
  const gPts = gRoot.append("g");

  // ---- projection/path ----
  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);

  // ---- state ----
  let points: WorldPoint[] = [];
  let highlightId: string | null = opt.highlightId ?? null;

  // ---- zoom ----
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 7])
    .on("zoom", (event) => {
      gRoot.attr("transform", event.transform);
    });

  svg.call(zoom as any);

  function applyHighlight(sel: d3.Selection<SVGCircleElement, WorldPoint, SVGGElement, unknown>) {
    sel
      .attr("r", (d) => (highlightId && d.id === highlightId ? 6.5 : 3.6))
      .attr("opacity", (d) => (highlightId && d.id !== highlightId ? 0.25 : 0.85));
  }

  function drawPoints() {
    const sel = gPts
      .selectAll<SVGCircleElement, WorldPoint>("circle")
      .data(points, (d: any) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("r", 3.6)
            .attr("opacity", 0.85)
            .attr("stroke", "#111827")
            .attr("stroke-width", 0.5),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr("cx", (d) => projection([d.lon, d.lat])?.[0] ?? -999)
      .attr("cy", (d) => projection([d.lon, d.lat])?.[1] ?? -999);

    applyHighlight(sel);

    // interaction -> callbacks
    sel.on("mouseenter", (ev, d) => opt.onHover?.(d, ev as any));
    sel.on("mousemove", (ev, d) => opt.onMove?.(d, ev as any));
    sel.on("mouseleave", () => opt.onLeave?.());
    sel.on("click", (ev, d) => opt.onClick?.(d, ev as any));
  }

  async function drawWorldIfNeeded() {
    const geo: any = await d3.json(worldUrl);
    if (!geo) return;

    projection.fitSize([width, height], geo);

    gLand
      .selectAll("path")
      .data(geo.features ?? [])
      .join("path")
      .attr("d", path as any)
      .attr("fill", "#f3f4f6")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 0.6);

    drawPoints();
  }

  // 初次绘制世界地图
  void drawWorldIfNeeded();

  function update(next: WorldPoint[]) {
    points = next;
    drawPoints();
  }

  function setHighlight(id: string | null) {
    highlightId = id;
    const sel = gPts.selectAll<SVGCircleElement, WorldPoint>("circle");
    applyHighlight(sel);
  }

  function resize(w: number, h: number) {
    width = Math.max(10, w);
    height = Math.max(10, h);

    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    // 重新 fit projection（地图要跟着新尺寸缩放）
    // 重新加载 geojson 太浪费：我们直接用现有 path 的 datum？
    // 最稳：再取一次 features（数量不大，OK）
    void drawWorldIfNeeded();
  }

  function destroy() {
    svg.remove();
  }

  return { update, setHighlight, resize, destroy };
}
