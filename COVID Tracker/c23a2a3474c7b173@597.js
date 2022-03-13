// https://observablehq.com/@d3/diverging-bar-chart@597
import define1 from "./7a9e12f9fb3d8e06@459.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["state-population-2010-2019.tsv",new URL("./files/553ece9b37cf5bc5cd7da5709585f70ecddac30e8df28cf16a0689d4e2ace1c35f6d18033cc2e4920ac7920b2549211e3b9f4b73460bf5c19e01a64051403866",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Bar Chart, Diverging

A diverging bar chart can show negative values as well as positive ones. Bars are positioned by their top-left corner and cannot have a negative width; thus if the value is positive, it determines the right edge, while if it’s negative, it determines the left. This chart shows estimated change in population from 2010 to 2019.`
)});
  main.variable(observer("viewof metric")).define("viewof metric", ["Inputs"], function(Inputs){return(
Inputs.radio(new Map([["Absolute", "absolute"], ["Relative", "relative"]]), {value: "absolute", label: "Change"})
)});
  main.variable(observer("metric")).define("metric", ["Generators", "viewof metric"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["DivergingBarChart","states","metric","d3","width"], function(DivergingBarChart,states,metric,d3,width){return(
DivergingBarChart(states, {
  x: metric === "absolute" ? d => d[2019] - d[2010] : d => d[2019] / d[2010] - 1,
  y: d => d.State,
  yDomain: d3.groupSort(states, ([d]) => d[2019] - d[2010], d => d.State),
  xFormat: metric === "absolute" ? "+,d" : "+%",
  xLabel: "← decrease · Change in population · increase →",
  width,
  marginRight: 70,
  marginLeft: 70,
  colors: d3.schemeRdBu[3]
})
)});
  main.variable(observer("states")).define("states", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("state-population-2010-2019.tsv").tsv({typed: true})
)});
  main.variable(observer()).define(["howto"], function(howto){return(
howto("DivergingBarChart")
)});
  main.variable(observer()).define(["altplot","metric"], function(altplot,metric){return(
altplot(`Plot.plot({
  x: {
    tickFormat: "+${metric === "absolute" ? "s" : "%"}"
  },
  marks: [
    Plot.barX(states, {
      x: d => ${metric === "absolute" ? `d[2019] - d[2010]` : `d[2019] / d[2010] - 1`},
      y: "State",
      fill: d => d[2019] < d[2010],
      sort: {y: "x"}
    })
  ]
})`)
)});
  main.variable(observer("DivergingBarChart")).define("DivergingBarChart", ["d3"], function(d3){return(
function DivergingBarChart(data, {
  x = d => d, // given d in data, returns the (quantitative) x-value
  y = (d, i) => i, // given d in data, returns the (ordinal) y-value
  title, // given d in data, returns the title text
  marginTop = 30, // top margin, in pixels
  marginRight = 40, // right margin, in pixels
  marginBottom = 10, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width of chart, in pixels
  height, // the outer height of the chart, in pixels
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  xFormat, // a format specifier string for the x-axis
  xLabel, // a label for the x-axis
  yPadding = 0.1, // amount of y-range to reserve to separate bars
  yDomain, // an array of (ordinal) y-values
  yRange, // [top, bottom]
  colors = d3.schemePiYG[3] // [negative, …, positive] colors
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);

  // Compute default domains, and unique the y-domain.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = Y;
  yDomain = new d3.InternSet(yDomain);

  // Omit any data not present in the y-domain.
  // Lookup the x-value for a given y-value.
  const I = d3.range(X.length).filter(i => yDomain.has(Y[i]));
  const YX = d3.rollup(I, ([i]) => X[i], i => Y[i]);

  // Compute the default height.
  if (height === undefined) height = Math.ceil((yDomain.size + yPadding) * 25) + marginTop + marginBottom;
  if (yRange === undefined) yRange = [marginTop, height - marginBottom];

  // Construct scales, axes, and formats.
  const xScale = xType(xDomain, xRange);
  const yScale = d3.scaleBand(yDomain, yRange).padding(yPadding);
  const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
  const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(6);
  const format = xScale.tickFormat(100, xFormat);

  // Compute titles.
  if (title === undefined) {
    title = i => `${Y[i]}\n${format(X[i])}`;
  } else if (title !== null) {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("y2", height - marginTop - marginBottom)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", xScale(0))
          .attr("y", -22)
          .attr("fill", "currentColor")
          .attr("text-anchor", "center")
          .text(xLabel));

  const bar = svg.append("g")
    .selectAll("rect")
    .data(I)
    .join("rect")
      .attr("fill", i => colors[X[i] > 0 ? colors.length - 1 : 0])
      .attr("x", i => Math.min(xScale(0), xScale(X[i])))
      .attr("y", i => yScale(Y[i]))
      .attr("width", i => Math.abs(xScale(X[i]) - xScale(0)))
      .attr("height", yScale.bandwidth());

  if (title) bar.append("title")
      .text(title);

  svg.append("g")
      .attr("text-anchor", "end")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("text")
    .data(I)
    .join("text")
      .attr("text-anchor", i => X[i] < 0 ? "end" : "start")
      .attr("x", i => xScale(X[i]) + Math.sign(X[i] - 0) * 4)
      .attr("y", i => yScale(Y[i]) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text(i => format(X[i]));

  svg.append("g")
      .attr("transform", `translate(${xScale(0)},0)`)
      .call(yAxis)
      .call(g => g.selectAll(".tick text")
        .filter(y => YX.get(y) < 0)
          .attr("text-anchor", "start")
          .attr("x", 6));

  return svg.node();
}
)});
  const child1 = runtime.module(define1);
  main.import("howto", child1);
  main.import("altplot", child1);
  return main;
}
