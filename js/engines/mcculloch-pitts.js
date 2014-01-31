var _ = require('underscore');

var Node = require('../models/node');

Node.prototype.update = function() {
    this.activation = _.chain(this.edges)
        .filter(function(e) { return e.target == this;})
        .reduce(function(sum, e) {
            return sum + e.data.weight * e.source.data.activation;
        }, 0)
        .value();
};

Node.prototype.active = function() {
    var threshold = this.data.threshold || 0;
    var activation = this.data.activation || 0;
    return activation > threshold;
};

module.exports.Neuron = Node;
