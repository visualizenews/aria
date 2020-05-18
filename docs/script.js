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
    unit: 'mg',
  },
  PM25: {
    name: 'PM 2,5',
    code: 'PM25',
    limits: [ 20, 35, 50, 100 ],
    unit: 'mg',
  },
  NO2: {
    name: 'Diossido di azoto',
    code: 'NO2',
    limits: [ 40, 100, 200, 400 ],
    unit: 'mg',
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
    unit: 'mg',
  },
  SO2: {
    name: 'Anidride Solforosa',
    code: 'SO2',
    limits: [ 50, 125, 350, 500 ],
    unit: 'mg',
  },
  C6H6: {
    name: 'Benzene',
    code: 'C6H6',
    limits: [ 2, 3, 4, 5 ],
    unit: 'mg',
  },
};

(() => {
  const $mapContainer = document.querySelector('#page-maps');
  const $chartContainer = document.querySelector('#page-charts');
  let rawData = [];
  let substances = [];
  const maps = [];
  const charts = [];

  const drawChartsContainers = () => {
    let html = '';
    charts.forEach((c, i) => {
      html += `<div class="page-chart page-chart-${c.id}" data-station="${c.id}" id="page-chart-${c.id}">`;
      html += `<div class="page-chart-title"><h2>${c.title}</h2></div>`
      html += '<div class="page-chart-scroller">';
      c.charts.forEach((ch, j) => {
        html += `<div class="page-chart-wrapper"><div class="page-chart-wrapper-inner">
        <div class="page-chart-wrapper-title"><h3>${ch.title}</h3></div>
          <div class="page-chart-container" id="page-chart-container-${c.id}-${ch.id}"></div>
        </div></div>`
      });
      html += '</div>'
      html += '</div>';
    })
    $chartContainer.innerHTML = html;
  };

  const drawCharts = () => {
    charts.forEach((c, i) => {
      c.charts.forEach((ch, j) => {
        console.log(ch);
        const $container = document.querySelector(`#page-chart-container-${c.id}-${ch.id}`);
        if (!ch.data.find(d => d.y > -1)) {
          $container.classList.add('no-data');
        } else {
          let html = '';
          const chartWidth = $container.offsetWidth;
          const chartHeight = $container.offsetHeight;
          const x = d3.scaleLinear()
            .domain(d3.extent(ch.data, d => d.x))
            .range([20, chartWidth - 20]);
          const allYValues = SUBS[ch.key].limits
            .concat(d3.extent(ch.data, d => d.y));
          allYValues.push(0);
          const uniqueYValues = allYValues.filter( (item, index) => (item > -1 && allYValues.indexOf(item) === index)).sort();
          const y = d3.scaleLinear()
            .domain([0, Math.max(...uniqueYValues)])
            .range([chartHeight - 20, 30]);

          
          ch.data.forEach(d => {
            // X-Axis
            const xPos = x(d.x);
            const yPos = chartHeight - 20;
            const pointYPos = y(d.y);
            const date = moment(d.date);
            // Thicks
            html += `<div class="page-chart-x-axis-thick ${(date.day() === 1) ? 'page-chart-x-axis-thick-highlight' : ''}" style="left: ${xPos}px; top: ${yPos}px"></div>`;
            // Labels
            if (date.day() === 1) {
              html += `<div class="page-chart-x-axis-label" style="left: ${xPos}px;">${date.format('dd D/MM')}</div>`;
            }
            // Points
            if (d.y > -1) {
              html += `<div class="page-chart-point" style="top: ${pointYPos}px; left: ${xPos}px"></div>`;
            }
          });
          // Y-Axis
          uniqueYValues.forEach(u => {
            console.log(u);
            const xPos = 20;
            const x2Pos = chartWidth - 20;
            const yPos = y(u);
            const level = SUBS[ch.key].limits.indexOf(u);
            // Thicks
            html += `<div class="page-chart-y-axis-thick ${(level > -1) ? 'level-' + level : ''}" style="left: ${xPos}px; top: ${yPos}px"></div>`;
            // Markers
            if (level > -1) {
              html += `<div class="page-chart-y-axis-marker level-${level}" style="top: ${yPos}px;"></div>`;
              html += `<div class="page-chart-y-axis-marker-label level-${level}" style="top: ${yPos}px;">${u} <span>${((level === (SUBS[ch.key].limits.length - 1)) ? SUBS[ch.key].unit : '')}</span></div>`;
            } else if (u > 0) {
              html += `<div class="page-chart-y-axis-label" style="top: ${yPos}px;">${u}</div>`;
            }
          });
          $container.innerHTML = html;
        }
      })
    });
  };

  const drawMaps = () => {
    let html = '';
    maps.forEach(m => {
      html += `<div class="page-map page-map-${m.index}" data-sub="${m.id}" id="page-map-${m.id}">`;
      html += `<div class="page-map-title"><h2>${m.label}</h2></div>`;
      html += '<div class="page-map-container">';
      m.markers.forEach((mk, j) => {
          html += `<div class="marker marker-${mk.index} ${mk.className}" id="marker-${m.index}-${mk.index}"></div>`;
      });
      html += '</div>';
      html += '</div>';
    });
    $mapContainer.innerHTML = html;
  };

  const prepareData = data => {
    rawData = data.records;

    const firstDay = moment(rawData[0].data);
    const lastDay = moment(rawData[0].data).subtract(14, 'days');
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
                className: (() => {
                  const today = rawData.find((d) => (d.data === firstDay.format('YYYY-MM-DDTHH:mm:ss') && d.inquinante.toUpperCase() === key && d.stazione_id === s.id));
                  if (!today || today.valore === null) {
                    return 'level-neutral';
                  }
                  let k = 0;
                  const top = SUBS[key].limits.length;
                  while (k < top) {
                    if (today.valore <= SUBS[key].limits[k]) {
                      return `level-${k}`;
                    }
                    k++;
                  }
                })(),
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
          const singleCharts = [];
          keys.forEach((key, j) => {
            // Logic here
            singleCharts.push({
              id: j,
              title: SUBS[key].name,
              code: SUBS[key].code,
              key: key,
              data: (() => {
                const data = [];
                let currentDay = moment(rawData[0].data);
                let found = false;
                while (currentDay.valueOf() >= lastDay.valueOf()) {
                  const currentData = rawData.find(d => (d.data === currentDay.format('YYYY-MM-DDTHH:mm:ss') && d.inquinante.toUpperCase() === key && d.stazione_id === s.id));
                  if (currentData) {
                    data.push({
                      date: moment(currentData.data).format('YYYY-MM-DD'),
                      x: moment(currentData.data).valueOf(),
                      y: currentData.valore || -1,
                      className: (() => {
                        if (currentData.valore === null) {
                          return 'level-neutral';
                        }
                        let k = 0;
                        const top = SUBS[key].limits.length;
                        while (k < top) {
                          if (currentData.valore <= SUBS[key].limits[k]) {
                            return `level-${k}`;
                          }
                          k++;
                        }
                      })()
                    });
                  } else {
                    data.push({
                      date: currentDay.format('YYYY-MM-DD'),
                      x: currentDay.valueOf(),
                      y: -1,
                      className: 'level-neutral',
                    });
                  }
                  currentDay.subtract(1, 'days');
                }
                return data;
              })(),
            });
          });
          return singleCharts;
        })(),
      });
    });
  };
  
  const main = () => {
    moment.locale('it');
    fetch(
      URL,
      {
        mode: 'no-cors'
      })
      .then(response => response.json())
      .then(data => {
        prepareData(data);
        drawMaps();
        drawChartsContainers();
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