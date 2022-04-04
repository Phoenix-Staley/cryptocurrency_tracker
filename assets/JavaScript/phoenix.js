testArray = [
    {time: 1, price: 5},
    {time: 2, price: 4},
    {time: 3, price: 6},
    {time: 4, price: 5},
    {time: 5, price: 7}
];

async function createLineGraph(data) {
    console.log(data);

    // function getMinMax(data) {
    //     
    //     return [min, max];
    // }
    // const minMax = getMinMax(data);

    const dimensions = {
        width: window.innerWidth * 0.66,
        height: window.innerHeight * 0.33,
        margins: {
            top: 15,
            right: 15,
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

    function yAccessor(dPoint) {
        return dPoint["price"];
    }

    function xAccessor(dPoint) {
        return dPoint["time"];
    }

    // Create scales

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

    const lineGenerator = d3.line()
            .x(d => xScale(xAccessor(d)))
            .y(d => yScale(yAccessor(d)));
    const line = bounds.append("path")
            // d defines the shape to be drawn
            .attr("d", lineGenerator(data))
            .attr("fill", "none")
            .attr("stroke", "cornflowerblue")
            .attr("stroke-width", 3);

    // const yScale = d3.scaleLinear()
    //     .domain([minMax[0], minxMax[1]])
    //     .range([dimensions.boundedHeight, 0]);

    // let line = d3.svg.line()
    //     .x(function(d) {return d.date})
    //     .y(function(d) {return d.price})
    //     .interpolate("linear");

    // let svg = d3.select(".graph")
    //     .append("svg")
    //     .attr({
    //         "width": width,
    //         "height": height
    //     });
    
    // let path = svg.append("path")
    //     .attr({
    //         d:line(data),
    //         "fill":"none",
    //         "stroke":"blue"
    //     });
}

createLineGraph(testArray);