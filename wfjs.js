var wfjs = (function () {
var wfjs1 = {};

wfjs1.SVGNS = "http://www.w3.org/2000/svg";

wfjs1.text_default_options = {
	fill : "black",
	"font-size" : "1em",
};

wfjs1.Svg = (function () {
    function Svg(targetId) {
        this.targetId = targetId;
		this.target = document.getElementById(targetId);

		var svg = document.createElementNS(wfjs1.SVGNS, "svg");
		svg.setAttribute("id", "wfjs_svg");
//		svg.setAttribute("xmlns", this.SVGNS);
		svg.setAttribute("version", "1.1");
		this.target.appendChild(svg);
		this.svg = svg;
//		svg.addEventListener("mouseup", this._onMouseUp, false);
    }

    return Svg;
})();

wfjs1.Circle = (function () {
    function Circle(svg, x, y, label, circle_options, text_options) {
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.label = label;
        this.circle_options = circle_options;
        this.text_options = text_options;
    }

    Circle.prototype.show = function () {
//		var circleId = "wfjs_circle_" + this.circles.length;
		var circleId = "wfjs_circle_";
//		var textId = "wfjs_circle_" + this.circles.length + "_text";
		var textId = "wfjs_circle__text";

		var circle = document.createElementNS(wfjs1.SVGNS, "circle");
		circle.setAttribute("id", circleId);

		for(var attr in this.circle_options){
			circle.setAttribute(attr, this.circle_options[attr]);
		}
		circle.setAttribute("cx", this.x);
		circle.setAttribute("cy", this.y);
//		circle.addEventListener("mousedown", this._onMouseDown, false);
		this.svg.svg.appendChild(circle);
        
		var text = document.createElementNS(wfjs1.SVGNS, "text");

		text.setAttribute("id", textId);
		text.textContent = this.label;

		for(var attr in wfjs1.text_default_options){
			text.setAttribute(attr, wfjs1.text_default_options[attr]);
		}

		if(this.text_options !=null && this.text_options !== undefined){
			for(var attr in this.text_options){
				text.setAttribute(attr, this.text_options[attr]);
			}
		}

		this.svg.svg.appendChild(text);
		var rect = text.getBBox();
		text.setAttribute("x", this.x - (rect.width/2));
		text.setAttribute("y", this.y);

//		this.circles.push({
//			id : circleId,
//			children : [text]
//		});
    };
    return Circle;
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
