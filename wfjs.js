var wfjs = {
	SVGNS : "http://www.w3.org/2000/svg",
	target: null,
	svg: null,
	init : function(targetId){
		this.target = document.getElementById(targetId);
		var svg = document.createElementNS(this.SVGNS, "svg");
		svg.setAttribute("width", "100px");
		svg.setAttribute("height", "100px");
		svg.setAttribute("id", "svg_wfjs");
		svg.setAttribute("xmlns", this.SVGNS);
		svg.setAttribute("version", "1.1");
		this.target.appendChild(svg);
		this.svg = svg;


	},
	drawCicle : function(options){
		var circle = document.createElementNS(this.SVGNS, "circle");
		for(var attr in options){
			circle.setAttribute(attr.replace("_", "-"), options[attr]);
		}
		this.svg.appendChild(circle);

	}
}
