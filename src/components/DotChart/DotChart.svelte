<script>
  import { onMount } from "svelte";
  import * as chrt from "chrt";
	import {
    getColor,
    getColorFromIndex,
    getGradientId,
    limits } from './../../settings.js';

  export let data = {};

  const chart = chrt.Chrt();
  let el;

  onMount(() => {
    const W = el.offsetWidth;
    const H = 190;

    const chartData = [];
    data.data.forEach((d) => {
      chartData.push({ x: d.x, y: d.avg });
      // d.values.forEach((v) => {
      //   chartData.push({ x: d.x, y: v });
      // })
    });

    let interval = 'day';

    const maxValue = Math.max(...chartData.map(d => d.y));
    const maxY = limits[data.code].length > 0 ? Math.max(maxValue, limits[data.code][limits[data.code].length - 1]) : maxValue;
    
    chart
      .node(el)
      .size(W, H)
      .margins({
        bottom: 30,
        left: 0,
        right: 5,
        top: 20,
      })
      .x({ scale: "time" })
      .y({ scale: "linear", domain: [0, maxY] });

    chart.add(
      chrt.xAxis()
        .zero(0)
        .orient('bottom')
        .setTickPosition("outside")
        .setLabelPosition('outside')
        .color('transparent')
        .width(1)
        .format((d, i, arr) => {
          if (            
            (new Date(d).getDay() === 1 && arr.length - i > 5)
            || i === arr.length - 1
          ) {
            return new Intl.DateTimeFormat('it-IT', {
              month: 'numeric',
              day: 'numeric',
              timeZone: 'UTC'
            }).format(d);
          }
          return '';
        })
        .class('xaxis')
        .interval(interval)
    );
    
    let ticks = limits[data.code];
    if (limits[data.code].length > 0) {
      ticks = ticks.concat((maxValue > limits[data.code][limits[data.code].length - 1]) ? [ maxValue ] : []);
    } else {
      ticks = [Math.round(maxValue * .25), Math.round(maxValue * .5), Math.round(maxValue * .75), maxValue];
    }
    
    chart.add(
      chrt.horizontalGrid()
        .ticks(ticks)
        .width(1)
        .color((d, i) => {
          if (limits[data.code].length > 0) {
            return getColorFromIndex(data.code, i);
          }
          return '#364954';
        })
        .class('limits')
    );

    chart.add(
      chrt.chrtPoints()
        .data(chartData)
        .color(d => getColor(data.code, d.y))
        .radius(3)
        .class('points')
    );

    chart.add(
      chrt.yAxis()
        .ticks(ticks)  
        .setLabelPosition('inside')
        .labelColor((d, i) => {
          if (limits[data.code].length > 0) {
            return getColorFromIndex(data.code, i);
          }
          return '#364954';
        })
        .labelsOffset([0,12])
        .format((d, i, arr) => {
          const value = new Intl.NumberFormat('it-IT').format(d);
          if (i === arr.length - 1) {
            return `${value} ${data.unit}`;
          }
          return value;
        })
        .hideTicks()
        .hideAxis()
        .class('yaxis')
    );
  });

</script>
<main>
  {#if data.data && data.data.length > 0}
    <div class="page-chart-container">
      <div class="page-chart" bind:this={el} />
    </div>
  {/if}
</main>
