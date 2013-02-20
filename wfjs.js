var wfjs = (function () {
var wfjs1 = {};

var SVGNS = "http://www.w3.org/2000/svg";

var TEXT_DEFAULT_OPTIONS = {
	fill : "black",
	"font-size" : "1em",
};

var draggingTarget = null;

var _onMouseDown = function(e){
	var target = e.target;
	draggingTarget = e.target;
};


wfjs1.Canvas = (function () {
    function Canvas(containerId) {

		var _this = this;
		var _onMouseUp = function(e){
			if(draggingTarget != null){
//				draggingTarget.setAttribute("cx", e.pageX);
//				draggingTarget.setAttribute("cy", e.pageY);
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
    function Node(canvas, x, y, label, circle_options, text_options) {
		this.id = "wfjs_node_" + canvas.nodes.length;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.label = label;
        this.circle_options = circle_options;
        this.text_options = text_options;
		this.children = [];
    };

    Node.prototype.show = function () {
//		var textId = "wfjs_circle_" + this.circles.length + "_text";
		var textId = "wfjs_circle__text";

		this.circleElement = document.createElementNS(SVGNS, "circle");
		this.circleElement.setAttribute("id", this.id);

		for(var attr in this.circle_options){
			this.circleElement.setAttribute(attr, this.circle_options[attr]);
		}
		this.circleElement.setAttribute("cx", this.x);
		this.circleElement.setAttribute("cy", this.y);
		this.circleElement.addEventListener("mousedown", _onMouseDown, false);
		this.canvas.svgElement.appendChild(this.circleElement);
        
		var text = document.createElementNS(SVGNS, "text");

		text.setAttribute("id", textId);
		text.textContent = this.label;

		for(var attr in TEXT_DEFAULT_OPTIONS){
			text.setAttribute(attr, TEXT_DEFAULT_OPTIONS[attr]);
		}

		if(this.text_options !=null && this.text_options !== undefined){
			for(var attr in this.text_options){
				text.setAttribute(attr, this.text_options[attr]);
			}
		}

		this.canvas.svgElement.appendChild(text);
		var rect = text.getBBox();
		text.setAttribute("x", this.x - (rect.width/2));
		text.setAttribute("y", this.y);

		this.children.push(text);

		this.canvas.nodes.push(this);

    }; // End of show()

    Node.prototype.move = function(x, y) {
		this.circleElement.setAttribute("cx", x);
		this.circleElement.setAttribute("cy", y);
//		var children = this.children.getById(targetId).move();
		for(var i = 0; i < this.children.length; i++){
			var text  = this.children[i];
			var rect = text.getBBox();
			text.setAttribute("x", x - (rect.width/2));
			text.setAttribute("y", y);
		}

    }; // End of move()

    return Node;
})();

return wfjs1;
})();







var wfjs10 = {
	_wfjs : null,
	SVGNS : "http://www.w3.org/2000/svg",
	target: null,
	svg: null,

	text_default_options : {
		fill : "black",
		"font-size" : "1em",
	},

	circles : [],

	init : function(targetId){
		_wfjs = this;
		this.target = document.getElementById(targetId);
		var svg = document.createElementNS(this.SVGNS, "svg");
		svg.setAttribute("id", "wfjs_svg");
		svg.setAttribute("xmlns", this.SVGNS);
		svg.setAttribute("version", "1.1");
		this.target.appendChild(svg);
		this.svg = svg;
		svg.addEventListener("mouseup", this._onMouseUp, false);

		this.circles.getById = function(id){
			for(var i = 0; i < this.length; i++){
				if(this[i].id == id){
					return this[i];
				}
			}
		}

	},

	circle : function(x, y, label, circle_options, text_options){
		var circleId = "wfjs_circle_" + this.circles.length;
		var textId = "wfjs_circle_" + this.circles.length + "_text";

		var circle = document.createElementNS(this.SVGNS, "circle");
		circle.setAttribute("id", circleId);

		for(var attr in circle_options){
			circle.setAttribute(attr, circle_options[attr]);
		}
		circle.setAttribute("cx", x);
		circle.setAttribute("cy", y);
		circle.addEventListener("mousedown", this._onMouseDown, false);
		this.svg.appendChild(circle);

		var text = document.createElementNS(this.SVGNS, "text");

		text.setAttribute("id", textId);
		text.textContent = label;

		for(var attr in this.text_default_options){
			text.setAttribute(attr, this.text_default_options[attr]);
		}

		if(text_options !=null && text_options !== undefined){
			for(var attr in text_options){
				text.setAttribute(attr, text_options[attr]);
			}
		}

		this.svg.appendChild(text);
		var rect = text.getBBox();
		text.setAttribute("x", x - (rect.width/2));
		text.setAttribute("y", y);

		this.circles.push({
			id : circleId,
			children : [text]
		});
	},

	draggingTarget : null,

	_onMouseDown : function(e){
		var target = e.target;
		draggingTarget = e.target;
	},

	_onMouseUp : function(e){
		if(draggingTarget != null){
			draggingTarget.setAttribute("cx", e.pageX);
			draggingTarget.setAttribute("cy", e.pageY);
			var targetId = draggingTarget.getAttribute("id");
			var children = _wfjs.circles.getById(targetId).children;
			for(var i = 0; i < children.length; i++){
				var text  = children[i];
				var rect = text.getBBox();
				text.setAttribute("x", e.pageX - (rect.width/2));
				text.setAttribute("y", e.pageY);
			}
			draggingTarget = null;
		}
	},

}
