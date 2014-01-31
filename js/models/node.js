var Node = function(data) {
    this.data = data || {};
    this.edges = [];
    return this;
};

Node.addEdge = function(source, target, data) {
    var edge = {source: source, target:target, data:data};
    source.edges.push(edge);
    if (source != target) {
        target.edges.push(edge);
    }
    return edge;
};

module.exports = Node;
