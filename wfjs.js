var wfjs = {
	_wfjs : null,
	SVGNS : "http://www.w3.org/2000/svg",
	target: null,
	svg: null,

	text_default_options : {
		fill : "black"
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

		this.circles.getById = function(id){
			for(var i = 0; i < this.length; i++){
				if(this[i].id == id){
					return this[i];
				}
			}
		}

	},

	circle : function(x, y, label, circle_options){
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
		document.addEventListener("mouseup", this._onMouseUp, false);
		this.svg.appendChild(circle);

		var text = document.createElementNS(this.SVGNS, "text");

		text.setAttribute("id", textId);
		text.textContent = label;

		for(var attr in this.text_default_options){
			text.setAttribute(attr, this.text_default_options[attr]);
		}

//		text.setAttribute("fill","red");
//		text.setAttribute("font-size","20");

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
