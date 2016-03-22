
/* Set the margins and widths as global variables to be referenced as needed */
var margin = {top: 20, right: 60, bottom: 30, left: 50},
    width = 920 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* Set the x scale as "linear" (as opposed to time or ordinal) */
/* And apply it to the available space we've reserved */
/* The range is a pixel value => the amount of space we'll use for our x axis */
var x = d3.scale.linear()
    .range([0, width]);

/* Do the same with the y scale, mapped to the available height */
var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    .domain(['< 10%','10-20%','> 20%'])
    .range(['#fa9fb5','#dd3497','#7a0177']);

/* Axis are automated in D3, so you don't have to draw and place numbers and hash marks */
/* We call the svg.axis() function and pass the scales as arguments. */
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function(d){
        return d+"%"
    });

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


/* This is where we draw our svg canvas. SVG is a markup element, so we just append it to our target div */
/* In this case, it's a div called .chart */
/* We use the margins and transforms to draw a smaller canvas inside of the target div and to center it appropriately */
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




/* This is an ajax call to load our tsv-formatted data */
d3.tsv("data/sat.tsv", function(error, data) {

  /* Since we're using tsv, all values are automatically strings. */
  /* So we loop through the data and cast our charting values as numbers */
  /* D3 lets us do that with `+` signs. */
  data.forEach(function(d) {
    d.state = d["State"];
    d.tested = +d["Tested"];
    d.score = +d["Score"];
    d.waiver = d["Waiver"];
  });


  /* We want to assign domains to our x and y scales. */
  /* Domains are the lowest and highest possible values in the data set. */
  /* We find these values by checking a nested property from each object in the array using `d3.extent()` */
  x.domain([0, 100]);
  y.domain(d3.extent(data, function(d) { return d.score; })).nice();


  var tooltip = d3.select("#tooltip");


  svg.append("g")
      .attr("class", "x axis")
      // Translate is an SVG property that helps us move the X axis below the chart.
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width) // width represents the farthest point right on our chart
      .attr("y", -6)
      .style("text-anchor", "end") // Anchoring the text to the end lets us flow it left from that end point.
      .text("Student participation rate");

  //Append the y axis to the chart.
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)") // Rotate is another SVG property.
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Average SAT score")

      // SELECT
      // First we select the elements we're going to create.
      // That may sound a little weird since these elements don't exist yet,
      // but just hang with it.
      var dots = svg.selectAll(".dot")

      // JOIN
      // Now we join our data to those elements. This creates a one-to-one relationship
      // between each data point and element that represents it, in this case a dot!
            .data(data);

      // ENTER
      // This is where d3 is amazing. It knows to check the page, and if there are more data points
      // than elements representing them, it adds them to the page.
      dots.enter()
            .append("circle")
            // Here on out, we're just adding properties to the elements we just created.
            .attr("class", "dot");

      // Update
      dots
        .attr("r", 5)
        .attr("cx",function(d){ return x(d.tested); })
        .attr("cy",function(d){ return y(d.score); })
        .style("stroke","white")
        .style("stroke-width","1px")
        .style("fill", function(d){
            return color(d.waiver);
        })
        .on("mouseover",function(d){

            tooltip
                .style("left", (d3.event.pageX + 10 ) + "px")
                .style("top" , (d3.event.pageY - 30 - document.body.scrollTop ) + "px");
            tooltip.classed("hidden",false);

            tooltip.select("p")
                .text(d.state);
        })
        .on("mouseout", function(d){
            tooltip.classed("hidden",true);
        });


        // Add a legend to the chart
        var keys = d3.select("#key-table").selectAll(".key")
            .data(color.domain()) // color.domain() just gives us an array of the color data values
            .enter()
            .append("div") // Appends one div for each color value in the array above.
            .attr("class","key")
            // You can also add straight HTML to an elements if you
            // need to cudgel your way through a problem like these keys!
            // I'm just inlining the html font-awesome circle
            // icon, and adding the color as an inline style attribute.
            // Not the most elegant way, but important to know you can do!
            .html(function(d){
                return "<i class='fa fa-circle' style='color:"
                +color(d)+
                ";'></i>"+d;});


});
