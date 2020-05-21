const URL = 'https://api-aria.mia.mi.it/data';

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
    unit: 'µg/m³',
  },
  PM25: {
    name: 'PM 2,5',
    code: 'PM25',
    limits: [ 20, 35, 50, 100 ],
    unit: 'µg/m³',
  },
  NO2: {
    name: 'Diossido di azoto',
    code: 'NO2',
    limits: [ 40, 100, 200, 400 ],
    unit: 'µg/m³',
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
    unit: 'µg/m³',
  },
  SO2: {
    name: 'Anidride Solforosa',
    code: 'SO2',
    limits: [ 50, 125, 350, 500 ],
    unit: 'µg/m³',
  },
  C6H6: {
    name: 'Benzene',
    code: 'C6H6',
    limits: [ 2, 3, 4, 5 ],
    unit: 'µg/m³',
  },
};
const MARGINS = [30, 30, 20, 20];

const DAYS = 30;

(() => {
  const $mapContainer = document.querySelector('#page-maps');
  const $chartContainer = document.querySelector('#page-charts');
  const $candlestickContainer = document.querySelector('#page-candlesticks');
  let rawData = [];
  let substances = [];
  const maps = [];
  const charts = [];
  const candlesticks = [];

  const reset = () => {
    const $chartContainers = document.querySelectorAll('.page-chart-container');
    const $candlestickContainers = document.querySelectorAll('.page-candlestick-container');
    $chartContainers.forEach($c => { $c.innerHTML = '' });
    $candlestickContainers.forEach($c => { $c.innerHTML = '' });
    drawCharts();
  };

  const drawChartsContainers = () => {
    let html = '';
    charts.forEach((c, i) => {
      const hasData = c.charts.find( cf => {
        return cf.data.find(cff => cff.y > -1);
      });
      if (hasData) {
        html += `<div class="page-chart page-chart-${c.id}" id="page-chart-${c.id}">`;
        html += `<div class="page-chart-title"><h2>${c.id} - ${c.title}</h2></div>`
        html += '<div class="page-chart-scroller">';
        c.charts.forEach((ch, j) => {
          if (ch.data.find(chh => chh.y > -1)) {
            html += `<div class="page-chart-wrapper"><div class="page-chart-wrapper-inner">
            <div class="page-chart-wrapper-title"><h3>${ch.title}</h3></div>
              <div class="page-chart-container" id="page-chart-container-${c.id}-${ch.id}"></div>
            </div></div>`
          }
        });
        html += '</div>'
        html += '</div>';
      }
    });
    $chartContainer.innerHTML = html;

    html = '';
    html += `<div class="page-candlestick">`;
    html += '<div class="page-candlestick-scroller">';
    candlesticks.forEach((c, i) => {
      html += `<div class="page-candlestick-wrapper"><div class="page-candlestick-wrapper-inner">
      <div class="page-candlestick-wrapper-title"><h3>${c.label}</h3></div>
        <div class="page-candlestick-container" id="page-candlestick-container-${c.id}"></div>
      </div></div>`;
    });
    html += '</div>'
    html += '</div>';
    $candlestickContainer.innerHTML = html;
  };

  const drawCharts = () => {
    let screenSize = 'S';
    if (window.matchMedia('screen and (min-width:1280px)').matches) {
      screenSize = 'XL';
    } else if (window.matchMedia('screen and (min-width:1024px)').matches) {
      screenSize = 'L';
    } else if (window.matchMedia('screen and (min-width:768px)').matches) {
      screenSize = 'M';
    }
    charts.forEach((c, i) => {
      c.charts.forEach((ch, j) => {
        const $container = document.querySelector(`#page-chart-container-${c.id}-${ch.id}`);
        if ($container) {
          if (!ch.data.find(d => d.y > -1)) {
            $container.classList.add('no-data');
          } else {
            let html = '';
            const chartWidth = $container.offsetWidth;
            const chartHeight = $container.offsetHeight;
            const x = d3.scaleLinear()
              .domain(d3.extent(ch.data, d => d.x))
              .range([MARGINS[3], chartWidth - MARGINS[1]]);
            const allYValues = SUBS[ch.key].limits
              .concat(d3.extent(ch.data, d => d.y));
            allYValues.push(0);
            const uniqueYValues = allYValues.filter( (item, index) => (item > -1 && allYValues.indexOf(item) === index)).sort();
            const y = d3.scaleLinear()
              .domain([0, Math.max(...uniqueYValues)])
              .range([chartHeight - MARGINS[2], MARGINS[0]]);

            
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
                html += `<div class="page-chart-x-axis-label" style="left: ${xPos}px;">${(screenSize === 'S') ? date.format('D/MM') : date.format('dd D/MM')}</div>`;
              }
              // Points
              if (d.y > -1) {
                html += `<div class="page-chart-point ${d.className}" style="top: ${pointYPos}px; left: ${xPos}px"></div>`;
              }
            });
            // Y-Axis
            uniqueYValues.forEach(u => {
              const xPos = 20;
              const x2Pos = chartWidth - 20;
              const yPos = y(u);
              const level = SUBS[ch.key].limits.indexOf(u);
              // Markers
              if (level > -1) {
                html += `<div class="page-chart-y-axis-marker level-${level}" style="top: ${yPos}px;"></div>`;
                html += `<div class="page-chart-y-axis-marker-label level-${level}" style="top: ${yPos}px;">${u} <span>${((level === (SUBS[ch.key].limits.length - 1)) ? SUBS[ch.key].unit : '')}</span></div>`;
              } else if (u > 0) {
                // Thicks
                html += `<div class="page-chart-y-axis-thick ${(level > -1) ? 'level-' + level : ''}" style="left: ${xPos}px; top: ${yPos}px"></div>`;
                html += `<div class="page-chart-y-axis-label" style="top: ${yPos}px;">${u}</div>`;
              }
            });
            $container.innerHTML = html;
          }
        }
      });
    });
    candlesticks.forEach((ch, j) => {
      const $container = document.querySelector(`#page-candlestick-container-${ch.id}`);
      if ($container) {
        let html = '';
        const chartWidth = $container.offsetWidth;
        const chartHeight = $container.offsetHeight;
        const x = d3.scaleLinear()
          .domain(d3.extent(ch.data, d => d.x))
          .range([MARGINS[3], chartWidth - MARGINS[1]]);
        const allYValues = SUBS[ch.key].limits
          .concat(d3.extent(ch.data, d => d.y2));
        allYValues.push(0);
        const uniqueYValues = allYValues.filter( (item, index) => (item > -1 && allYValues.indexOf(item) === index)).sort();
        const y = d3.scaleLinear()
          .domain([0, Math.max(...uniqueYValues)])
          .range([chartHeight - MARGINS[2], MARGINS[0]]);

        
        ch.data.forEach(d => {
          // X-Axis
          const xPos = x(d.x);
          const yPos = chartHeight - 20;
          const pointY1Pos = y(d.y1);
          const pointY2Pos = y(d.y2);
          const date = moment(d.date);
          // Thicks
          html += `<div class="page-candlestick-x-axis-thick ${(date.day() === 1) ? 'page-candlestick-x-axis-thick-highlight' : ''}" style="left: ${xPos}px; top: ${yPos}px"></div>`;
          // Labels
          if (date.day() === 1) {
            html += `<div class="page-candlestick-x-axis-label" style="left: ${xPos}px;">${(screenSize === 'S') ? date.format('D/MM') : date.format('dd D/MM')}</div>`;
          }
          // Points
          if (d.y1 > -1 && d.y2 > -1) {
            html += `<div class="page-candlestick-point ${d.className1}" style="top: ${pointY1Pos}px; left: ${xPos}px"></div>`;
            html += `<div class="page-candlestick-point ${d.className2}" style="top: ${pointY2Pos}px; left: ${xPos}px"></div>`;
            if (Math.abs(pointY1Pos - pointY2Pos) > 3) {
              html += `<div class="page-candlestick-point-connector ${d.className2}-${d.className1}" style="height: ${pointY1Pos - pointY2Pos}px; top: ${pointY2Pos}px; left: ${xPos}px"></div>`;
            }
          }
        });
        // Y-Axis
        uniqueYValues.forEach(u => {
          const xPos = 20;
          const x2Pos = chartWidth - 20;
          const yPos = y(u);
          const level = SUBS[ch.key].limits.indexOf(u);
          // Markers
          if (level > -1) {
            html += `<div class="page-candlestick-y-axis-marker level-${level}" style="top: ${yPos}px;"></div>`;
            html += `<div class="page-candlestick-y-axis-marker-label level-${level}" style="top: ${yPos}px;">${u} <span>${((level === (SUBS[ch.key].limits.length - 1)) ? SUBS[ch.key].unit : '')}</span></div>`;
          } else if (u > 0) {
            // Thicks
            html += `<div class="page-candlestick-y-axis-thick ${(level > -1) ? 'level-' + level : ''}" style="left: ${xPos}px; top: ${yPos}px"></div>`;
            html += `<div class="page-candlestick-y-axis-label" style="top: ${yPos}px;">${u}</div>`;
          }
        });
        $container.innerHTML = html;
      }
    });
  };

  const drawMaps = () => {
    let html = '';
    maps.forEach(m => {
      html += `<div class="page-map page-map-${m.index}" data-sub="${m.id}" id="page-map-${m.id}">`;
      html += `<div class="page-map-title"><h2>${m.label}</h2></div>`;
      html += `<div class="page-map-legend-unit">${SUBS[m.id].code} - ${SUBS[m.id].unit}</div>`;
      html += `<div class="page-map-legend">`;
      SUBS[m.id].limits.forEach((l, i) => {
          html += `<div class="page-map-legend-item level-${i}"><${l}</div>`;
      });
      html += `<div class="page-map-legend-item level-${SUBS[m.id].limits.length}">≥${SUBS[m.id].limits[SUBS[m.id].limits.length - 1]}</div>`;
      html += `<div class="page-map-legend-item level-neutral">n.d.</div>`;
      html += `</div>`;
      html += '<div class="page-map-container">';
      m.markers.forEach((mk, j) => {
          html += `<div class="marker marker-${mk.index} ${mk.className}" id="marker-${m.index}-${mk.index}">${mk.id}</div>`;
      });
      html += '</div>';
      html += '</div>';
    });
    $mapContainer.innerHTML = html;
  };

  const prepareData = data => {
    rawData = data.data.records;

    const firstDay = moment(rawData[0].data);
    const lastDay = moment(rawData[0].data).subtract(DAYS, 'days');
    // Substances
    rawData.forEach(d => {
      if (substances.indexOf(d.inquinante.toUpperCase()) === -1) { substances.push(d.inquinante.toUpperCase()) }
    });
    // Maps
    const keys = Object.keys(SUBS);
    keys.forEach((key, i) => {
      if (substances.indexOf(key) > -1) {
        const sorted = rawData.filter(d => (d.data === firstDay.format('YYYY-MM-DDTHH:mm:ss') && d.inquinante.toUpperCase() === key));
        maps.push({
          id: key,
          index: i,
          label: SUBS[key].name,
          chart: {
            limits: SUBS[key].limits,
            values: (() => {
              const values = [];
              let level = 'level-neutral';
              sorted.forEach(s => {
                let k = 0;
                const top = SUBS[key].limits.length;
                if (s.valore > SUBS[key].limits[top - 1]) {
                  level = `level-${top}`;
                } else {
                  let found = false;
                  while (!found && k < top) {
                    if (s.valore <= SUBS[key].limits[k]) {
                      found = true;
                      level = `level-${k}`;
                    }
                    k++;
                  }
                }
                if (s.valore) {
                  values.push({
                    value: s.valore,
                    className: level,
                    station: STATIONS.find(st => st.id === s.stazione_id),
                  });
                }
              });
              return values;
            })(),
          },
          markers: (() => {
            const markers = [];
            STATIONS.forEach((s, j) => {
              markers.push({
                id: s.id,
                index: j,
                className: (() => {
                  const today = rawData.find(d => (d.data === firstDay.format('YYYY-MM-DDTHH:mm:ss') && d.inquinante.toUpperCase() === key && d.stazione_id === s.id));
                  if (!today || today.valore === null) {
                    return 'level-neutral';
                  }
                  let k = 0;
                  const top = SUBS[key].limits.length;
                  if (today.valore > SUBS[key].limits[top - 1]) {
                    return `level-${top}`;
                  }
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
        let currentDay = moment(rawData[0].data);
        let allCandleStickData = {};
        while (currentDay.valueOf() >= lastDay.valueOf()) {
          allCandleStickData[moment(currentDay).format('YYYY-MM-DD')] = rawData.filter(d => (d.data === currentDay.format('YYYY-MM-DDTHH:mm:ss') && d.inquinante.toUpperCase() === key));
          currentDay.subtract(1, 'days');
        }
        candlesticks.push({
          id: key,
          key,
          index: i,
          label: SUBS[key].name,
          code: SUBS[key].code,
          limits: SUBS[key].limits,
          data: (() => {
            const cData = [];
            const days = Object.keys(allCandleStickData);
            days.forEach(d => {
              const values = allCandleStickData[d].map(acd => acd.valore).filter(acd => acd !== null);
              const y1 = (values.length) ? Math.min(...values) : -1;
              const y2 = (values.length) ? Math.max(...values) : -1;
              let className1 = 'level-neutral';
              let className2 = 'level-neutral';
              const top = SUBS[key].limits.length;
              if (y1 > SUBS[key].limits[top - 1]) {
                level = `level-${top}`;
              } else {
                let k = 0;
                let found = false;
                while (!found && k < top) {
                  if (y1 <= SUBS[key].limits[k]) {
                    found = true;
                    className1 = `level-${k}`;
                  }
                  k++;
                }
              }
              if (y2 > SUBS[key].limits[top - 1]) {
                level = `level-${top}`;
              } else {
                let k = 0;
                let found = false;
                while (!found && k < top) {
                  if (y2 <= SUBS[key].limits[k]) {
                    found = true;
                    className2 = `level-${k}`;
                  }
                  k++;
                }
              }
              cData.push({
                date: moment(d).format('YYYY-MM-DDTHH:mm:ss'),
                x: moment(d).valueOf(),
                y1,
                className1,
                y2,
                className2,
              });
            });
            return cData;
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
                const currentData = rawData.filter(d => (d.inquinante.toUpperCase() === key && d.stazione_id === s.id && d.valore !== null && moment(d.data).valueOf() >= lastDay.valueOf()));
                if (currentData && currentData.length) {
                  currentData.forEach(cd => {
                    data.push({
                      date: moment(cd.data).format('YYYY-MM-DD'),
                      x: moment(cd.data).valueOf(),
                      y: cd.valore || -1,
                      className: (() => {
                        if (cd.valore === null) {
                          return 'level-neutral';
                        }
                        let k = 0;
                        const top = SUBS[key].limits.length;
                        if (cd.valore > SUBS[key].limits[top - 1]) {
                          return `level-${top}`;
                        }
                        while (k < top) {
                          if (cd.valore <= SUBS[key].limits[k]) {
                            return `level-${k}`;
                          }
                          k++;
                        }
                      })()
                    });
                  });
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
    fetch(URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Server Error while Loading Data');
        }
        return response.json();
      })
      .then(jsonData => {
        if (!jsonData.error) {
          prepareData(jsonData);
          drawMaps();
          drawChartsContainers();
          window.addEventListener('resize', reset);
          reset();
          let locationOfStations = '';
          STATIONS.forEach((s,i) => {
            locationOfStations += `<span class="stationId">${s.id}</span> <strong>${s.name}</strong>`;
            if (i < STATIONS.length - 1) {
              locationOfStations += ', ';
            }
          });
          document.querySelectorAll('.writeDays').forEach(e => { e.innerHTML = DAYS });
          document.querySelector('#numberOfStations').innerHTML = STATIONS.length;
          document.querySelectorAll('.locationOfStations').forEach(e => { e.innerHTML = locationOfStations });
          document.querySelector('#date').innerHTML = moment(rawData[0].data).format('DD/MM/YYYY');
          document.querySelector('body').classList.add('exit');
          setTimeout(() => { document.querySelector('body').classList.remove('loading'); document.querySelector('body').classList.remove('exit'); }, 501);
        } else {
          alert('Error loading data');
          throw new Error('Error Loading Data', jsonData.message);
        }
      })
      // .catch(
      //   e => {
      //     alert('Error loading data');
      //     throw new Error('Error Loading Data', e);
      //   }
      // );
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