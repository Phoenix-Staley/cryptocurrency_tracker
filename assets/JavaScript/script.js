// The dimensions of the graph
const defaultDimensions = {
    width: window.innerWidth * 0.75,
    height: window.innerHeight * 0.33,
    margins: {
        top: 15,
        right: 20,
        bottom: 20,
        left: 60,
        candleGap: 10
    }
}

function addBounds(dimensions) {
    // The dimensions of the bounds the data will display in
    dimensions.boundedWidth = dimensions.width
    - dimensions.margins.left
    - dimensions.margins.right;
    dimensions.boundedHeight = dimensions.height
    - dimensions.margins.top
    - dimensions.margins.bottom;

    return dimensions;
}

function clearGraphs() {
    document.querySelector(".graph").innerHTML = "";
}

function appendGraph(dimensions) {
    // This appends the graph as a whole
    const wrapper = d3.select(".graph")
        .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

    // This appends the bounded the data will be graphed in
    // g is the equivalent of a div element but for svg elements
    const bounds = wrapper.append("g")
            .style("transform", `translate(${
                dimensions.margins.left
            }px, ${dimensions.margins.top}px)`);
    
    return [wrapper, bounds];
}

function drawAxes(yScale, xScale, bounds, dimensions) {
    const yAxisGenerator = d3.axisLeft()
        .scale(yScale);

    const xAxisGenerator = d3.axisBottom()
        .scale(xScale);

    // Creates 2 groups and draws the x and y axes in them
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)
            .attr("class", "axis");

    const xAxis = bounds.append("g")
        .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`)
            .attr("class", "axis");
}

const parseDate = d3.timeParse("%m/%d/%Y");

// An asynchronous function that, given an array of objects, creates a line graph
async function createLineGraph(data) {
    let dimensions = defaultDimensions;
    dimensions = addBounds(dimensions);

    clearGraphs();

    // These are the functions for this function to access X and Y values
    function yAccessor(d) {
        return d["StartDay"];
    }

    function xAccessor(d) {
        return parseDate(d["Day"]);
    }

    const graph = appendGraph(dimensions);
    const wrapper = graph[0];
    const bounds = graph[1];

    // Create the scales based the data to be graphed
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor))
        .range([dimensions.boundedHeight, 0]);
    console.log(d3.extent(data, yAccessor));
    
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth]);
    
    // Draws data
    const lineGenerator = d3.line()
            .x(d => xScale(xAccessor(d)))
            .y(d => yScale(yAccessor(d)));
    const line = bounds.append("path")
            // d defines the shape to be drawn
            .attr("d", lineGenerator(data))
            .attr("fill", "none")
            .attr("stroke", "cornflowerblue")
            .attr("stroke-width", 3);

    // Draws peripherals
    drawAxes(yScale, xScale, bounds, dimensions);
}

async function createCandlestickGraph(data) {
    let dimensions = defaultDimensions;
    dimensions = addBounds(dimensions);
    dimensions.candlestickWidth = (dimensions.boundedWidth / data.length) - dimensions.margins.candleGap;
    const colors = ["#4daf4a", "#999999", "#e41a1c"];

    // Create arrays for the yOpen, yClose, and X values
    const Yo = data.map(d => {
        return d.StartDay;
    });
    const Yc = data.map(d => {
        return d.EndDay;
    });
    const X = data.map(d => {
        return parseDate(d.Day);
    });

    function getMinY(yOpens, yCloses) {
        const minOpen = d3.min(Yo);
        const minClose = d3.min(Yc);
        if (minOpen > minClose) {
            return minClose;
        } else {
            return minOpen;
        }
    }
    function getMaxY(yOpens, yCloses) {
        const maxOpen = d3.max(Yo);
        const maxClose = d3.max(Yc);
        if (maxOpen > maxClose) {
            return maxOpen;
        } else {
            return maxClose;
        }
    }

    const yMin = getMinY(Yo, Yc);
    const yMax = getMaxY(Yo, Yc);

    const yDomain = [yMin, yMax];
    const xDomain = [d3.min(X), d3.max(X)];
    const yRange1 = [dimensions.boundedHeight - dimensions.margins.bottom, 0];
    const yRange2 = [dimensions.height - dimensions.margins.bottom, 0];
    const xRange = [dimensions.margins.left, dimensions.width - dimensions.margins.right];
    
    const xScale = d3.scaleTime(xDomain, xRange);
    const yScale1 = d3.scaleLinear(yDomain, yRange1);
    const yScale2 = d3.scaleLinear(yDomain, yRange2)
    const xAxis = d3.axisBottom(xScale);
    // const yAxis = d3.axisLeft(yScale);

    clearGraphs();

    const graph = appendGraph(dimensions);
    const wrapper = graph[0];
    const bounds = graph[1];

    wrapper.append("g")
            .attr("transform", `translate(0,${dimensions.height - dimensions.margins.bottom})`)
            .attr("class", "axis")
        .call(xAxis);

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale2);

    const yAxis = wrapper.append("g")
        .call(yAxisGenerator)
            .attr("class", "axis")
            .attr("transform", `translate(${dimensions.margins.left},0)`);

    // Draw data
    const xIncrement = dimensions.boundedWidth / Object.keys(data).length;
    const leftOffset = xIncrement / 2;

    const g = bounds.append("g")
            .attr("stroke-linecap", "square")
            .attr("stroke", "black")
        .selectAll("g")
        .data(data)
        .join("g")
            .attr("transform", d => `translate(${(xIncrement * (1+data.indexOf(d))) - leftOffset},0)`);

    g.append("line")
            .attr("y1", d => {
                return yScale1(d.StartDay);
            })
            .attr("y2", d => {
                return yScale1(d.EndDay);
            })
            .attr("stroke-width", dimensions.candlestickWidth)
            .attr("stroke", d => d.StartDay > d.EndDay ? colors[2]
            : d.EndDay > d.StartDay ? colors[0]
            : colors[1]);
}

const requestUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin';
const btcHistoryUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily';
const changeGraphBtn = document.getElementById("change-graph");

function changeGraph() {
    const preferredGraph = localStorage.getItem("preferredGraph");

    if (preferredGraph === "line") {
        localStorage.setItem("preferredGraph", "candlestick");
    } else {
        localStorage.setItem("preferredGraph", "line");
    }

    location.reload();
}

function loadPage() {
    if (localStorage.getItem("preferredGraph") === null) {
        localStorage.setItem("preferredGraph", "line");
    }

    changeGraphBtn.onclick = changeGraph;

    getData(btcHistoryUrl);
    getReleases();
}


const currentValueEl = document.getElementById("current-value");
// var btcButton = document.getElementById('#')




function getData(requestUrl) {
    fetch(requestUrl)
    .then(function(requestUrl) {
        return requestUrl.json();
    }).then(function(data) {
        getBTChistory(btcHistoryUrl, data) 
        return data;
             
    })
} 

var fetchButton = document.getElementById("releases")

function getReleases() {
    fetch("https://api.github.com/repos/bitcoin/bitcoin/releases?per_page=100")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        fetchButton.textContent = JSON.stringify(data.length) + " ";
    });    
}
    
// I need to fetch current value, the start price and the end price for the day.
// run through a for loop for one month
// create an empty array of objects. 
// Each itteration create a pricepoint, high and low. Then pass this to Phoenix's function. 

function getBTChistory(btcHistoryUrl, currentPrice) {
    fetch(btcHistoryUrl)
    .then(function(btcHistoryUrl) {
        return btcHistoryUrl.json();
    }).then(function(data) {
        let arr = [];
             
        for (var i = 0; i < data.prices.length; i++) {
            if(i < data.prices.length - 1) {
                const date = moment(data.prices[i][0]).format("L");
                const nextDay = i+1;
                const coinData = {
                    Day: date, 
                    StartDay: data.prices[i][1], 
                    EndDay: data.prices[nextDay][1]
                }

                arr.push(coinData)
            }
        }
        console.log(arr)
        // console.log(currentPrice.market_data.current_price.usd)
        currentValueEl.textContent = " $" + JSON.stringify(Math.floor(arr[28].EndDay));
        if (localStorage.getItem("preferredGraph") === "candlestick") {
            createCandlestickGraph(arr);
        } else {
            createLineGraph(arr);
        }
    })
}

loadPage();