
<script>
  import { onMount } from "svelte";
  import * as chrt from "chrt";
	import {
    getColor,
    getColorFromIndex,
    getGradientId,
    getGradientCode,
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
        bottom: 30,
        left: 12,
        right: 12,
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
          if (i % 7 === 0 || i === arr.length - 1) {
            return new Intl.DateTimeFormat('it-IT', {
              month: 'numeric',
              day: 'numeric',
              timeZone: 'UTC'
            }).format(d);
          }
          return '';
        })
        .class('axis')
        .interval(interval)
    );
    
    if (limits[sub.code].length > 0) {
      chart.add(
        chrt.horizontalGrid()
          .ticks(limits[sub.code])
          .width(1)
          .color((d, i) => {
            return getColorFromIndex(sub.code, i);
          })
          .class('limits')
      );
    } else {
      chart.add(
        chrt.horizontalGrid()
          .ticks([maxValue, Math.round(maxValue * .3), Math.round(maxValue * .6)])
          .width(1)
          .color('#364954')
          .class('limits')
      );
    }

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
        .radius(4)
    );

    chart.add(
      chrt.chrtPoints()
        .data(data, d => ({ x: d.x, y: d.max }))
        .color(d => getColor(sub.code, d.max))
        .radius(4)
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

    if (limits[sub.code].length > 0) {
      chart.add(
        chrt.yAxis()
          .ticks(limits[sub.code])  
          .setLabelPosition('inside')
          .label(' µg/m³')
          .labelColor((d, i) => {
            return getColorFromIndex(sub.code, i);
          })
          .format(d => d)
          .hideTicks()
          .hideAxis()
          .class('axis')
      );
    } else {
      chart.add(
        chrt.yAxis()
          .ticks([maxValue, Math.round(maxValue * .3), Math.round(maxValue * .6)])  
          .setLabelPosition('inside')
          .label(' µg/m³')
          .labelColor('#364954')
          .format(d => d)
          .hideTicks()
          .hideAxis()
          .class('axis')
      );
    }
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