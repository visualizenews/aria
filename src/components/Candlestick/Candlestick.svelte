
<script>
  import { onMount } from "svelte";
  import * as chrt from "chrt";
	import {
    getColor,
    getColorFromIndex,
    getGradientId,
    limits } from './../../settings.js';
  export let data = [];
  export let sub = {};

  const chart = chrt.Chrt();
  let el;

  onMount(() => {
    const W = el.offsetWidth;
    const H = 190;

    let interval = 'day';

    const maxValue = Math.max(...data.map(d => d.max));
    const maxY = limits[sub.code].length > 0 ? Math.max(maxValue, limits[sub.code][limits[sub.code].length - 1]) : maxValue;
    
    chart
      .node(el)
      .size(W, H)
      .margins({
        bottom: 25,
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
        .hideAxis()
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
        .ticksColor('#364954')
        .class('xaxis')
        .interval(interval)
    );
    
    let ticks = limits[sub.code];
    if (limits[sub.code].length > 0) {
      ticks = ticks.concat((maxValue > limits[sub.code][limits[sub.code].length - 1]) ? [ maxValue ] : []);
    } else {
      ticks = [Math.round(maxValue * .25), Math.round(maxValue * .5), Math.round(maxValue * .75), maxValue];
    }
    
    chart.add(
      chrt.horizontalGrid()
        .ticks(ticks)
        .width(1)
        .color((d, i) => {
          if (limits[sub.code].length > 0) {
            return getColorFromIndex(sub.code, i);
          }
          return '#364954';
        })
        .class('limits')
    );

    chart.add(
      chrt.columns()
        .data(data, d => ({ x: d.x, y: d.min, y0: d.max }))
        .fill(d => getGradientId(d.min, d.max, sub.code))
        .width(.2)
    );

    chart.add(
      chrt.chrtPoints()
        .data(data, d => ({ x: d.x, y: d.min }))
        .color(d => getColor(sub.code, d.min))
        .radius(3)
    );

    chart.add(
      chrt.chrtPoints()
        .data(data, d => ({ x: d.x, y: d.max }))
        .color(d => getColor(sub.code, d.max))
        .radius(3)
    );

    // const chartData = [];
    // data.forEach((d) => {
    //   chartData.push({ x: d.x, y: d.min, y0: d.max });
    //   chartData.push({ x: d.x, y: d.max, y0: d.min });
    // });

    // chart.add(
    //   chrt.dotPlot()
    //     .vertical()
    //     .data(chartData)
    //     .range()
    //     .color(d => getColor(sub.code, d.y))
    //     .size(5)
    //     .rangeWidth(1)
    //     .rangeColor((d, i, a) => {
    //       console.log(d, i, a);
    //       return 'red';
    //       return getGradientId(d.y, d.y0, sub.code)
    //     })
    //   );

    chart.add(
      chrt.yAxis()
        .ticks(ticks)  
        .setLabelPosition('inside')
        .labelColor((d, i) => {
          if (limits[sub.code].length > 0) {
            return getColorFromIndex(sub.code, i);
          }
          return '#364954';
        })
        .labelsOffset([0,12])
        .format((d, i, arr) => {
          const value = new Intl.NumberFormat('it-IT').format(d);
          if (i === arr.length - 1) {
            return `${value} ${sub.unit}`;
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
  {#if sub.name && data.length > 0}
    <div class="page-candlestick-wrapper-inner">
      <div class="page-candlestick-wrapper-title"><h3>{sub.name}</h3></div>
      <div class="page-candlestick-container" bind:this={el}></div>
    </div>
  {/if}
</main>
<style>

</style>