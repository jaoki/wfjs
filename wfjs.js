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
//		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.setAttribute("xmlns", this.SVGNS);
		svg.setAttribute("version", "1.1");
		this.target.appendChild(svg);
	   
//	   this.target.html("<svg id='svg_wfjs' xmlns='http://www.w3.org/2000/svg' version='1.1'></svg>");
//	   this.svg = $("#svg_wfjs");
	   this.svg = svg;


	},
	drawCicle : function(){
//		var circle = document.createElement("circle");
		var circle = document.createElementNS(this.SVGNS, "circle");
		circle.setAttribute("cx","100");
		circle.setAttribute("cy","50");
		circle.setAttribute("r","40");
		circle.setAttribute("stroke","black");
		circle.setAttribute("stroke-width","2");
		circle.setAttribute("fill","red");

		this.svg.appendChild(circle);
//		this.svg.html("<circle cx='100' cy='50' r='40' stroke='black' stroke-width='2' fill='red' />");

	}
}
