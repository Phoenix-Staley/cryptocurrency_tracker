testArray = [
    {index: 1, price: 52, open: 52, close: 53, date: "3/31/2022"},
    {index: 2, price: 51, open: 52, close: 50, date: "4/1/2022"},
    {index: 3, price: 45, open: 48, close: 44, date: "4/2/2022"},
    {index: 4, price: 48, open: 45, close: 51, date: "4/3/2022"},
    {index: 5, price: 63, open: 52, close: 63, date: "4/4/2022"},
    {index: 6, price: 59, open: 62, close: 56, date: "4/5/2022"},
    {index: 7, price: 56, open: 55, close: 57, date: "4/6/2022"},
    {index: 8, price: 66, open: 58, close: 74, date: "4/7/2022"},
    {index: 9, price: 75, open: 74, close: 76, date: "4/8/2022"}
];

async function createLineGraph(data) {
    const dimensions = {
        width: window.innerWidth * 0.66,
        height: window.innerHeight * 0.33,
        margins: {
            top: 15,
            right: 20,
            bottom: 40,
            left: 60
        }
    }

    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom;

    const parseDate = d3.timeParse("%m/%d/%Y");

    function yAccessor(dPoint) {
        return dPoint["price"];
    }

    function xAccessor(dPoint) {
        return parseDate(dPoint["date"]);
    }

    const wrapper = d3.select(".graph")
        .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

    // g is the equivalent of a div element but for svg elements
    const bounds = wrapper.append("g")
            .style("transform", `translate(${
                dimensions.margins.left
            }px, ${
                dimensions.margins.top
            }px)`);

    // Create scales
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor))
        .range([dimensions.boundedHeight, 0]);
    
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth]);
    
    // Draw data
    const lineGenerator = d3.line()
            .x(d => xScale(xAccessor(d)))
            .y(d => yScale(yAccessor(d)));
    const line = bounds.append("path")
            // d defines the shape to be drawn
            .attr("d", lineGenerator(data))
            .attr("fill", "none")
            .attr("stroke", "cornflowerblue")
            .attr("stroke-width", 3);

    // Draw peripherals
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
    console.log(data);
    const dimensions = {
        width: window.innerWidth * 0.66,
        height: window.innerHeight * 0.33,
        margins: {
            top: 15,
            right: 20,
            bottom: 40,
            left: 60,
            candleGap: 3
        }
    }

    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom;
    dimensions.candlestickWidth = (dimensions.boundedWidth / data.length) - dimensions.margins.candleGap;

    const parseDate = d3.timeParse("%m/%d/%Y");

    function yAccessor(dPoint) {
        console.log(dPoint);
        return [dPoint["open"], dPoint["close"]];
    }

    // function yAccessorOpen(dPoint) {
    //     console.log(dPoint);
    //     return dPoint["open"];
    // }

    // function yAccessorClose(dPoint) {
    //     return dPoint["close"];
    // }

    function xAccessor(dPoint) {
        return parseDate(dPoint["date"]);
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
        
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth]);

    // Draw data

    const colors = ["#4daf4a", "#999999", "#e41a1c"];

    const xIncrement = dimensions.boundedWidth / Object.keys(data).length;
    console.log(xIncrement);

    const g = bounds.append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
        .selectAll("g")
        .data(data)
        .join("g")
            .attr("transform", d => `translate(${xIncrement * (1+data.indexOf(d))},0)`);

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