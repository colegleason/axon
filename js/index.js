var Node = require('./engines/mcculloch-pitts').Neuron;
var _ = require('underscore');

var source;


var width = 960,
    height = 500;

var fill = d3.scale.category20();

var force = d3.layout.force()
    .size([width, height])
    .nodes([new Node()]) // initialize with a single node
    .linkDistance(function(d) { return d.data.weight; })
    .charge(-60)
    .on("tick", tick);

var svg = d3.select("#main").append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", mousemove);


svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "white")
    .on("click", clickBackground);

var nodes = force.nodes(),
    links = force.links(),
    gnode = svg.selectAll("g.gnode"),
    node = svg.selectAll("circle.node"),
    link = svg.selectAll(".link"),
    label = svg.selectAll(".label");

var cursor = svg.append("circle")
    .attr("r", 30)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor");

restart();

function mousemove() {
    cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
}

function clickBackground() {
    var point = d3.mouse(this),
        node = new Node();

    node.x = point[0], node.y = point[1];

    nodes.push(node);
    restart();
}

function tick() {
    _.each(nodes, function(node) { node.update();});

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { console.log(d); return d.x; })
        .attr("cy", function(d) { return d.y; })
        .classed("active", function(d) { return d.active();});

    label.attr('x', function(d) { return d.x + 10; })
        .attr('y', function(d) { return d.y + 10; });
}

function clickNode(d) {
    if (!source) {
        source = d;
        node.filter(function(elem) { return elem == d;}).style("fill", "red");
    } else {
        node.filter(function(elem) { return elem == source;}).style("fill", null);
        links.push(Node.addEdge(source, d, {weight: 30}));
        source = undefined;
        restart();
    }
}

function restart() {
    gnode = gnode.data(nodes)
        .enter()
        .append("g")
        .classed("gnode", true);

    gnode.append("circle")
        .classed("node", true)
        .attr("r", 8)
        .call(force.drag)
        .on("click", clickNode);

    node = svg.selectAll('.node');

    gnode.append("text")
        .style("fill", "black")
        .classed('label', true)
        .text(function(d) { return d.data.activation || 0;});

    label = svg.selectAll('.label');

    link = link.data(links);

    link.enter()
        .insert("line", ".gnode")
        .classed("link", true);

    force.start();
}
