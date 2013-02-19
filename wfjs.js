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
	circle : function(label, circle_options){
		var circle = document.createElementNS(this.SVGNS, "circle");
		for(var attr in circle_options){
			circle.setAttribute(attr.replace("_", "-"), circle_options[attr]);
		}
		this.svg.appendChild(circle);

		var text = document.createElementNS(this.SVGNS, "text");
		text.textContent = label;
		text.setAttribute("x","0");
		text.setAttribute("y","15");
		text.setAttribute("fill","red");
		this.svg.appendChild(text);



	}
}
