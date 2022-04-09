// Creates moment objects for the test data
Day1 = moment("3/31/2022", "MM/DD/YYYY");
Days = [Day1];
for (let i=0; i < 9; i++) {
    Days.push(moment(`4/${i+1}/2022`, "MM/DD/YYYY"));
}

testArray = [
    {index: 1, price: 52, open: 52, close: 53, Day: Days[0]},
    {index: 2, price: 51, open: 52, close: 50, Day: Days[1]},
    {index: 3, price: 45, open: 48, close: 44, Day: Days[2]},
    {index: 4, price: 48, open: 45, close: 51, Day: Days[3]},
    {index: 5, price: 63, open: 52, close: 63, Day: Days[4]},
    {index: 6, price: 59, open: 62, close: 56, Day: Days[5]},
    {index: 7, price: 56, open: 55, close: 57, Day: Days[6]},
    {index: 8, price: 66, open: 58, close: 74, Day: Days[7]},
    {index: 9, price: 75, open: 74, close: 76, Day: Days[8]}
];

// An asynchronous function that, given an array of objects, creates a line graph
async function createLineGraph(data) {
    // The dimensions of the graph
    const dimensions = {
        width: window.innerWidth * 0.75,
        height: window.innerHeight * 0.33,
        margins: {
            top: 15,
            right: 20,
            bottom: 40,
            left: 60
        }
    }

    // The dimensions of the bounds the data will display in
    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom;

    // const parseDate = d3.timeParse("%m/%d/%Y");

    // These are the functions for this function to access X and Y values
    function yAccessor(d) {
        return d["price"];
    }

    function xAccessor(d) {
        return d["Day"];
    }

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
            }px, ${
                dimensions.margins.top
            }px)`);

    // Create the scales based the data to be graphed
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor))
        .range([dimensions.boundedHeight, 0]);
    
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



async function createCandlestickGraph(data) {
    const dimensions = {
        width: window.innerWidth * 0.75,
        height: window.innerHeight * 0.33,
        margins: {
            top: 15,
            right: 20,
            bottom: 40,
            left: 60,
            candleGap: 10
        }
    }

    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom;
    dimensions.candlestickWidth = (dimensions.boundedWidth / data.length) - dimensions.margins.candleGap;

    // const parseDate = d3.timeParse("%m/%d/%Y");

    function yAccessor(d) {
        return [d["open"], d["close"]];
    }

    // function yAccessorOpen(dPoint) {
    //     console.log(dPoint);
    //     return dPoint["open"];
    // }

    // function yAccessorClose(dPoint) {
    //     return dPoint["close"];
    // }

    function xAccessor(d) {
        return d["Day"];
    }



    const wrapper = d3.select(".graph")
        .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

    const bounds = wrapper.append("g")
            .style("transform", `translate(${
                dimensions.margins.left
            }px, ${
                dimensions.margins.top
            }px)`);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor))
        .range([dimensions.boundedHeight, 0]);
    // console.log(d3.max(data));
        
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth]);

    // Draw data

    const colors = ["#4daf4a", "#999999", "#e41a1c"];

    const xIncrement = dimensions.boundedWidth / Object.keys(data).length;
    const leftOffset = xIncrement / 2;

    const g = bounds.append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
        .selectAll("g")
        .data(data)
        .join("g")
            .attr("transform", d => `translate(${(xIncrement * (1+data.indexOf(d))) - leftOffset},0)`);

    // g.append("line")
    //     .attr("y1", d => yScale(yAccessor[]))
    //     .attr("y2", d => y(d.high));

    g.append("line")
        .attr("y1", d => yAccessor(d)[0])
        .attr("y2", d => yAccessor(d)[1])
        .attr("stroke-width", dimensions.candlestickWidth)
        .attr("stroke", d => d.open > d.close ? colors[0]
            : d.close > d.open ? colors[2]
            : colors[1]);

    // Yo = y-open; Yc = y-close; .attr("stroke") is assigning the color based on if it's positive, negative, or no change
    // bounds.append("line")
    //   .attr("y1", d => yScale(yAccessor(d)[0]))
    //   .attr("y2", d => yScale(yAccessor(d)[1]))
    //   .attr("stroke-width", xScale.bandwidth())
    //   .attr("stroke", d => yAccessor(d)[0] > yAccessor(d)[1] ? colors[0]
    //     : yAccessor(d)[0] < yAccessorOpen(d)[1] ? colors[2]
    //     : colors[1]);

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

createLineGraph(testArray);
createCandlestickGraph(testArray);