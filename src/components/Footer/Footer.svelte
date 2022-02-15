<script>
  export let latestAvailableData = new Date();

  let legal = '';
  let corporate = '';

  const loadData = async () => {
    fetch(document.querySelector('#corporate').getAttribute('href'))
      .then(response => response.text())
      .then(text => { corporate = text; });
    fetch(document.querySelector('#legal').getAttribute('href'))
      .then(response => response.text())
      .then(text => { legal = text; });
  };

  loadData();
</script>

<main>
  <footer class="page-footer">
    <div class="wrapper">
      <div class="column">
        <h3>Fonti</h3>
        <p>I dati vengono raccolti e aggregati almeno due volte al giorno dalle API <a href="https://www.dati.lombardia.it" targe="_regione">Open Data della Regione Lombardia</a>.
          <!-- <a href="https://www.esa.int/ESA_Multimedia/Images/2015/06/Milan_Italy">Immagine satellitare</a> © <a href="https://www.esa.int/">ESA</a>. -->
        </p><p>Ultimo aggiornamento dei dati: <span class="dynDate">{new Intl.DateTimeFormat('it-IT', {
          format: 'short'
        }).format(latestAvailableData)}</span>.</p>
      </div>
      <div class="column">
        <h3>Copyright</h3>
        <p>© {new Intl.DateTimeFormat('it-IT', {
          year: 'numeric'
        }).format(latestAvailableData)} <a href="https://visualize.news" target="_visualize">Visualize.News</a> – Tutti i diritti riservati. Tutte le immagini e i testi © dei rispettivi proprietari. Questo sito è stato progettato e realizzato da <a href="https://simonelippolis.com" target="_simone">Simone Lippolis</a>. Grafici generati con <a href="https://blog.chrt.io" target="_chrt">Chrt.io</a>.</p>
        <div id="footer-legal">
          {@html legal}
        </div>
      </div>
      <div class="column" id="footer-corporate">
        {@html corporate} 
      </div>
    </div>
  </footer>
</main>