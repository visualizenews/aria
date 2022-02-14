
<script>
  import { onMount } from "svelte";
  import * as chrt from "chrt";
	import { getColor } from './../../settings.js';
  export let data = [];
  export let sub = {};

  const chart = chrt.Chrt();
  let el;

  onMount(() => {
    const W = el.offsetWidth;
    const H = 190;

    let interval = 'day';

    chart
      .node(el)
      .size(W, H)
      .margins({
        bottom: 30,
        left: 0,
        right: 20,
        top: 10,
      })
      .x({ scale: "time" })
      .y({ scale: "linear", domain: [0, null] })

    chart.add(
      chrt.chrtPoints()
        .data(data, d => ({ x: d.x, y: d.min }))
        .color(d => getColor(sub.code, d.min))
        .radius(3)
    );
    // chart.add(chrt.chrtPoints().data(data, d => ({ x: d.x, y: d.max })).color(d => getColor(sub.code, d.max)).radius(3));

    chart.add(
      chrt.xAxis(15)
        .zero(0)
        .orient('bottom')
        .setTickPosition("outside")
        .setLabelPosition('outside')
        .class('bar-axis')
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

    // chart.add(
    //   chrt.yAxis()
    //     .showAxis(data.length > 1)
    //     .setTickPosition("inside")
    //     .setLabelPosition('inside')
    //     .class('bar-axis')
    // );
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