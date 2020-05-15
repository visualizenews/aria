const URL = 'http://dati.comune.milano.it/api/3/action/datastore_search?resource_id=88c1e729-420e-433f-9397-875b54aa471d&limit=380';
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

(() => {
  const main = () => {
    // alert();
    fetch(
      URL,
      {
        mode: 'no-cors'
      })
      .then(response => { console.log(response, response.body); response.json() })
      .then(data => console.log(data));
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