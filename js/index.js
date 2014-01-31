var Node = require('./engines/mcculloch-pitts').Neuron;
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
    console.log(tool);
    cursor.attr("class", tool);
};

var width = 600,
    height = 900;

var force = d3.layout.force()
        .size([width, height])
        .nodes([]) // initialize with a single node
        .charge(0)
        .gravity(0)
        .linkDistance(function(d) {
            var x = d.source.x - d.target.x;
            var y = d.source.y - d.target.y;
            return Math.sqrt(x*x + y*y);
        })
        .on("tick", tick);

var svg = d3.select("#main").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height )
        .attr("preserveAspectRatio", "xMidYMid meet")
        .on("mousemove", mousemove)
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
    if (d3.event.defaultPrevented) return; // ignore drag
    var point = d3.mouse(this),
        node = new Node();

    node.x = point[0], node.y = point[1];

    nodes.push(node);
    restart();
}

function dragstart(d, i) {
    force.stop(); // stops the force auto positioning before you start dragging
    cursor.attr('class', 'blank-cursor');
}

function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    // if (d.x > width) { d.x = width; d.px = width; }
    // if (d.x < 0) { d.x = 0; d.px = 0; }
    // if (d.y > height) { d.y = height; d.py = height; }
    // if (d.y < 0) { d.y = 0; d.py = 0; }
    tick(); // this is the key to make it work together with updating both px,py,x,y on d !
}

function dragend(d, i) {
    cursor.attr('class', tool);
    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    tick();
    force.resume();
}

function tick() {
    //_.each(nodes, function(node) { node.update();});

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .classed("active", function(d) { return d.active();});

    label.attr('x', function(d) { return d.x + 10; })
        .attr('y', function(d) { return d.y + 10; });
}

function clickNode(d) {
    if (d3.event.defaultPrevented) return; // ignore drag
    d3.event.stopPropagation();
    if (tool == 'activator') {
        d.data.activation = 1;
    } else if (tool == 'cursor') {
        if (!selectedNode) {
            selectedNode = d;
            node.filter(function(elem) { return elem == d;}).style("fill", "red");
        } else {
            if (d != selectedNode) {
                links.push(Node.addEdge(selectedNode, d, {weight: 30}));
            }
            node.filter(function(elem) { return elem == selectedNode;}).style("fill", null);
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
