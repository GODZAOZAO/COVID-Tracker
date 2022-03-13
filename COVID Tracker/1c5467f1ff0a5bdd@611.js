import define1 from "./5a59b457a394ff1c@531.js";
import define2 from "./c23a2a3474c7b173@597.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Covid Tracker
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `Process live COVID data from the **Johns Hopkins Corona Virus Resource Center** in the time_series_covid19_confirmed_US.csv file on github at https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series. The readme file there describes the meta-data, the values are the cumulative COVID cases over time.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Daily Update COIVD Cases`
)});
  main.variable(observer("i")).define("i", function(){return(
-1
)});
  main.variable(observer()).define(["html","date","d3","data"], function(html,date,d3,data){return(
html`The total number of USA COVID cases on ${date} is ${d3.sum(data.map(r => r[date]))}`
)});
  main.variable(observer("date")).define("date", ["data","i"], function(data,i){return(
data.columns.slice(i)[0]
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## COVID Cases Based on States`
)});
  main.variable(observer("data2")).define("data2", ["data","date","i"], function(data,date,i){return(
data.map(r => ({Province_State: r.Province_State, LastWeek: r[date] - r[data.columns.slice(i-7)[0]], PreWeek: r[data.columns.slice(i-7)[0]] - r[data.columns.slice(i-14)[0]]}))
)});
  main.variable(observer("data3")).define("data3", ["data2"], function(data2){return(
data2.map(r => ({Province_State: r.Province_State, Change: r.LastWeek-r.PreWeek}))
)});
  main.variable(observer("data4")).define("data4", ["d3","data3"], function(d3,data3){return(
Array.from(d3.rollup(data3, g => d3.sum(g, r => r.Change), r => r.Province_State ))
  .map( r => ({Province_State: r[0], Change: r[1]}) )
)});
  main.variable(observer("data5")).define("data5", ["data4"], function(data4){return(
[...data4].sort( (a,b) => b.Change - a.Change)
)});
  const child1 = runtime.module(define1);
  main.import("table", child1);
  main.variable(observer()).define(["html","table","data5"], function(html,table,data5){return(
html`${table(data5)}`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## COVID Trend Based on States`
)});
  const child2 = runtime.module(define2).derive([{name: "dataChart", alias: "data"},"barHeight","format","height","margin"], main);
  main.import("chart", child2);
  main.variable(observer()).define(["chart"], function(chart){return(
chart
)});
  main.variable(observer("dataChart")).define("dataChart", ["data5"], function(data5){return(
data5.map(r => ({name: r.Province_State, value: r.Change}))
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format("+,d")
)});
  main.variable(observer("barHeight")).define("barHeight", function(){return(
20
)});
  main.variable(observer("height")).define("height", ["dataChart","barHeight","margin"], function(dataChart,barHeight,margin){return(
Math.ceil((dataChart.length + 0.1) * barHeight) + margin.top + margin.bottom
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 30, right: 60, bottom: 10, left: 60}
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Appendix`
)});
  main.variable(observer("data")).define("data", ["d3"], function(d3){return(
d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv", d3.autoType)
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  return main;
}
