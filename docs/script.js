const URL = './data.json';
const STATIONS = [
  'Viale Liguria',
  'Viale Marche',
  'Via Pascal',
  'Via Senato',
  'Verziere',
  'Via Juvara',
  'P.le Abbiategrasso',
  'P.le Zavattari',
  'Parco Lambro'
];
const SUBS = {
  PM10: {
    name: 'Polveri Sottili',
    abbr: 'PM10',
    safe: 10,
    warning: 25,
  },
  PM25: {
    name: 'Polveri Super Sottili',
    abbr: 'PM25'
  },
  NO2: {
    name: 'Diossido di azoto',
    abbr: 'NO2'
  },
  CO_8H: {
    name: 'Anidride Carbonica',
    abbr: 'CO 8h'
  },
  O3: {
    name: 'Ozono',
    abbr: 'O3'
  },
  SO2: {
    name: 'Anidride Solforosa',
    abbr: 'SO2'
  },
  C6H6: {
    name: 'Benzene',
    abbr: 'C6H6'
  },
};

(() => {
  const $mapContainer = document.querySelector('#page-maps');
  let rawData = [];
  let substances = [];

  const drawMaps = () => {
    let html = '';
    const keys = Object.keys(SUBS);
    keys.forEach((key, i) => {
      if (substances.indexOf(key) > -1) {
        html += `<div class="page-map page-map-${i}" data-sub="${key}" id="page-map-${key}">`;
        STATIONS.forEach((s, j) => {
          html += `<div class="marker marker-${j}" id="marker-${i}-${j}"></div>`;
        });
        html += `<div class="page-map-indicator">${SUBS[key].name}</div>`;
        html += '</div>';
      }
    });
    $mapContainer.innerHTML = html;
  }

  const prepareData = data => {
    console.log(data);
    rawData = data.records;

    rawData.forEach(d => {
      if (substances.indexOf(d.inquinante.toUpperCase()) === -1) { substances.push(d.inquinante.toUpperCase()) }
    });

    console.log(substances);

    drawMaps();
  }
  
  const main = () => {
    fetch(
      URL,
      {
        mode: 'no-cors'
      })
      .then(response => response.json())
      .then(data => prepareData(data));
  }

  const ready = () => {
    if (document.readyState != 'loading') {
        main();
    } else {
        document.addEventListener('DOMContentLoaded', main);
    }
  };

  ready();
})()