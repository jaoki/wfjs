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
	var draggingNodeOffset = {};

	var _canvasInstance;
    function Canvas(elementId, width, height) {
		_canvasInstance = this;

		var _onMouseUp = function(e){
			if(draggingNode != null){
				draggingNode = null;
			}
		};

		var _onMouseMove = function(e){
			if(draggingNode != null ){
				var x = e.pageX - _canvasInstance.offsetBase().x;
				var y = e.pageY - _canvasInstance.offsetBase().y;

				draggingNode.move(x - draggingNodeOffset.x, y - draggingNodeOffset.y);
				e.stopPropagation();
				e.preventDefault();
//				console.debug("tag:" + e.target.tagName + " screenY: " + e.screenY + " pageY: " + e.pageY + " clientY: " + e.clientY + " offsetY: " + e.offsetY + " e.y:" + e.y + " layerY:" + e.layerY);
			}
		};

        this.elementId = elementId;
		this.targetElement = document.getElementById(elementId);

		this.containerDivElm = document.createElement("div");
		this.containerDivElm.setAttribute("id", "wfjs_container_div");
		this.containerDivElm.setAttribute("style", "margin: 0px; padding 0px; width: " + width + "px; height: " + height + ";");
		this.targetElement.appendChild(this.containerDivElm);

		var svgElement = document.createElementNS(SVGNS, "svg");
		svgElement.setAttribute("id", "wfjs_svg");
		svgElement.setAttribute("style", "width: " + width + "px; height: " + height + ";");
		svgElement.setAttribute("version", "1.1");
		//svgElement.addEventListener("mouseup", _onMouseUp, false);
//		svgElement.addEventListener("mousemove", _onMouseMove, true);
		document.addEventListener("mouseup", _onMouseUp, false);
		document.addEventListener("mousemove", _onMouseMove, false);

		this.containerDivElm.appendChild(svgElement);
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
    } // End of Canvas()

	Canvas.prototype.offsetBase = function(){
		return {
			x: $(this.containerDivElm).offset().left,
			y: $(this.containerDivElm).offset().top,
		};
	};

	Canvas.prototype._onMouseDown = function(e){
		var targetId = e.target.getAttribute("id");
		draggingNode = _canvasInstance.nodes.getById(targetId);
		draggingNodeOffset.x = e.pageX - _canvasInstance.offsetBase().x - draggingNode.x;
		draggingNodeOffset.y = e.pageY - _canvasInstance.offsetBase().y - draggingNode.y;
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
})(); // End of wfjs1.CircleNode

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

		this.flowlines = [];

		this.move(x, y);
	};

    DiamondNode.prototype.move = function(x, y) {
		this.x = x;
		this.y = y;

		this.rectElement.setAttribute("transform", "rotate(45 " + x + " " + y + ")");
		this.rectElement.setAttribute("x", x);
		this.rectElement.setAttribute("y", y);

		var rect = this.labelTextElement.getBBox();
		this.labelTextElement.setAttribute("x", x - (rect.width/2));
		this.labelTextElement.setAttribute("y", y + 46); // TODO magic number
		for(var i = 0; i < this.flowlines.length; i++){
			this.flowlines[i].relocate();
		}

    }; // End of move()

    return DiamondNode;
})(); // End of wfjs1.DiamondNode 

wfjs1.FlowLine = (function () {
	var ARROW_HEAD_SHAPE_PATH = "l-5 10 l10 0 Z";

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
		var startX, startY, endX, endY;
		if(this.startNode instanceof wfjs1.CircleNode){
			// The line end should not be the center of the target object, since it needs an arrow mark.
			var startRadian = Math.atan2(this.endNode.y - this.startNode.y, this.endNode.x - this.startNode.x);
			startX = this.startNode.circle_attrs.r * Math.cos(startRadian) + this.startNode.x;
			startY = this.startNode.circle_attrs.r * Math.sin(startRadian) + this.startNode.y;
		}else if(this.startNode instanceof wfjs1.DiamondNode){
			startX = this.startNode.x;
			startY = this.startNode.y;
		}

		if(this.endNode instanceof wfjs1.CircleNode){
			var endRadian = Math.atan2(this.startNode.y - this.endNode.y, this.startNode.x - this.endNode.x);
			endX = this.endNode.circle_attrs.r * Math.cos(endRadian) + this.endNode.x;
			endY = this.endNode.circle_attrs.r * Math.sin(endRadian) + this.endNode.y;
		}else if(this.endNode instanceof wfjs1.DiamondNode){
			endX = this.endNode.x;
			endY = this.endNode.y;
		}

		this.lineElement.setAttribute("x1", startX);
		this.lineElement.setAttribute("y1", startY);
		this.lineElement.setAttribute("x2", endX);
		this.lineElement.setAttribute("y2", endY);

		var endDigree = (endRadian * 180 / Math.PI) - 90;
		this.arrowPathElement.setAttribute("d", "M" + endX + " " + endY + " " + ARROW_HEAD_SHAPE_PATH);
		this.arrowPathElement.setAttribute("transform", "rotate(" + endDigree + " " + endX + " " + endY + ")");

    }; // End of relocate()

    return FlowLine;
})(); // End of wfjs1.FlowLine 

return wfjs1;
})();


