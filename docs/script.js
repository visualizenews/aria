const URL = './data.json';
const STATIONS = [
  {
    id: 1,
    name: 'Viale Liguria',
  },
  {
    id: 2,
    name: 'Viale Marche',
  },
  {
    id: 3,
    name: 'Via Pascal',
  },
  {
    id: 4,
    name: 'Via Senato',
  },
  {
    id: 5,
    name: 'Verziere',
  },
  {
    id: 6,
    name: 'Via Juvara',
  },
  {
    id: 7,
    name: 'P.le Abbiategrasso',
  },
  {
    id: 8,
    name: 'P.le Zavattari',
  },
  {
    id: 9,
    name: 'Parco Lambro'
  }
];
const SUBS = {
  PM10: {
    name: 'PM 10',
    code: 'PM10',
    limits: [ 20, 35, 50, 100 ],
  },
  PM25: {
    name: 'PM 2,5',
    code: 'PM25',
    limits: [ 20, 35, 50, 100 ],
  },
  NO2: {
    name: 'Diossido di azoto',
    code: 'NO2',
    limits: [ 40, 100, 200, 400 ],
  },
  /*
  CO_8H: {
    name: 'Anidride Carbonica',
    code: 'CO 8h',
    limits: [ 40, 100, 200, 400 ],
  },
  */
  O3: {
    name: 'Ozono',
    code: 'O3',
    limits: [ 80, 120, 180, 240 ],
  },
  SO2: {
    name: 'Anidride Solforosa',
    code: 'SO2',
    limits: [ 50, 125, 350, 500 ],
  },
  C6H6: {
    name: 'Benzene',
    code: 'C6H6',
    limits: [ 2, 3, 4, 5 ],
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
          html += `<div class="marker marker-${mk.index}" id="marker-${m.index}-${mk.index}" style="background: ${mk.style.background}"></div>`;
      });
      html += '</div>';
      html += '</div>';
    });
    $mapContainer.innerHTML = html;
  };

  const prepareData = data => {
    console.log(data);
    rawData = data.records;

    const firstDay = moment(rawData[0].data);
    const lastDay = moment(rawData[0].data).subtract(17, 'days');

    console.log(firstDay, firstDay.format('YYYY MM DD'), '-', lastDay.format('YYYY MM DD'));

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
                id: s.id,
                index: j,
                // Logic here
                style: {
                  background: (() => {
                    const today = rawData.find((d) => (d.data === firstDay.format('YYYY-MM-DDTHH:mm:ss') && d.inquinante.toUpperCase() === key && d.stazione_id === s.id));
                    console.log(s.id, today);
                    if (!today || today.valore === null) {
                      return 'var(--neutral-color)';
                    }
                    let k = 0;
                    const top = SUBS[key].limits.length;
                    while (k < top) {
                      if (today.valore <= SUBS[key].limits[k]) {
                        return `var(--scale${k}-color)`;
                      }
                      k++;
                    }
                  })(),
                }
              });
            });
            return markers;
          })(),
        });
      }
    });
    // Charts
    STATIONS.forEach(s => {
      charts.push({
        id: s.id,
        title: s.name,
        charts: (() => {
          const charts = [];
          keys.forEach((key, j) => {
            // Logic here
            charts.push({
              id: j,
              title: SUBS[key].name,
              code: SUBS[key].code,
              data: (() => {
                const data = [];
                rawData.forEach(d => {
                  if (d.inquinante === 'PM10') {
                    const currentDate = moment(d.data);
                    // console.log({ currentDate, firstDay, lastDay, stazione_id: d.stazione_id, loop_stazione_id: s.id, key, inquinante: d.inquinante, valore: d.valore });
                    if (currentDate.valueOf() <= firstDay.valueOf() && currentDate.valueOf() >= lastDay.valueOf() && d.stazione_id === s.id && key === d.inquinante.toUpperCase()) {
                      console.log('MATCH');
                      data.push({
                        data: d,
                        date: currentDate.format('YYYY-MM-DD'),
                        x: currentDate.valueOf(),
                        y: d.valore || 0,
                      });
                    }
                  }
                })
                return data;
              })(),
            });
          });
          return charts;
        })(),
      });
    });

    console.log(charts);
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