
function SparkLine(opt) {
  this.model = opt.model;
}

SparkLine.prototype.renderTo = function(container) {
  let htmlStyle = `
  <style>
    .sparkline {
      stroke: red;
      fill: none;
    }

    .sparkline {
      stroke: red;
      fill: rgba(255, 0, 0, .3);
    }
  
    .sparkline--spot {
      stroke: blue;
      fill: blue;
    }
  
    /* change the cursor color */
    .sparkline--cursor {
      stroke: orange;
    }
  
    .sparkline--fill {
      fill: rgba(255, 0, 0, .3);
    }
  
    .sparkline--line {
      stroke: red;
    }
    
    .tooltip-spark {
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 2px 5px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 9999;
    }
    </style>
  `;

  let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  svg.setAttribute('stroke-width', '3');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '30');
  container.appendChild(dom.element(htmlStyle));

  let tooltip = dom.element('<span class="tooltip-spark" hidden="true"></span>');
  // tooltip.style.position = 'absolute';
  // tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  // tooltip.style.color = '#fff';
  // tooltip.style.padding = '2px 5px';
  // tooltip.style.fontSize = '12px';
  // tooltip.style.whiteSpace = 'nowrap';
  // tooltip.style.zIndex = '9999';

  container.appendChild(tooltip);
  container.appendChild(svg);

  sparkline.sparkline(svg, this.model.numbers, {
    interactive: true,
    onmousemove: function(event, point) {
      let rectSvg = svg.getBoundingClientRect();
      let rectContainer = container.getBoundingClientRect();
      // let svg = dom.ancestor(event.target, 'svg');
      // let tooltip = svg.nextElementSibling;
      // console.log({x: event.clientX - rectSvg.left, y: event.clientY - rectSvg.top})
      tooltip.hidden = false;
      tooltip.textContent = `${point.value.toFixed(2)}`;
      // tooltip.style.top = `${rectSvg.top - event.clientY + event.offsetY}px`;
      tooltip.style.left = `${rectSvg.left + event.offsetX - rectContainer.width + 30}px`;

      event.preventDefault();
      event.stopPropagation();
    },
    onmouseout: function(event) {
      // let svg = dom.ancestor(event.target, 'svg');
      // let tooltip = svg.nextElementSibling;
      tooltip.hidden = true;

      event.preventDefault();
      event.stopPropagation();
    }
  });
};