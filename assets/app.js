// Setting the diminsions for our chart
let svgWidth = 1060
let svgHeight = 600

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

/* Create an SVG wrapper, 
append an SVG group that will hold our chart and shift the latter by left and top margins */
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

// Append an SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Initial Params
let chosenXAxis = "poverty"
let chosenYAxis = "healthcare"

// function used for updating x-scale upon click on axis label
function xScale(peopleData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(peopleData, d => d[chosenXAxis]) * 0.8,
            d3.max(peopleData, d => d[chosenXAxis] * 1.2)
        ])
        .range([0, width])

    return xLinearScale
}

// function used for updating y-scale upon click on yaxis label
function yScale(peopleData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(peopleData, d => d[chosenYAxis]) * 0.85,
            d3.max(peopleData, d => d[chosenYAxis])
        ])
        .range([height, 0])

    return yLinearScale
}

// function used for updating xAxis upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale)

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis)

    return xAxis
}

// function used for updating yAxis upon click on axis label
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale)

    yAxis.transition()
        .duration(1000)
        .call(leftAxis)

    return yAxis
}

// function used for updating circles group with a transition to new circles
function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {
    circlesXGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesXGroup
}

// function used for updating circles group with a tranistion to new circles
function renderYCircles(circlesYGroup, newYScale, chosenYAxis) {
    circlesYGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))

    return circlesYGroup
}

// functoin used to create the labels for the circles on X axis
function renderXLabels(labelsXGroup, newXScale, chosenXAxis) {
    labelsXGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))

    return labelsXGroup
}

// fucntion used to create th elabges for the circles on Y axis
function renderYLabels(labelsYGroup, newYScale, chosenYAxis) {
    labelsYGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis] - .1))

    return labelsYGroup
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let xlabel = ""
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty"
    } else if (chosenXAxis === "income") {
        xlabel = "Income"
    } else {
        xlabel = "age"
    }

    let ylabel = ""
    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare"
    } else if (chosenYAxis === "obesity") {
        ylabel = "Obesity"
    } else {
        ylabel = "Smoking"
    }

    let toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([90, -70])
        .html(function (d) {
            return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`)
        })

    circlesGroup.call(toolTip)

    // on mouse on event
    circlesGroup.on("mouseover", function (data) {
            toolTip.show(data, this)
        })

        // on mouse out event
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this)
        })

    return circlesGroup
}

// Retrieve data from the CSV file and execute everything below
(async function () {
    let peopleData = await d3.csv("data.csv")

    // parse data
    peopleData.forEach(function (data) {
        data.poverty = +data.poverty
        data.povertyMoe = +data.povertyMoe
        data.age = +data.age
        data.ageMoe = +data.ageMoe
        data.income = +data.income
        data.incomeMoe = +data.incomeMoe
        data.healthcare = +data.healthcare
        data.healthcareLow = +data.healthcareLow
        data.healthcareHigh = +data.healthcareHigh
        data.obesity = +data.obesity
        data.obesityLow = +data.obesityLow
        data.obesityHigh = +data.obesityHigh
        data.smokes = +data.smokes
        data.smokesLow = +data.smokesLow
        data.smokesHigh = +data.smokesHigh
    })

    // xlinearScale function above csv import
    let xLinearScale = xScale(peopleData, chosenXAxis)

    // yLinearScale function above csv import
    let yLinearScale = yScale(peopleData, chosenYAxis)

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale)
    let leftAxis = d3.axisLeft(yLinearScale)

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)

    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis)

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(peopleData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 13)
        .attr("fill", "#006778")
        .attr("stroke", "#101820")
        .attr("stroke-width", 2)

    // add lables to the circles
    let circlesLabel = chartGroup.selectAll(".circleLabel")
        .data(peopleData)
        .enter()
        .append("text")
        .text(data => data.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis] - .1))
        .attr("font-size", "11px")
        .attr("fill", "#D7A22A")
        .attr("text-anchor", "middle")

    // create group for 3 x- axis labels
    let xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)

    let povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)")

    let ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)")

    let houseIncomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household income (Median)")

    // create group for 3 y - axis labels
    let ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    let healthLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "3em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)")

    let obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)")

    let smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "2em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)")

    // update Tool Tip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // test value of selection
            let value = d3.select(this).attr("value")
            if (value !== chosenXAxis) {
                //replace chosenXAxis with value
                chosenXAxis = value

                console.log(chosenXAxis)

                // functions here found above csv import
                // update x scale for new data
                xLinearScale = xScale(peopleData, chosenXAxis)

                // update x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis)

                // update cirecles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis)

                // update lables with new x values
                circlesLabel = renderXLabels(circlesLabel, xLinearScale, chosenXAxis)

                // updates toolstips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    houseIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                } else if (chosenXAxis === "income") {
                    houseIncomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                } else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    houseIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
            }
        })

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // tet value of selection
            let value = d3.select(this).attr("value")
            if (value !== chosenYAxis) {
                //replace chosenYAxis with value
                chosenYAxis = value

                console.log(chosenYAxis)

                // functions here found above csv import
                // update y scale for new data
                yLinearScale = yScale(peopleData, chosenYAxis)

                // update y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis)

                // update cirecles with new y values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis)

                // update lables with new x values
                circlesLabel = renderYLabels(circlesLabel, yLinearScale, chosenYAxis)

                // updates toolstips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                } else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                } else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
            }
        })


})()