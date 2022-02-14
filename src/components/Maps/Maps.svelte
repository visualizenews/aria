<script>
	import { createStationsList } from './../../settings.js';
  import SubMap from '../SubMap/SubMap.svelte';
	import {
    showMap,
		excludeMap,
	} from '../../settings.js';
  export let substancesList = [];
  export let stations = {};
  export let stationsList = [];
  export let latestAvailableData = new Date();
  export let stationsToSensors = {};
</script>
<main>
  <div class="page-maps">
  {#each substancesList as sub, index}
    {#if showMap(sub, stations, latestAvailableData, createStationsList, stationsToSensors)}
      <div class="page-map page-map-{index}">
        <SubMap {sub} {index} {stations} {stationsList} {latestAvailableData} {stationsToSensors} />
      </div>
    {/if}
  {/each}
  </div>
</main>
<style>

</style>
