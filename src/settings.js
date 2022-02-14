export const endpoint = 'https://api-aria.mia.mi.it/latest';

export const limits = {
  BC: [],
  C6H6: [2, 3, 4, 5],
  NO: [40, 100, 200, 400],
  NO2: [40, 100, 200, 400],
  O3: [80, 120, 180, 240],
  PM10: [20, 35, 50, 100],
  PM25: [20, 35, 50, 100],
  SO2: [50, 125, 350, 500],
}

export const excludeMap = ['BC'];

export const pushValue = (t, v) => {
  t.push(v);
  return [...t];
}

export const fixDate = (t) => new Date(t.trim().replace(/ /ig, 'T'));

export const aggregateValuesBySensor = (id, sensors, data) => {
  let output = {};
  sensors.forEach((s) => {
    output[s] = [];
    const tmpData = data.values.filter(d => d.SensorId === s);
    tmpData.forEach((d) => {
      const date = fixDate(d.Date);
      const day = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
      );
      const index = output[s].findIndex((d) => d.x.getTime() === day.getTime());
      if (index === -1) {
        output[s].push({
          x: day,
          values: [Number(d.Value)],
          avg: 0,
          max: 0,
          min: 0
        });
      } else {
        output[s][index].values.push(Number(d.Value));
      }
    });
    output[s] = output[s].sort(
      (a, b) => b.x.getTime() - a.x.getTime()
    ).map(d => {
      d.max = Math.max(...d.values);
      d.min = Math.min(...d.values);
      d.avg = d.values.reduce((a, b) => a + b, 0) / d.values.length;
      return d;
    });
  });
  return output;
};

export const createSubstancesList = (records) => {
  const substances = [];
  records.data.sensors.forEach((s) => {
    const index = substances.findIndex((d) => d.code === s.Substance)
    if (index === -1) {
      substances.push({
        code: s.Substance,
        unit: s.Unit,
        name: s.SubstanceName,
        description: s.Description,
        sort: s.SortOrder,
        sensors: [ s.SensorId ],
      });
    } else {
      substances[index].sensors.push(s.SensorId);
    }
  });
  return substances.sort((a, b) => a.sort - b.sort);
}

export const aggregateValuesBySubstance = (substanceId, data) => {
  let output = [];
  let tmpData = [];
  const sensors = data.sensors.filter(
    (d) => d.Substance === substanceId
  );
  sensors.forEach((s) => {
    tmpData = tmpData.concat(
      data.values.filter((d) => d.SensorId === s.SensorId)
    );
  });
  tmpData.forEach((d) => {
    const date = fixDate(d.Date);
    const day = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0
    );
    const index = output.findIndex((d) => d.x.getTime() === day.getTime());
    if (index === -1) {
      output.push({
        x: day,
        values: [Number(d.Value)],
        avg: 0,
        max: 0,
        min: 0
      });
    } else {
      output[index].values.push(Number(d.Value));
    }
  });		
  output = output.sort(
    (a, b) => b.x.getTime() - a.x.getTime()
  ).map(d => {
    d.max = Math.max(...d.values);
    d.min = Math.min(...d.values);
    d.avg = d.values.reduce((a, b) => a + b, 0) / d.values.length;
    return d;
  });
  return { sensors: sensors.sort((a,b) => Number(a.StationId) - Number(b.StationId)), data: output };
}

export const createRelations = (stationsList, records) => {
  const relations = {};
  stationsList.forEach((s) => {
    relations[s.id] = records.data.sensors.filter(f => Number(f.StationId) === s.id).map(m => m.SensorId);
  });
  return relations;
};

export const createStationsList = (records) => {
  const stations = [];
  records.data.sensors.forEach((s) => {
    if (!stations.find((d) => d.name === s.Name)) {				
      stations.push({ name: s.Name, id: Number(s.StationId), location: s.Location, displayIndex: (Number(s.StationId) + 1) });
    }
  });
  return stations.sort((a, b) => a.id - b.id);
};

export const matchSensorsToSubstance = (sub, sensor) => {
  return sub.sensors.find(d => d === sensor) ? true : false;
}

export const showMap = (sub, stations, latestAvailableData, createStationsList, stationsToSensors) => {
  if (excludeMap.find(d => d === sub.code)) {
    return false;
  }
  let returnValue = false;
  const sensors = sub.sensors;
  const keys = Object.keys(stations);
  returnValue = sensors.some((s) => {
    return keys.some((st) => {
      if (
        stations[st][s]
        && stations[st][s].length > 0
        && stations[st][s].find(d => d.x.getTime() === latestAvailableData.getTime())
      ) {
        return true;
      }
    });
  });
  return returnValue;
};
