var wfjs = {
	SVGNS : "http://www.w3.org/2000/svg",
	target: null,
	svg: null,
	text_default_options : {
		fill : "black"
	},
	init : function(targetId){
		this.target = document.getElementById(targetId);
		var svg = document.createElementNS(this.SVGNS, "svg");
		svg.setAttribute("width", "300px");
		svg.setAttribute("height", "100px");
		svg.setAttribute("id", "svg_wfjs");
		svg.setAttribute("xmlns", this.SVGNS);
		svg.setAttribute("version", "1.1");
		this.target.appendChild(svg);
		this.svg = svg;

	},
	circle : function(x, y, label, circle_options){
		var circle = document.createElementNS(this.SVGNS, "circle");
		for(var attr in circle_options){
			circle.setAttribute(attr.replace("_", "-"), circle_options[attr]);
		}
		circle.setAttribute("cx", x);
		circle.setAttribute("cy", y);
		circle.addEventListener("mousedown", this._onMouseDown, false);
		document.addEventListener("mouseup", this._onMouseUp, false);
		this.svg.appendChild(circle);

		var text = document.createElementNS(this.SVGNS, "text");
		text.textContent = label;
		text.setAttribute("fill","red");
		text.setAttribute("font-size","20");

		this.svg.appendChild(text);
		var rect = text.getBBox();
		text.setAttribute("x", x - (rect.width/2));
		text.setAttribute("y", y);

	},
	draggingTarget : null,

	_onMouseDown : function(e){
		var target = e.target;
		target.setAttribute("fill", "purple");
		draggingTarget = e.target;
	},

	_onMouseUp : function(e){
		if(draggingTarget != null){
			draggingTarget.setAttribute("cx", e.pageX);
			draggingTarget.setAttribute("cy", e.pageY);
			draggingTarget = null;
		}
//		var target = e.target;
//		e.target.cx = e.pageX;
//		target.setAttribute("fill", "purple");
	},

}
