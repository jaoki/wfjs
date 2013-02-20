var wfjs = (function () {
var wfjs1 = {};

var SVGNS = "http://www.w3.org/2000/svg";

var TEXT_DEFAULT_OPTIONS = {
	fill : "black",
	"font-size" : "1em",
};

var CIRCLE_DEFAULT_OPTIONS = {
	r: 30,
	stroke: "blue",
	"stroke-width": "2",
	fill: "yellow",
};

var draggingTarget = null;

var _onMouseDown = function(e){
	draggingTarget = e.target;
	e.preventDefault();
};


wfjs1.Canvas = (function () {
    function Canvas(containerId) {

		var _this = this;
		var _onMouseUp = function(e){
			if(draggingTarget != null){
				var targetId = draggingTarget.getAttribute("id");
				var node = _this.nodes.getById(targetId);
				node.move(e.offsetX, e.offsetY);
				draggingTarget = null;
			}
		};

        this.containerId = containerId;
		this.container = document.getElementById(containerId);

		var svgElement = document.createElementNS(SVGNS, "svg");
		svgElement.setAttribute("id", "wfjs_svg");
		svgElement.setAttribute("version", "1.1");
		svgElement.addEventListener("mouseup", _onMouseUp, false);
		this.container.appendChild(svgElement);
		this.svgElement = svgElement;

		this.nodes = [];
		this.nodes.getById = function(id){
			for(var i = 0; i < this.length; i++){
				if(this[i].id == id){
					return this[i];
				}
			}
			return null;
		}
    }

    return Canvas;
})();

wfjs1.Node = (function () {
	var index = 0; 

    function Node(canvas, x, y, label, circle_options, text_options) {
		this.id = "wfjs_node_" + index;
		index++;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.label = label;

		this.circle_options = {};
		for(var attr in CIRCLE_DEFAULT_OPTIONS){
			this.circle_options[attr] = CIRCLE_DEFAULT_OPTIONS[attr];
		}
		for(var attr in circle_options){
			this.circle_options[attr] = circle_options[attr];
		}

        this.text_options = text_options;
		this.lineTos = [];
		this.lineFroms = [];
    };

    Node.prototype.show = function () {

		this.circleElement = document.createElementNS(SVGNS, "circle");
		this.circleElement.setAttribute("id", this.id);

		for(var attr in this.circle_options){
			this.circleElement.setAttribute(attr, this.circle_options[attr]);
		}

		this.circleElement.addEventListener("mousedown", _onMouseDown, false);
		this.canvas.svgElement.appendChild(this.circleElement);
        
		var textElement = document.createElementNS(SVGNS, "text");

		textElement.textContent = this.label;

		for(var attr in TEXT_DEFAULT_OPTIONS){
			textElement.setAttribute(attr, TEXT_DEFAULT_OPTIONS[attr]);
		}

		if(this.text_options !=null && this.text_options !== undefined){
			for(var attr in this.text_options){
				textElement.setAttribute(attr, this.text_options[attr]);
			}
		}

		this.canvas.svgElement.appendChild(textElement);
		this.labelTextElement = textElement;
		this.canvas.nodes.push(this);

		this.move(this.x, this.y);

    }; // End of show()

    Node.prototype.linkTo = function(node) {
		var lineElement = document.createElementNS(SVGNS, "line");
		drawLine(lineElement, this, node);

		lineElement.setAttribute("style", "stroke: black;stroke-width:1;");
		this.canvas.svgElement.appendChild(lineElement);
//		this.canvas.svgElement.insertBefore(lineElement, this.canvas.svgElement.firstChild);
		this.lineFroms.push(lineElement);
		node.lineTos.push(lineElement);

    }; // End of linkTo()

    Node.prototype.move = function(x, y) {
		this.x = x;
		this.y = y;
		this.circleElement.setAttribute("cx", x);
		this.circleElement.setAttribute("cy", y);
		var rect = this.labelTextElement.getBBox();
		this.labelTextElement.setAttribute("x", x - (rect.width/2));
		this.labelTextElement.setAttribute("y", y + 5); // TODO what is this magic number?
		for(var i = 0; i < this.lineFroms.length; i++){
			var lineElement = this.lineFroms[i];
			lineElement.setAttribute("x1", x);
			lineElement.setAttribute("y1", y);
		}
		for(var i = 0; i < this.lineTos.length; i++){
			var lineElement = this.lineTos[i];
			lineElement.setAttribute("x2", x);
			lineElement.setAttribute("y2", y);
		}

    }; // End of move()

	var drawLine = function(lineElement, startNode, endNode){
		// The line end should not be the center of the target object, since it needs an arrow mark.
		var startRadian = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
		var startX = startNode.circle_options.r * Math.cos(startRadian) + startNode.x;
		var startY = startNode.circle_options.r * Math.sin(startRadian) + startNode.y;
		lineElement.setAttribute("x1", startX);
		lineElement.setAttribute("y1", startY);

		var radian = Math.atan2(startNode.y - endNode.y, startNode.x - endNode.x);
		var endX = endNode.circle_options.r * Math.cos(radian) + endNode.x;
		var endY = endNode.circle_options.r * Math.sin(radian) + endNode.y;
		lineElement.setAttribute("x2", endX);
		lineElement.setAttribute("y2", endY);
	};

    return Node;
})();

return wfjs1;
})();


