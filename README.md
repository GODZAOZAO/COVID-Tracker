# Covid Tracker
A viualization tool tracking the number of the latest COIVD-19 cases as well as the trend of COVID-19 in each states in U.S.

https://observablehq.com/d/1c5467f1ff0a5bdd@611

## Getting Started
View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@4
npm install https://api.observablehq.com/d/1c5467f1ff0a5bdd@611.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "1c5467f1ff0a5bdd";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~

## Key Features
* Track COVID-19 cases in each state. Allows users to get an overview of COVID-19 trends.
* Daily update of the total number of COVID-19 cases in the United States.

## Results
<p align="center">
  <img width="80%" height="500" src="https://github.com/GODZAOZAO/COVID-Tracker/blob/main/covid_chart.png"><br/><br/><br/><br/>
  <img width="50%" height="500" src="https://github.com/GODZAOZAO/COVID-Tracker/blob/main/covid_state.png">
</p>

