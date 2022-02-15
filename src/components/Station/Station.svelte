<script>
  import { pushValue } from "../../settings";
  import DotChart from '../DotChart/DotChart.svelte';

  export let station = {};
  export let data = {};
  export let substancesList = [];

  let subs = [];

  const sensors = Object.keys(data);
  sensors.forEach((s) => {
    if (data[s].length > 1) {
      const sub = substancesList.find(d => d.sensors.includes(s));
      subs = pushValue(subs, {...sub, data: data[s]});
    }
  });
  subs = subs.sort((a, b) => a.sort - b.sort);

  
</script>
<main>
  <div class="page-chart-title"><h2>{station.displayIndex} - {station.location}</h2></div>
  <div class="page-chart-scroller">
    {#each subs as sub}
    <div class="page-chart-wrapper">
      <div class="page-chart-wrapper-inner">
        <div class="page-chart-wrapper-title"><h3>{sub.name} - Ultima rilevazione: 12/2</h3></div>
          <DotChart data={sub} />
      </div>
    </div>
    {/each}
  </div>
</main>
<style>

</style>