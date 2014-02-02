var MP =  require('./engines/mcculloch-pitts');
var Node = MP.Neuron;
var Activator = MP.Activator;

var _ = require('underscore');
var selectedNode = null;

var tool = "cursor";
window.changeTool = function(newTool) {
    switch (newTool) {
        case "cursor":
        case "activator":
        tool = newTool;
        break;
        default:
        tool = "cursor";
    }
    cursor.attr("class", tool);
};

var width = 600,
    height = 900;

var svg = d3.select("#main").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height )
        .attr("preserveAspectRatio", "xMidYMid meet")
        .on("mousemove", mousemove)
        .on("click", clickBackground);

// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var nodes = [],
    links = [],
    activators = [],
    gnode = svg.selectAll("g.gnode"),
    node = svg.selectAll("circle.node"),
    link = svg.selectAll(".link"),
    label = svg.selectAll(".label"),
    activator = svg.selectAll("pulsar");

var cursor = svg.append("circle")
    .attr("r", 30)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor");


function mousemove() {
    cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
}

function clickBackground() {
    if (d3.event.defaultPrevented) return; // ignore drag
    var point = d3.mouse(this);
    if (tool == 'cursor') {
        var newNode = new Node();
        newNode.x = point[0], newNode.y = point[1];
        nodes.push(newNode);
    } else if (tool == 'activator') {
        var newActivator = new Activator();
        newActivator.x = point[0], newActivator.y = point[1];
        activators.push(newActivator);
    }
    restart();
}

function dragstart(d, i) {
    cursor.attr('class', 'blank-cursor');
}

function dragmove(d, i) {
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    tick();
}

function dragend(d, i) {
    cursor.attr('class', tool);
}

function tick(cb) {
    link.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy)*3;
        return "M" +
            d.source.x + "," +
            d.source.y + "A" +
            dr + "," + dr + " 0 0,1 " +
            d.target.x + "," +
            d.target.y;
    });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .classed("active", function(d) { return d.active();});

    label.attr('x', function(d) { return d.x + 10; })
        .attr('y', function(d) { return d.y + 10; });

    activator
        .attr('x', function(d) { return d.x;})
        .attr('y', function(d) { return d.y;});

    if (cb) cb();
}

function clickNode(d) {
    if (d3.event.defaultPrevented) return; // ignore drag
    d3.event.stopPropagation(); // don't also click background
    if (tool == 'activator') {
        if (!d.data.activation) d.data.activation = 1;
        restart();
    } else if (tool == 'cursor') {
        if (!selectedNode) {
            selectedNode = {d:d, elem:this};
            d3.select(this).classed('selected', true);
        } else {
            if (d != selectedNode.d) {
                links.push(Node.addEdge(selectedNode.d, d, {weight: 1}));
            }
            d3.select(selectedNode.elem).classed('selected', false);
            selectedNode = null;
            restart();
        }
    }
}

function restart() {
    var node_drag = d3.behavior.drag()
            .on("dragstart", dragstart)
            .on("drag", dragmove)
            .on("dragend", dragend);

    gnode = gnode.data(nodes)
        .enter()
        .append("g")
        .classed("gnode", true);

    gnode.append("circle")
        .classed("node", true)
        .attr("r", 8)
        .call(node_drag)
        .on("click", clickNode);

    gnode.append("text")
        .style("fill", "black")
        .classed('label', true)
        .text(function(d, i) { return d.name || i; });

    activator = activator
        .data(activators)
        .enter()
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .classed('pulsar', true)
        .call(node_drag)
        .on("click", clickNode);

    link = link.data(links);
    link.enter()
        .insert('svg:path', '.gnode')
        .attr("marker-end", "url(#end)")
        .classed("link", true);

    node = svg.selectAll('.node');
    label = svg.selectAll('.label');
    activator = svg.selectAll('.pulsar');
}

window.updateNodes = function() {
    setTimeout(function() {
        _.each(nodes, function(n) {
            n.updateInput();
        });
        _.each(nodes, function(n) {
            n.updateActivation();
        });
        tick();
        window.updateNodes();
    }, 1000);
}

restart();
(function ui() {
    setTimeout(tick.bind(null, ui), 100);
})();
