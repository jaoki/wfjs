var wfjs = (function () {
var wfjs1 = {};

var SVGNS = "http://www.w3.org/2000/svg";

var TEXT_DEFAULT_OPTIONS = {
	fill : "black",
	"font-size" : "1em",
};

var CIRCLE_DEFAULT_ATTRIBUTES = {
	r: 30,
	stroke: "blue",
	"stroke-width": "2",
	fill: "yellow",
	filter: "url(#dropshadow1)",
	style: "cursor: move;",
};

var DIAMOND_DEFAULT_ATTRIBUTES = {
	stroke: "yellow",
	"stroke-width": "2",
	fill: "DarkSeaGreen",
	width : 60,
	height : 60,
	filter: "url(#dropshadow1)",
	style: "cursor: move;",
};


wfjs1.Canvas = (function () {
	var draggingNode = null;

	var _canvasInstance;
    function Canvas(containerId) {
		_canvasInstance = this;

		var _onMouseUp = function(e){
			if(draggingNode != null){
				draggingNode = null;
			}
		};

		var _onMouseMove = function(e){
			if(draggingNode != null ){
				var x, y;
				if(e.layerX==undefined){ // Firefox
					x = e.pageX-$(_canvasInstance.svgElement).offset().left;
					y = e.pageY-$(_canvasInstance.svgElement).offset().top;
				}else{ // Chrome
					x = e.layerX;
					y = e.layerY;
				}

				draggingNode.move(x, y);
//				console.debug("tag:" + e.target.tagName + " screenY: " + e.screenY + " pageY: " + e.pageY + " clientY: " + e.clientY + " offsetY: " + e.offsetY + " e.y:" + e.y + " layerY:" + e.layerY);
			}
		};

        this.containerId = containerId;
		this.container = document.getElementById(containerId);

		var svgElement = document.createElementNS(SVGNS, "svg");
		svgElement.setAttribute("id", "wfjs_svg");
		svgElement.setAttribute("version", "1.1");
		svgElement.addEventListener("mouseup", _onMouseUp, false);
		svgElement.addEventListener("mousemove", _onMouseMove, true);

		this.container.appendChild(svgElement);
		this.svgElement = svgElement;

		var defsElement = document.createElementNS(SVGNS, "defs");
		svgElement.appendChild(defsElement);

		var filterElement = document.createElementNS(SVGNS, "filter");
		filterElement.setAttribute("id", "dropshadow1");
		defsElement.appendChild(filterElement);

		var feGaussianBlurElement = document.createElementNS(SVGNS, "feGaussianBlur");
		feGaussianBlurElement.setAttribute("in", "SourceAlpha");
		feGaussianBlurElement.setAttribute("stdDeviation", "3");
		filterElement.appendChild(feGaussianBlurElement);

		var feOffsetElement = document.createElementNS(SVGNS, "feOffset");
		feOffsetElement.setAttribute("dx", "2");
		feOffsetElement.setAttribute("dy", "2");
		feOffsetElement.setAttribute("result", "offsetblur");
		filterElement.appendChild(feOffsetElement);

		var feMergeElement = document.createElementNS(SVGNS, "feMerge");
		filterElement.appendChild(feMergeElement);

		var feMergeNodeElement1 = document.createElementNS(SVGNS, "feMergeNode");
		feMergeElement.appendChild(feMergeNodeElement1);

		var feMergeNodeElement2 = document.createElementNS(SVGNS, "feMergeNode");
		feMergeNodeElement2.setAttribute("in", "SourceGraphic");
		feMergeElement.appendChild(feMergeNodeElement2);


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

	Canvas.prototype._onMouseDown = function(e){
		var targetId = e.target.getAttribute("id");
		draggingNode = _canvasInstance.nodes.getById(targetId);
		e.preventDefault();
	};


    return Canvas;
})();

wfjs1.CircleNode = (function () {
	var index = 0; 

    function CircleNode(canvas, x, y, label, circle_attrs, text_options) {
		this.id = "wfjs_circle_node_" + index;
		index++;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.label = label;

		this.circle_attrs = {};
		for(var name in CIRCLE_DEFAULT_ATTRIBUTES){
			this.circle_attrs[name] = CIRCLE_DEFAULT_ATTRIBUTES[name];
		}
		for(var name in circle_attrs){
			this.circle_attrs[name] = circle_attrs[name];
		}

        this.text_options = text_options;
		this.flowlines = [];
    };

    CircleNode.prototype.show = function () {

		this.circleElement = document.createElementNS(SVGNS, "circle");
		this.circleElement.setAttribute("id", this.id);

		for(var name in this.circle_attrs){
			this.circleElement.setAttribute(name, this.circle_attrs[name]);
		}

		this.circleElement.addEventListener("mousedown", this.canvas._onMouseDown, false);
		this.canvas.svgElement.appendChild(this.circleElement);
        
		var textElement = document.createElementNS(SVGNS, "text");

		textElement.textContent = this.label;

		for(var name in TEXT_DEFAULT_OPTIONS){
			textElement.setAttribute(name, TEXT_DEFAULT_OPTIONS[name]);
		}

		if(this.text_options !=null && this.text_options !== undefined){
			for(var name in this.text_options){
				textElement.setAttribute(name, this.text_options[name]);
			}
		}

		this.canvas.svgElement.appendChild(textElement);
		this.labelTextElement = textElement;
		this.canvas.nodes.push(this);

		this.move(this.x, this.y);

    }; // End of show()

    CircleNode.prototype.connectTo = function(node) {
		var flowLine = new wfjs1.FlowLine(this.canvas, this, node);
		this.flowlines.push(flowLine);
		node.flowlines.push(flowLine);

    }; // End of connectTo()

    CircleNode.prototype.move = function(x, y) {
		this.x = x;
		this.y = y;
		this.circleElement.setAttribute("cx", x);
		this.circleElement.setAttribute("cy", y);
		// label position
		var rect = this.labelTextElement.getBBox();
		this.labelTextElement.setAttribute("x", x - (rect.width/2));
		this.labelTextElement.setAttribute("y", y + 5); // TODO what is this magic number?
		for(var i = 0; i < this.flowlines.length; i++){
			this.flowlines[i].relocate();
		}

    }; // End of move()

    return CircleNode;
})(); // End of wfjs1.Node 

wfjs1.DiamondNode = (function () {
	var index = 0; 

    function DiamondNode(canvas, x, y, label){
		this.id = "wfjs_diamond_node_" + index;
		index++;
		this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.label = label;

		this.rectElement = document.createElementNS(SVGNS, "rect");
		this.rectElement.addEventListener("mousedown", this.canvas._onMouseDown, false);
		this.rectElement.setAttribute("id", this.id);

		for(var name in DIAMOND_DEFAULT_ATTRIBUTES){
			this.rectElement.setAttribute(name, DIAMOND_DEFAULT_ATTRIBUTES[name]);
		}
		this.canvas.svgElement.appendChild(this.rectElement);

		// label
		this.labelTextElement = document.createElementNS(SVGNS, "text");
		this.labelTextElement.textContent = this.label;

		this.canvas.svgElement.appendChild(this.labelTextElement);
		this.canvas.nodes.push(this);

		this.move(x, y);
	};

    DiamondNode.prototype.move = function(x, y) {

		this.rectElement.setAttribute("transform", "rotate(45 " + x + " " + y + ")");
		this.rectElement.setAttribute("x", x);
		this.rectElement.setAttribute("y", y);

		var rect = this.labelTextElement.getBBox();
		this.labelTextElement.setAttribute("x", x - (rect.width/2));
		this.labelTextElement.setAttribute("y", y + 46); // TODO magic number

    }; // End of move()

    return DiamondNode;
})(); // End of wfjs1.DiamondNode 

wfjs1.FlowLine = (function () {
	var HEAD_SHAPE_PATH = "l-5 10 l10 0 Z";

    function FlowLine(canvas, startNode, endNode){
		this.canvas = canvas;
		this.startNode = startNode;
		this.endNode = endNode;

		this.lineElement = document.createElementNS(SVGNS, "line");
		this.lineElement.setAttribute("style", "stroke: black;stroke-width:1;");
		this.canvas.svgElement.appendChild(this.lineElement);

		this.arrowPathElement = document.createElementNS(SVGNS, "path");
		this.arrowPathElement.setAttribute("fill", "black");
		this.arrowPathElement.setAttribute("stroke", "black");
		this.canvas.svgElement.appendChild(this.arrowPathElement);

		this.relocate();

	};

    FlowLine.prototype.relocate = function(){
		// The line end should not be the center of the target object, since it needs an arrow mark.
		var startRadian = Math.atan2(this.endNode.y - this.startNode.y, this.endNode.x - this.startNode.x);
		var startX = this.startNode.circle_attrs.r * Math.cos(startRadian) + this.startNode.x;
		var startY = this.startNode.circle_attrs.r * Math.sin(startRadian) + this.startNode.y;
		this.lineElement.setAttribute("x1", startX);
		this.lineElement.setAttribute("y1", startY);

		var endRadian = Math.atan2(this.startNode.y - this.endNode.y, this.startNode.x - this.endNode.x);
		var endX = this.endNode.circle_attrs.r * Math.cos(endRadian) + this.endNode.x;
		var endY = this.endNode.circle_attrs.r * Math.sin(endRadian) + this.endNode.y;
		this.lineElement.setAttribute("x2", endX);
		this.lineElement.setAttribute("y2", endY);

		var endDigree = (endRadian * 180 / Math.PI) - 90;
		this.arrowPathElement.setAttribute("d", "M" + endX + " " + endY + " " + HEAD_SHAPE_PATH);
		this.arrowPathElement.setAttribute("transform", "rotate(" + endDigree + " " + endX + " " + endY + ")");

    }; // End of relocate()

    return FlowLine;
})(); // End of wfjs1.FlowLine 

return wfjs1;
})();


