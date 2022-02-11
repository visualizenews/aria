<script>
	import SubMap from './components/SubMap/SubMap.svelte';
	import {
		endpoint,
		pushValue,
		fixDate,
		aggregateValuesBySensor,
		createSubstancesList,
		aggregateValuesBySubstance,
		createRelations,
		createStationsList,
		excludeMap,
	} from './settings.js';

	let status = [ 'loading' ];
	let latestAvailableData = new Date();
	let records = {
		data: {
			sensors: [],
			values: [],
		}
	};
	let substancesList = [];
	let substances = {};
	let stationsList = [];
	let stations = {};
	let stationsToSensors = {};

	const setDate = () => {
		latestAvailableData = new Date(Math.max(...records.data.values.map(d => fixDate(d.Date).getTime())));
	};

	const fetchData = async () => {
		const response = await self.fetch(endpoint);
		if (response.ok) {
  		return response.json();
		} else {
			throw new Error(users);
		}
	}

	const loadData = async () => {
		records = await fetchData();
		console.log(records);
		setDate();
		substancesList = createSubstancesList(records).slice(3,6);
		stationsList = createStationsList(records);
		stationsToSensors = createRelations(stationsList, records);
		substancesList.forEach((s) => {
			substances[s.code] = aggregateValuesBySubstance(s.code, records.data);
		});
		stationsList.forEach((s) => {
			stations[s.id] = aggregateValuesBySensor(s.id, stationsToSensors[s.id], records.data);
		});
		// console.log('substancesList', substancesList);
		// console.log('stationsList', stationsList);
		// console.log('stationsToSensors', stationsToSensors);
		// console.log('substances', substances);
		// console.log('stations', stations);
		status = pushValue(status, 'exit');
	}

	try {
		loadData();
	} catch (e) {
		throw new Error(e);
	}
</script>

<main>
	<div id="loading" class={status.join(' ')}>
		<div>
			<h1>L'aria di Milano</h1>
			<p id="loadingMessage">Stiamo caricando i dati più recenti sulla qualità dell'aria a Milano.</p>
		</div>
	</div>
	<header class="page-header">
		<h1>L'aria di Milano</h1>
		<div class="page-title page-title-light"><h2>Dati del {new Intl.DateTimeFormat("it-IT", {
			day: "numeric",
			month: "2-digit",
			year: "2-digit",
		}).format(latestAvailableData)}</h2></div>
	</header>
	{#if records.data.values.length > 0 && records.data.values.length > 0}
		<div class="page-maps">
			{#each substancesList as sub, index}
				{#if !excludeMap.find(d => d === sub.code)}
					<div class="page-map page-map-{index}">
						<SubMap {sub} {index} {stations} {stationsList} {latestAvailableData} {stationsToSensors} />
					</div>
				{/if}
			{/each}
		</div>
		<div class="page-title"><h2>Ultimi <span class="writeDays">30</span> giorni</h2></div>
		<div class="page-text">
			<p>Nei grafici seguenti è possibile vedere l'andamento di ciascuna sostanza inquinante nel corso dell'ultimo mese. Per ogni giorno sono mostrati i valori massimo e minimo rilevati.</p>
		</div>
	{/if}
</main>

<style>
</style>