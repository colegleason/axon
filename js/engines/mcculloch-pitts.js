var _ = require('underscore');

var Node = require('../models/node');

Node.prototype.updateInput = function() {
    var node = this;
    node.data.net_input = _.chain(node.edges)
        .filter(function(e) { return e.target == node;})
        .reduce(function(sum, e) {
            return sum + e.data.weight * e.source.data.activation;
        }, 0)
        .value();
};

Node.prototype.updateActivation = function() {
    var threshold = this.data.threshold || 0;
    var input = this.data.net_input || 0;
    this.data.activation = (input > threshold) ? 1 : 0;
};

Node.prototype.active = function() {
    return this.data.activation;
};

var Activator = function() {
    this.data = {activation: 1};
    this.edges = [];
    return this;
};

module.exports.Neuron = Node;
module.exports.Activator = Activator;
