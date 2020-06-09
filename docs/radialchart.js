const radialchart = (d, size, inner, outer, SUBS) => {

  const data = [];
  console.log(d);
  d.forEach((d, i) => {
    data.push({
      angle: i,
      key: d.key,
      min: d.data[ d.data.length - 1 ].y1,
      max: d.data[ d.data.length - 1 ].y2,
    });
  });



  const x = d3.scaleLinear()
  .domain(0, SUBS.length - 1)
  .range([0, 2 * Math.PI]);
  
  const y = d3.scaleLinear()
  .domain([0, 500])
  .range([inner, outer]);
  
  const xAxis = g => g
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .call(g => g.selectAll("g")
    .data(x.ticks())
    .join("g")
      .each((d, i) => d.id = DOM.uid("month"))
      .call(g => g.append("path")
          .attr("stroke", "#000")
          .attr("stroke-opacity", 0.2)
          .attr("d", d => `
            M${d3.pointRadial(x(d), innerRadius)}
            L${d3.pointRadial(x(d), outerRadius)}
          `))
      .call(g => g.append("path")
          .attr("id", d => d.id.id)
          .datum(d => [d, d3.utcMonth.offset(d, 1)])
          .attr("fill", "none")
          .attr("d", ([a, b]) => `
            M${d3.pointRadial(x(a), innerRadius)}
            A${innerRadius},${innerRadius} 0,0,1 ${d3.pointRadial(x(b), innerRadius)}
          `))
      .call(g => g.append("text")
        .append("textPath")
          .attr("startOffset", 6)
          .attr("xlink:href", d => d.id.href)
          .text(d3.utcFormat("%B"))))
  
  const yAxis = g => g
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .call(g => g.selectAll("g")
    .data(y.ticks().reverse())
    .join("g")
      .attr("fill", "none")
      .call(g => g.append("circle")
          .attr("stroke", "#000")
          .attr("stroke-opacity", 0.2)
          .attr("r", y))
      .call(g => g.append("text")
          .attr("y", d => -y(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 5)
          .text((x, i) => `${x.toFixed(0)}${i ? "" : "°F"}`)
        .clone(true)
          .attr("y", d => y(d))
        .selectAll(function() { return [this, this.previousSibling]; })
        .clone(true)
          .attr("fill", "currentColor")
          .attr("stroke", "none")));
  
  const line = d3.lineRadial()
  .curve(d3.curveLinearClosed)
  .angle(d => x(d.angle));
  
  const area = d3.areaRadial()
  .curve(d3.curveLinearClosed)
  .angle(d => x(d.angle))




  const svg = d3.create("svg")
      .attr("viewBox", [-size / 2, -size / 2, size, size])
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

  svg.append("path")
      .attr("fill", "lightsteelblue")
      .attr("fill-opacity", 0.2)
      .attr("d", area
          .innerRadius(d => y(d.y1))
          .outerRadius(d => y(d.y2))
        (data));

  svg.append("path")
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.2)
      .attr("d", area
          .innerRadius(d => y(d.y1))
          .outerRadius(d => y(d.y2))
        (data));
    
  svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line
          .radius(d => y(d.avg))
        (data));

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  return svg.node();
}