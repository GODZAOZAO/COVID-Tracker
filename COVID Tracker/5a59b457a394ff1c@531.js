// https://observablehq.com/@tmcw/tables@531
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["regional-global-daily-latest@2.csv",new URL("./files/f2f433b74e1ba71953b0bc86696cbfa831e2299bc477730343aa045c9e1072127384ea2c7014fa10b62dd65d84aee7b93ab0e283ef9693776f522be3a952fca1",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md","opinionPolls"], function(md,opinionPolls){return(
md`# Tables

_This notebook is ready for public input - hit me up at @tmcw on [the forum](https://talk.observablehq.com/t/it-would-be-cool-if-table-tags-had-a-spiffy-default-style/588/4), twitter, or elsewhere to give input. You can use it, but the API is likely to change soon, so use this exact version:_

\`\`\`js
import {table} from "@tmcw/tables@513"
\`\`\`

Good tables are good. Making a good table relies on good defaults, good options, and lots of nitpicky finishing touches. This is a notebook that tries to provide a good starting point for table defaults, a fast drop-in read-only data table for data analysis.

### Table API:

- **data** \`Array<Object>\`: with consistent data types across rows
- **options**:
  - **style**: \`enum(normal, compact)\`: a string value of a default style. By default, tables are designed for comfortable reading with large fonts. To display more information in less screen space, use compact.
  - **header** \`boolean\` (default true): set to false to entirely omit the table header.
  - **sortable** \`boolean\` (default false): make columns sortable
  - **paged** \`number\` (default 25): split data by pages, if it has more than the given number of items. Set to a falsey-value (zero, null, undefined) to turn off paging.
  - **rank** \`boolean\` (default false): show 1… rank numbers in the first column. Cannot be combined with sortable.
  - **columns** \`Object\`: column-specific configuration, indexed by key:
    - \`[key]\`
      - **formatter** \`Function(value, rowIndex, row) ⇒ output\`: value formatter for cells. This can return a string, number, or element. If it returns a \`<td>\` element, that element can ‘take over’ the cell.
      - **title** \`string\`: alternate text for table header - by default, the header cell is named after the key in the data object
      - **type** \`string\`: override auto-detected type for this column - display numbers as strings, etc. Optional, should be one of 'string' or 'number'.

An example of a dataset that table() easily accepts:

\`\`\`json
${JSON.stringify(opinionPolls.slice(0, 2), null, 2)}
\`\`\`
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
<br /><br />

*Click the caret on the left to view code for any example.*


### Titanic survivors

This is a table of the Titanic survivors dataset - it shows the data in natural order, first, but the columns are sortable. It shows usage of custom formatters for the Name and Fare columns. The Fare column formatter uses the rowIndex to determine the appropriate format based on the row number. (i.e. $ for the first row only).`
)});
  main.variable(observer()).define(["table","titanicData","d3","html"], function(table,titanicData,d3,html){return(
table(titanicData, {
  sortable: true,
  columns: {
    Fare: {
      formatter(val, i) {
        // A formatter that changes its behavior based on the row index,
        // so we don’t repeat the $ for every row.
        return i === 0 ? d3.format('$.2f')(val) :  d3.format('.2f')(val);
      }
    },
    Name: {
      formatter(val) {
        // Formatters can also return HTML values! Here’s
        // one that highlights first names.
        let parts = val.match(/([^,]*)\,(.*)/);
        return html`<strong>${parts[1]}</strong>, ${parts[2]}`;
      }
    }
  }
})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`<br /><br />

### Spotify top charts

This is a table of the top-streamed tracks from [Spotify](https://spotifycharts.com/regional) today. It shows usage of a custom formatter, as well as the \`rank\` option to add an unlabeled rank column. This also sets the \`style\` to compact because we’re displaying a bunch of rows.`
)});
  main.variable(observer()).define(["table","spotify","html","d3"], function(table,spotify,html,d3){return(
table(spotify, {
  rank: true,
  style: 'compact',
  columns: {
    Track: {
      formatter(val, i) {
        return html`<strong>${val[0]}</strong> by ${val[1]}`;
      }
    },
    Streams: {
      formatter: d3.format(',')
    }
  }
})
)});
  main.variable(observer("MAX_PAGE_LINKS")).define("MAX_PAGE_LINKS", function(){return(
20
)});
  main.variable(observer("table")).define("table", ["defaultOptions","html","th","identity"], function(defaultOptions,html,th,identity){return(
(data, options) => {
  options = Object.assign({}, defaultOptions, options);
  const { sortable, rank, paged } = options;
  let sortKey = undefined;
  let sortDirection = true;
  let page = 0;
  if (sortable && rank) {
    throw new Error("A table can either be ranked or sortable, but not both");
  }
  let columns = Object.keys(data[0]).map(key => {
    const opts = options.columns[key] || {};
    return {
      key: key,
      type: opts.type || typeof data[0][key],
      options: opts
    };
  });

  function bake() {
    if (sortKey) {
      data = data.slice().sort((a, b) => {
        let as = a[sortKey];
        let bs = b[sortKey];
        // make this sort stable
        if (as == bs) return JSON.stringify(a).localeCompare(JSON.stringify(b));
        let res = as > bs ? 1 : as < bs ? -1 : 0;
        if (sortDirection) res = -res;
        return res;
      });
    }
    let offset = page * paged;
    let rows = data.slice(offset, offset + (paged || data.length));
    let pages = paged ? Math.ceil(data.length / paged) : 1;
    return html`<div><div>
      <style>
.pretty-pager {
  padding-top: 1rem;
}
.pretty-pager button {
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid #fff;
  font-size: inherit;
}
.pretty-pager button:hover {
  border: 1px solid #888;
}
.pretty-table.normal {
  font-size: 15px;
}
.pretty-table.normal th,
.pretty-table.normal td {
  padding: 3px 2px;
}
.pretty-table th,
.pretty-table td {
  vertical-align: top;
}
.pretty-table thead th {
  text-transform: uppercase;
  font-weight:500;
}
.pretty-table thead th.column-type-number string {
  order: 1;
}
.pretty-table th.sortable {
  cursor: pointer;
}
.pretty-table thead th.column-type-number,
.pretty-table tbody td.cell-type-number,
.pretty-table tbody td.cell-rank {
  text-align:right;
}
.pretty-table tbody td.cell-type-number,
.pretty-table tbody td.cell-rank {
  font-family: menlo,consolas,monaco,monospace;
  font-size: 90%;
}
.pretty-table tbody td.cell-rank {
  padding-right: 1em;
  color: #666;
}

</style>
        <table class='pretty-table ${options.style}'>
          ${
            options.header === false
              ? ``
              : html`<thead>
            ${rank ? html`<th></th>` : ""}
            ${columns.map(c => {
              return th(c, sortKey, sortDirection, sortable);
            })}
          </thead>`
          }
          <tbody>
            ${rows.map(
              (row, i) => html`<tr>
              ${rank ? html`<td class='cell-rank'>${offset + i + 1}</td>` : ""}
              ${columns.map(c => {
                let displayValue = (c.options.formatter || identity)(
                  row[c.key],
                  i,
                  row
                );
                if (
                  displayValue instanceof window.HTMLElement &&
                  displayValue.tagName == "TD"
                ) {
                  return displayValue;
                }
                return html`<td class='cell-type-${c.type}'>${displayValue}</td>`;
              })}
            </tr>`
            )}
          </tbody>
        </table>
        ${
          pages > 1
            ? html`<div class='pretty-pager'>
          <button data-action="previous">Previous</button>
          ${Array.from({ length: pages }).map(
            (_, i) => html`<button data-page="${i}">${i + 1}</button>`
          )}
          <button data-action="next">Next</button>
        </div>`
            : ""
        }
      </div></div>`;
  }

  let dom = bake();

  function rerender() {
    dom.firstChild.remove();
    dom.appendChild(bake().firstChild);
  }

  dom.addEventListener("click", e => {
    if (e.target.tagName === "TH" && sortable) {
      if (sortKey == e.target.dataset.key) {
        sortDirection = !sortDirection;
      }
      sortKey = e.target.dataset.key;
      rerender();
    }
    if (e.target.tagName === "BUTTON") {
      if (e.target.dataset.action) {
        switch (e.target.dataset.action) {
          case "next":
            page++, rerender();
            break;
          case "previous":
            page--, rerender();
            break;
        }
      } else if (e.target.dataset.page) {
        (page = parseInt(e.target.dataset.page)), rerender();
      }
    }
  });

  return dom;
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`<br /><br />

### Kenya data

Demonstration of [data from Quartz Atlas](https://www.theatlas.com/charts/BJGldhdsG): demonstrates usage of the _type_ override, a custom formatter, and overriding titles.`
)});
  main.variable(observer()).define(["table","kenyaData","html","d3"], function(table,kenyaData,html,d3){return(
table(kenyaData, {
  columns: {
    method: {
      title: ''
    },
    percent: {
      title: 'Method of transfer (2006)',
      type: 'string',
      formatter(val, i) {
        return html`<div style='display:flex;align-items:center;height:1.5em;'>
          <div style='width:${val}%;height:1em;background:#5f27cd;margin-right:0.5em;'></div>${i == 0 ? d3.format('.0%')(val / 100) : val}
        </div>`;
      }
    }
  }
})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`<br /><br />

### Heat-tables

A tribute to the [538](https://fivethirtyeight.com/features/the-year-in-trumps-approval-rating/) table style for opinion polls. Demonstrates that if a cell formatter returns a \`<td>\` element, it can take over the entire cell to do things like setting background colors.

This also demonstrates using a table with viewof: click a name to view the person below.
`
)});
  main.variable(observer("viewof name")).define("viewof name", ["table","opinionPolls","html","d3"], function(table,opinionPolls,html,d3)
{
  
  let t = table(opinionPolls, {
    columns: {
      name: {
        formatter(value, i, row) {
          let elem = html`<a style='cursor:pointer'>${value}</a>`;
          elem.addEventListener('click', () => {
            t.value = row;
            t.dispatchEvent(new CustomEvent('input'));
          });
          return elem;
        }
      },
      elected: {
        type: 'string'
      },
      approval: {
        formatter(val, i) {
          let color = d3.scaleLinear()
            .domain([-2, 0, 2])
            .range(["#f4c8cf", "#f8f8f8", "#c8f4cb"]);
          return html`<td style='background:${color(val)};text-align:right;padding:2px 5px;'>${val}</td>`;
        }
      }
    }
  });
  
  return t;
}
);
  main.variable(observer("name")).define("name", ["Generators", "viewof name"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`<br /><br />

### Very long Table

A simple test for very long tables. Use *MAX_PAGE_LINKS* to change the max number of links to show
`
)});
  main.variable(observer()).define(["table","dataLong"], function(table,dataLong){return(
table(dataLong)
)});
  main.variable(observer()).define(["name","md"], function(name,md){return(
name && md`## ${name.name}

I was elected ${name.elected} and have an approval rating of ${name.approval}.`
)});
  main.variable(observer("th")).define("th", ["html"], function(html){return(
(c, sortKey, sortDirection, sortable) => {
  let {
    options: { title }
  } = c;
  let sortIndicator = sortKey && sortDirection ? "↑" : "↓";
  let arrow = html`<span style='${
    sortKey === c.key ? "" : "visibility:hidden"
  }'>${sortIndicator}</span>`;
  let displayedTitle = title !== undefined ? title : c.key;
  return c.type === "number"
    ? html`<th
      data-key="${c.key}"
      class='column-type-${c.type} ${sortable ? "sortable" : ""}'>
        ${arrow}${displayedTitle}
    </th>`
    : html`<th
      data-key="${c.key}"
      class='column-type-${c.type} ${sortable ? "sortable" : ""}'>
        ${displayedTitle}${arrow}
    </th>`;
}
)});
  main.variable(observer("style")).define("style", function(){return(
`

`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Here's [my are.na collection](https://www.are.na/tom-macwright/good-looking-tables) of inspirations. My key observations:

- ✔ Numeric columns should really have monospaced numbers: it’s important for numbers to line up
- ✔ Most data tables use title-case, bold or semibold headers

Necessary perks:

- Good support for N/A values
- code-based reordering for columns

Stretch goals:

- ✔️ Sorting
- Selecting of rows

I don’t see any of the following in the wild:

- Vertical borders
- Alternate row coloring`
)});
  main.variable(observer("defaultOptions")).define("defaultOptions", function(){return(
{ columns: {}, style: 'normal', paged: 25 }
)});
  main.variable(observer("identity")).define("identity", function(){return(
i => i
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Helpers (not used in export path)`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Datasets`
)});
  main.variable(observer("spotifyCharts")).define("spotifyCharts", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.csv(
  await FileAttachment("regional-global-daily-latest@2.csv").url()
)
)});
  main.variable(observer("spotify")).define("spotify", ["spotifyCharts"], function(spotifyCharts){return(
spotifyCharts.map(row => {
  return {
    Track: [row['Track Name'], row['Artist']],
    Streams: +row.Streams
  };
})
)});
  main.variable(observer("kenyaData")).define("kenyaData", function(){return(
[
  { method: "Hand", percent: 58 },
  { method: "Bus", percent: 27 },
  { method: "Post office, money order", percent: 24 },
  { method: "Direct deposit", percent: 11 },
  { method: "Money transfer services", percent: 9 },
  { method: "Cheque", percent: 4 },
  { method: "Someone else's account", percent: 3 }
]
)});
  main.variable(observer("opinionPolls")).define("opinionPolls", function(){return(
['Barney', 'Homer', 'Bart', 'Lisa', 'Marge'].map((name, i) => ({ name, elected: 1990 + i * 5, approval: i - 2 }))
)});
  main.variable(observer("titanicData")).define("titanicData", ["d3"], function(d3){return(
d3.csvParse(`PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Ticket,Fare,Cabin,Embarked
1,0,3,"Braund, Mr. Owen Harris",male,22,1,0,A/5 21171,7.25,,S
2,1,1,"Cumings, Mrs. John Bradley (Florence Briggs Thayer)",female,38,1,0,PC 17599,71.2833,C85,C
3,1,3,"Heikkinen, Miss. Laina",female,26,0,0,STON/O2. 3101282,7.925,,S
4,1,1,"Futrelle, Mrs. Jacques Heath (Lily May Peel)",female,35,1,0,113803,53.1,C123,S
5,0,3,"Allen, Mr. William Henry",male,35,0,0,373450,8.05,,S
6,0,3,"Moran, Mr. James",male,,0,0,330877,8.4583,,Q
7,0,1,"McCarthy, Mr. Timothy J",male,54,0,0,17463,51.8625,E46,S
8,0,3,"Palsson, Master. Gosta Leonard",male,2,3,1,349909,21.075,,S`).map(({ Age, Name, Fare }) => ({
  Name,
  Age: +Age,
  Fare: +Fare
}))
)});
  main.variable(observer("dataLong")).define("dataLong", function(){return(
Array.from({length: 3000}).map(d => ({a: Math.random()}))
)});
  return main;
}
