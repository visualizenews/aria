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
    code: 'PM10',
    safe: 10,
    warning: 25,
  },
  PM25: {
    name: 'Polveri Super Sottili',
    code: 'PM25'
  },
  NO2: {
    name: 'Diossido di azoto',
    code: 'NO2'
  },
  CO_8H: {
    name: 'Anidride Carbonica',
    code: 'CO 8h'
  },
  O3: {
    name: 'Ozono',
    code: 'O3'
  },
  SO2: {
    name: 'Anidride Solforosa',
    code: 'SO2'
  },
  C6H6: {
    name: 'Benzene',
    code: 'C6H6'
  },
};

(() => {
  const $mapContainer = document.querySelector('#page-maps');
  const $chartContainer = document.querySelector('#page-charts');
  let rawData = [];
  let substances = [];
  const maps = [];
  const charts = [];

  const drawCharts = () => {
    let html = '';
    charts.forEach((c, i) => {
      html += `<div class="page-chart page-chart-${c.id}" data-station="${c.id}" id="page-chart-${c.id}">`;
      html += `<div class="page-chart-title"><h2>${c.title}</h2></div>`
      html += '<div class="page-chart-scroller">';
      c.charts.forEach((ch, j) => {
        html += '<div class="page-chart-wrapper">CHART</div>'
      });
      html += '</div>'
      html += '</div>';
    })
    $chartContainer.innerHTML = html;
  };

  const drawMaps = () => {
    let html = '';
    console.log(maps);
    maps.forEach(m => {
      html += `<div class="page-map page-map-${m.index}" data-sub="${m.id}" id="page-map-${m.id}">`;
      html += `<div class="page-map-title"><h2>${m.label}</h2></div>`;
      html += '<div class="page-map-container">';
      m.markers.forEach((mk, j) => {
          html += `<div class="marker marker-${mk.id}" id="marker-${m.index}-${mk.index}" style="background: ${mk.style.background}"></div>`;
      });
      html += '</div>';
      html += '</div>';
    });
    $mapContainer.innerHTML = html;
  };

  const prepareData = data => {
    console.log(data);
    rawData = data.records;
    // Substances
    rawData.forEach(d => {
      if (substances.indexOf(d.inquinante.toUpperCase()) === -1) { substances.push(d.inquinante.toUpperCase()) }
    });
    // Maps
    const keys = Object.keys(SUBS);
    keys.forEach((key, i) => {
      if (substances.indexOf(key) > -1) {
        maps.push({
          id: key,
          index: i,
          label: SUBS[key].name,
          markers: (() => {
            const markers = [];
            STATIONS.forEach((s, j) => {
              markers.push({
                id: j,
                index: j,
                // Logic here
                style: {
                  background: 'var(--scale2-color)'
                }
              });
            });
            return markers;
          })(),
        });
      }
    });
    // Charts
    STATIONS.forEach((s, i) => {
      charts.push({
        id: i,
        title: s,
        charts: (() => {
          const charts = [];
          keys.forEach((key, j) => {
            // Logic here
            charts.push({
              id: j,
              title: SUBS[key].name,
              code: SUBS[key].code,
              data: []
            });
          });
          return charts;
        })(),
      });
    });
  };
  
  const main = () => {
    fetch(
      URL,
      {
        mode: 'no-cors'
      })
      .then(response => response.json())
      .then(data => {
        prepareData(data);
        console.log(maps);
        drawMaps();
        drawCharts();
      });
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