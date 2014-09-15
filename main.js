(function() {
"use strict";

var galaxy = require("galaxy");

function GalaxyQueue() {
	this.objects = [];
	this.callbacks = [];
}

GalaxyQueue.prototype.length = function () {
	return this.objects.length;
};

GalaxyQueue.prototype.enqueue = function (object, cb) {
	if (this.callbacks.length > 0) {
		var callback = this.callbacks.shift();
		callback(null, object);
	} else {
		this.objects.push(object);
	}

	if (cb) {
		cb(null, null);
	}
}

GalaxyQueue.prototype.dequeue = function (callback) {
	if (this.objects.length > 0) {
		var object = this.objects.shift();
		callback(null, object);
	} else {
		this.callbacks.push(callback);
	}
}

GalaxyQueue.prototype.enqueueAsync = galaxy.star(GalaxyQueue.prototype.enqueue);
GalaxyQueue.prototype.dequeueAsync = galaxy.star(GalaxyQueue.prototype.dequeue);

if (module.parent) {
	module.exports = GalaxyQueue;
	return;
}

var timeout = galaxy.star(function(timeout, cb) {
	setTimeout(function() {
		cb(null, null);
	}, timeout);
});

var queue = new GalaxyQueue();

galaxy.main(function *() {
	while (true) {
		var object = yield queue.dequeueAsync();
		console.log('dequeue:', object);
	}
});

galaxy.main(function *() {
	for (var i = 0; i < 10; i++) {
		console.log('enqueue', i);
		yield timeout(100);
		yield queue.enqueueAsync(i);
	}
});

})();
