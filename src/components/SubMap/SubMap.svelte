<script>
	import { matchSensorsToSubstance } from './../../settings.js';
  import { limits, getColorCode } from '../../settings.js';
  export let sub = {};
  export let index = -1;
  export let stationsList = [];
  export let stations = [];
  export let stationsToSensors = {};
  export let latestAvailableData = new Date();
  
  const getLevel = (station) => {
    let returnValue = 'neutral';
    const sensors = stationsToSensors[station.id];
    const validSensors = [];
    sensors.forEach((s) => {
      if (matchSensorsToSubstance(sub, s)) {
        validSensors.push(s);
      }
    });
    if (validSensors.length === 0) {
      returnValue = 'neutral';
    } else if (validSensors.length === 1) {
      const validData = stations[station.id][validSensors[0]].filter(d => d.x.getTime() === latestAvailableData.getTime());
      if (validData.length > 0) {
        const value = validData.reduce((a, d) => a + d.avg, 0) / validData.length;
        if (limits[sub.code].length > 0) {
          returnValue = getColorCode(sub.code, value);
        } else {
          returnValue = 'on';
        }
      } else {
        returnValue = 'off';
      }
    } else {
      console.warn('There is a case where 2 or more sensors are sending data from the same station');
      let validData = [];
      validSensors.forEach((s) => {
        validData = validData.concat(stations[station.id][s].filter(d => d.x.getTime() === latestAvailableData.getTime()));
      });
      console.warn(validData);
    }
    return returnValue;
  }
</script>

<main>
  {#if index > -1}  
    <div class="page-map-title"><h2>{sub.name}</h2></div>
    <div class="page-map-legend-unit">{sub.code} - {sub.unit}</div>
    <div class="page-map-container">
      {#each stationsList as station}
        <div class="marker marker-{station.id} level-{getLevel(station)}" id="marker-0-0">{station.displayIndex}</div>
      {/each}
    </div>
    <div class="page-map-legend">
      {#each limits[sub.code] as l, index}
        <div class="page-map-legend-item level-{index}">&lt; {l} {#if index === 0}{sub.unit}{/if}</div>
      {/each}
      <div class="page-map-legend-item level-{limits[sub.code].length}">≥ {limits[sub.code][limits[sub.code].length - 1]}</div>
      <div class="page-map-legend-item level-neutral">n.a.</div>
    </div>
  {/if}
</main>

<style>

.page-map-container {
  display: block;
  height: auto;
  position: relative;
  width: 100%;
}

.page-map-container::before {
  background: transparent url(../../picture.png) center center no-repeat;
  background: transparent url(../../shape.png) center center no-repeat;
  background-size: contain;
  content: '';
  display: block;
  padding-bottom: 100%;
  transition: background-image .25s ease-in-out;
  width: 100%;
}

.page-map-container:hover::before,
.page-map-container:active::before {
  background: transparent url(picture.png) center center no-repeat;
  background-size: contain;
}

.marker {
  background: var(--neutral-color);
  border-radius: 50%;
  display: block;
  font-family: 'Fira Mono', monospace;
  font-size: 9px;
  font-weight: 400;
  height: 12px;
  line-height: 12px;
  overflow: hidden;
  position: absolute;
  text-align: center;
  transform: translate3d(-50%, -50%, 0);
  transform-origin: 50% 50%;
  width: 12px;
}

@media screen and (min-width:768px) {
  .marker {
    font-size: 10px;
    height: 15px;
    line-height: 15px;
    width: 15px;
  }
}

@media screen and (min-width:1024px) {
  .marker {
    font-size: 12px;
    height: 18px;
    line-height: 18px;
    width: 18px;
  }
}

.marker.marker-6 {
  left: 56%;
  top: 60%;
}

.marker.marker-2 {
  right: 22%;
  top: 38%;
}

.marker.marker-0 {
  left: 48%;
  top: 56%;
}

.marker.marker-1 {
  left: 60%;
  top: 30%;
}

.marker.marker-8 {
  right: 18%;
  top: 30%;
}

.marker.marker-3 {
  left: 60%;
  top: 43%;
}

.marker.marker-4 {
  left: 57%;
  top: 48%;
}

.marker.marker-7 {
  left: 40%;
  top: 42%;
}

.marker.marker-5 {
  right: 29%;
  top: 39%;
}

.page-map-title h2 {
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  width: auto;
}

@media screen and (min-width:768px) {
  .page-map-title h2 {
    font-size: 12px;
  }
}

.page-map-legend {
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  left: 20px;
  position: absolute;
  right: 50%;
  width: auto;
  z-index: 3;
}

.page-map-legend-item {
  background: transparent !important;
  color: var(--fg-color) !important;
  display: block;
  flex: 0 0 50%;
  font-family: 'Fira Mono', monospace;
  font-size: 8px;
  font-weight: 400;
  line-height: 9px;
  padding: 0 0 0 2px;
  position: relative;
  text-align: left;
  text-shadow: 1px 0 0 var(--bg-color), -1px 0 0 var(--bg-color), 0 1px 0 var(--bg-color), 0 -1px 0 var(--bg-color);
  white-space: nowrap;
}

@media screen and (min-width:768px) {
  .page-map-legend-item {
    font-size: 10px;
    line-height: 11px;
  }
}

@media screen and (min-width:1280px) {
  .page-map-legend-item {
    font-size: 12px;
    line-height: 13px;
  }
}

.page-map-legend-item.level-unit {
  flex: 0 0 100%;
}

.page-map-legend-item::after {
  background: var(--fg-color);
  border-radius: 50%;
  content: '';
  display: block;
  height: 6px;
  right: 100%;
  position: absolute;
  top: 50%;
  transform: translate3d(0, -50%, 0);
  width: 6px;
}

.page-map-legend-item.level-0::after {
  background: var(--base-scale0-color);
}

.page-map-legend-item.level-1::after {
  background: var(--base-scale1-color);
}

.page-map-legend-item.level-2::after {
  background: var(--base-scale2-color);
}

.page-map-legend-item.level-3::after {
  background: var(--base-scale3-color);
}

.page-map-legend-item.level-4::after {
  background: var(--base-scale4-color);
}

.page-map-legend-item.level-5::after {
  background: var(--base-scale5-color);
}

.page-map-legend-item.level-neutral::after {
  background: var(--neutral2-color);
}

.page-map-legend-item.level-unit::after {
  background: transparent;
}

.page-map-legend-unit {
  display: block;
  font-family: 'Fira Mono', monospace;
  font-size: 8px;
  font-weight: 400;
  height: 12px;
  line-height: 12px;
  left: 50%;
  position: absolute;
  top: 10px;
  transform: translate3d(-50%, 0, 0);
  width: auto;
  z-index: 3;
}

@media screen and (min-width:768px) {
  .page-map-legend-unit {
    font-size: 12px;
    height: 14px;
    line-height: 14px;
    top: 18px;
  }
}
.page-map-legend {
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  left: 20px;
  position: absolute;
  right: 50%;
  width: auto;
  z-index: 3;
}
</style>