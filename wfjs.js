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
//	width : 60,
//	height : 60,
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
		draggingNodeOffset.x = e.pageX - _canvasInstance.offsetBase().x - draggingNode.cx;
		draggingNodeOffset.y = e.pageY - _canvasInstance.offsetBase().y - draggingNode.cy;
		e.preventDefault();
	};


    return Canvas;
})();

wfjs1.BaseNode = (function () {
    function BaseNode(){};

    BaseNode.prototype.connectTo = function(node) {
		var flowLine = new wfjs1.FlowLine(this.canvas, this, node);
		this.flowlines.push(flowLine);
		node.flowlines.push(flowLine);

    }; // End of connectTo()

    return BaseNode;
})(); // End of wfjs1.CircleNode

wfjs1.CircleNode = (function () {
	var index = 0; 

    function CircleNode(canvas, cx, cy, label, circle_attrs, text_options) {
		this.id = "wfjs_circle_node_" + index;
		index++;
        this.canvas = canvas;
        this.cx = cx;
        this.cy = cy;
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

	CircleNode.prototype = new wfjs1.BaseNode();

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

		this.move(this.cx, this.cy);

    }; // End of show()

    CircleNode.prototype.move = function(cx, cy) {
		this.cx = cx;
		this.cy = cy;
		this.circleElement.setAttribute("cx", cx);
		this.circleElement.setAttribute("cy", cy);
		// label position
		var rect = this.labelTextElement.getBBox();
		this.labelTextElement.setAttribute("x", cx - (rect.width/2));
		this.labelTextElement.setAttribute("y", cy + 5); // TODO what is this magic number?
		for(var i = 0; i < this.flowlines.length; i++){
			this.flowlines[i].relocate();
		}

    }; // End of move()

    return CircleNode;
})(); // End of wfjs1.CircleNode

wfjs1.DiamondNode = (function () {
	var index = 0; 
	var WIDTH_HEIGHT = 40;

    function DiamondNode(canvas, cx, cy, label){
		this.id = "wfjs_diamond_node_" + index;
		index++;
		this.canvas = canvas;
        this.cx = cx;
        this.cy = cy;
        this.label = label;
		this.height = WIDTH_HEIGHT * 2;
		this.width = WIDTH_HEIGHT * 2;


		this.diaPathElm = document.createElementNS(SVGNS, "path");
		this.diaPathElm.setAttribute("id", this.id);
		this.diaPathElm.setAttribute("fill", "black");
		this.diaPathElm.setAttribute("stroke", "black");
		this.diaPathElm.addEventListener("mousedown", this.canvas._onMouseDown, false);
		for(var name in DIAMOND_DEFAULT_ATTRIBUTES){
			this.diaPathElm.setAttribute(name, DIAMOND_DEFAULT_ATTRIBUTES[name]);
		}
		this.canvas.svgElement.appendChild(this.diaPathElm);

		// label
		this.labelTextElement = document.createElementNS(SVGNS, "text");
		this.labelTextElement.textContent = this.label;

		this.canvas.svgElement.appendChild(this.labelTextElement);
		this.canvas.nodes.push(this);

		this.flowlines = [];

		this.move(cx, cy);
	};

	DiamondNode.prototype = new wfjs1.BaseNode();

    DiamondNode.prototype.move = function(cx, cy){
		this.cx = cx;
		this.cy = cy;


		this.diaPathElm.setAttribute("d", 
				"M" + cx + " " + (cy - WIDTH_HEIGHT) // start point
				+ " l-" + WIDTH_HEIGHT + " " + WIDTH_HEIGHT // first line 
				+ " l" + WIDTH_HEIGHT + " " + WIDTH_HEIGHT // second line 
				+ " l" + WIDTH_HEIGHT + " -" + WIDTH_HEIGHT // third line 
				+ " Z");

		var rect = this.labelTextElement.getBBox();
		this.labelTextElement.setAttribute("x", cx - (rect.width/2));
		this.labelTextElement.setAttribute("y", cy + (rect.height/4)); // TODO why divided by 4?
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
//		var __WIDTH_HEIGHT = 40; // TODO duplicate. Use DiamondNode's

		var startX, startY, endX, endY;
		var startRadian = Math.atan2(this.endNode.cy - this.startNode.cy, this.endNode.cx - this.startNode.cx);
		if(this.startNode instanceof wfjs1.CircleNode){
			// The line end should not be the center of the target object, since it needs an arrow mark.
			startX = this.startNode.circle_attrs.r * Math.cos(startRadian) + this.startNode.cx;
			startY = this.startNode.circle_attrs.r * Math.sin(startRadian) + this.startNode.cy;
		}else if(this.startNode instanceof wfjs1.DiamondNode){
			if(Math.abs(startRadian) < Math.PI/4){
				startX = this.startNode.cx + (this.startNode.width/2);
				startY = this.startNode.cy;
			}else if(startRadian < Math.PI/4*3 && startRadian > Math.PI/4 ){
				startX = this.startNode.cx;
				startY = this.startNode.cy + (this.startNode.height/2);
			}else if(Math.abs(startRadian) > Math.PI/4*3 ){
				startX = this.startNode.cx - (this.startNode.width/2);
				startY = this.startNode.cy;
			}else{
				startX = this.startNode.cx;
				startY = this.startNode.cy - (this.startNode.height/2);
			}
		}

		var endRadian = Math.atan2(this.startNode.cy - this.endNode.cy, this.startNode.cx - this.endNode.cx);
//		console.debug(startRadian + ":" + endRadian +":" + (Math.abs(startRadian) + Math.abs(endRadian)));
		if(this.endNode instanceof wfjs1.CircleNode){
			endX = this.endNode.circle_attrs.r * Math.cos(endRadian) + this.endNode.cx;
			endY = this.endNode.circle_attrs.r * Math.sin(endRadian) + this.endNode.cy;
		}else if(this.endNode instanceof wfjs1.DiamondNode){
			if(Math.abs(endRadian) < Math.PI/4){
				endX = this.endNode.cx + (this.endNode.width/2);
				endY = this.endNode.cy;
			}else if(endRadian < Math.PI/4*3 && endRadian > Math.PI/4 ){
				endX = this.endNode.cx;
				endY = this.endNode.cy + (this.endNode.height/2);
			}else if(Math.abs(endRadian) > Math.PI/4*3 ){
				endX = this.endNode.cx - (this.endNode.width/2);
				endY = this.endNode.cy;
			}else{
				endX = this.endNode.cx;
				endY = this.endNode.cy - (this.endNode.height/2);
			}
			
//			endX = this.endNode.cx; // TODO this should be dyanmic, depending on the other object
//			endY = this.endNode.cy; // - WIDTH_HEIGHT; // TODO this should be dyanmic, depending on the other object
		}

		this.lineElement.setAttribute("x1", startX);
		this.lineElement.setAttribute("y1", startY);
		this.lineElement.setAttribute("x2", endX);
		this.lineElement.setAttribute("y2", endY);

		// TODO arrow head is off from DiamondNode
		var arrowHeadDigree = (startRadian * 180 / Math.PI) + 90;
		this.arrowPathElement.setAttribute("d", "M" + endX + " " + endY + " " + ARROW_HEAD_SHAPE_PATH);
		this.arrowPathElement.setAttribute("transform", "rotate(" + arrowHeadDigree + " " + endX + " " + endY + ")");

    }; // End of relocate()

    return FlowLine;
})(); // End of wfjs1.FlowLine 

return wfjs1;
})();


