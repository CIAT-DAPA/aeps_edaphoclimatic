window.jsPDF = window.jspdf.jsPDF

    //     Alertas

    var toastLive = document.getElementById('liveToast')
    var toast = new bootstrap.Toast(toastLive)
    var toastBody = document.getElementById('toast-body')
    var spinner = document.getElementById('spinner')

    //      Btn-save

    var btnSave = document.getElementById('btn-save')
    btnSave.setAttribute("style", "display: none;")
    var containerDatos = document.getElementById("container-datos")
    var infodatos, datos

    //      Descripciones

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    //      MAPA              

    var map = L.map('map', {
      maxBounds: [[5, -72.6], [6, -74]]
    }).
      setView([5.48, -73.334],
        11);
    var marker = L.marker([0.0, 0.0])

    //    Mapas base
    //    Street

    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 8,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Light

    var Stadia_AlidadeSmooth = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      minZoom: 8,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    //  Satelital

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; the GIS User Community',
      maxZoom: 17,
      minZoom: 8,
    });

    var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      maxZoom: 17,
      ext: 'png'
    });

    var satelite = L.layerGroup([Esri_WorldImagery, Stamen_TonerLabels])

    var mapasBase = {
      "Default": Stadia_AlidadeSmooth,
      "Street": OpenStreetMap_Mapnik,
      'Satelite': Esri_WorldImagery,
    }

    function getColor(d) {
      return d == 'Samacá' ? "#40ff00" :
        d == 'Ventaquemada' ? "#eee01b" :
          d == 'Siachoque' ? "#ff00dd" :
            d == 'Motavita' ? "#ff9900" :
              d == 'Soracá' ? "#ff0000" :
                d == 'Tunja' ? "#24c2af" :
                  d == 'Toca' ? "#0048ff" :
                    d == 1 ? "#4C00FF" :
                      d == 2 ? "#0019FF" :
                        d == 3 ? "#0080FF" :
                          d == 4 ? "#00E5FF" :
                            d == 5 ? "#00FF4D" :
                              d == 6 ? "#4DFF00" :
                                d == 7 ? "#E6FF00" :
                                  d == 8 ? "#eee01b" :
                                    d == 9 ? "#FFDE59" :
                                      "#FFE0B3"
    }

    //   Geojson Clusters

    var capCluster = L.geoJSON(clusters, {
      style: function (feature) {
        return {
          color: getColor(feature.properties.Cluster),
          weight: 1,
          fillOpacity: 0.5
        }
      }
    })

    var legendClusters = L.control({ position: 'bottomleft' });

    legendClusters.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
        labels = ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5', 'Zona 6', 'Zona 7', 'Zona 8', 'Zona 9', 'Zona 10'];
      for (var i = 0; i < labels.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(i + 1) + '"></i> ' +
          labels[i] + '<br>';
      }
      return div;
    };

    //   Geojson Municipios

    var capMunicipios = L.geoJSON(municipios, {
      style: function (feature) {
        return {
          color: getColor(feature.properties.municipios),
          weight: 1,
        }
      }
    }).addTo(map)

    var legendMunicipios = L.control({ position: 'bottomleft' });

    legendMunicipios.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
        labels = ['Samacá', 'Ventaquemada', 'Motavita', 'Siachoque', 'Soracá', 'Toca', 'Tunja'];
      for (var i = 0; i < labels.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(labels[i]) + '"></i> ' +
          labels[i] + '<br>';
      }
      return div;
    };

    legendMunicipios.addTo(map)

    //  GeoJson zona de estudio

    var capZonaEstudio = L.geoJSON(zonaEstudio, {
      style: function (feature) {
        return {
          color: "#000000",
          weight: 1,
        }
      }
    })

    var overLay = {
      "Municipios": capMunicipios,
      "Zona de Estudio": capZonaEstudio,
      "Zonas Edafoclimáticas": capCluster,
    }

    var layerControl = L.control.layers(mapasBase, overLay).addTo(map)

    // Funciones del mapa
    map.on('click', function (e) {
      document.getElementById("longitud").value = e.latlng.lng
      document.getElementById("latitud").value = e.latlng.lat
      consulta()
    });

    map.on('locationfound', function (e) {
      document.getElementById("longitud").value = e.latlng.lng
      document.getElementById("latitud").value = e.latlng.lat
      consulta()
      lc.stop()
    });

    map.on('overlayadd', function (eventLayer) {
      if (eventLayer.name === 'Municipios') {
        map.addControl(legendMunicipios);
      } else if (eventLayer.name === 'Zonas Edafoclimáticas'){
        map.addControl(legendClusters);
      }
    })

    map.on('overlayremove', function (eventLayer) {
      if (eventLayer.name === 'Municipios') {
        map.removeControl(legendMunicipios);
      } else if (eventLayer.name === 'Zonas Edafoclimáticas') {
        map.removeControl(legendClusters);
      }
    })

    map.on('locationerror', function (e) {
      console.log(e);
      console.log("Acceso a la ubicación denegado.");
      containerDatos.innerHTML = `<p class="m-4 bg-light p-4 border rounded">Por favor ingrese una Latitud y Longitud o de click en un punto del mapa para visualizar los datos</p>`
      toastBody.innerHTML = "Acceso a la ubicación denegado."
      toastLive.setAttribute("style", "background-color: #ff3636e3;");
      marker.remove(map)
      spinner.setAttribute("style", "display: none;");
      toast.show()
      btnSave.setAttribute("style", "display: none;");
    });

    // buscar ubicacion con gps

    var lc = L.control.locate({
      strings: {
        title: "Busca tu ubicación"
      },
      flyTo: true,
      locateOptions: {
        maxZoom: 14
      },
      drawMarker: false,
      onLocationError: function (e) {
        console.log(e);
        console.log("Acceso a la ubicación denegado.");
      },
    }).addTo(map);

    //     Llamado info

    $.ajax({
      url: `/api/v1/infodatos`,
      type: "GET",
      data: {},
      success: function (response) {
        console.log("Informacion de los datos: ", response)
        infodatos = response
        toastBody.innerHTML = "Datos cargados"
        toastLive.setAttribute("style", "background-color: rgb(27 243 69 / 85%);");
        spinner.setAttribute("style", "display: none;");
        toast.show()
      },
      error: function (error) {
        console.log(error);
        toastBody.innerHTML = "Error de conexion, intente mas tarde"
        toastLive.setAttribute("style", "background-color: #ff3636e3;");
        spinner.setAttribute("style", "display: none;");
        toast.show()
      },
    });


    function consulta() {
      let longitud = document.getElementById("longitud").value;
      let latitud = document.getElementById("latitud").value;
      var info = document.getElementById("info")
      marker.remove(map)
      spinner.setAttribute("style", "display: ;");
      btnSave.setAttribute("style", "display: none;");
      toastLive.setAttribute("style", "background-color: #fdfdfd;");
      toastBody.innerHTML = "Buscando datos..."
      toast.show()
      $.ajax({
        url: `/api/v1/data?longitude=${longitud}&latitude=${latitud}`,
        type: "GET",
        data: {},
        success: function (response) {
          console.log(`con longitud: ${longitud} y latitud: ${latitud}`)
          console.log('respuesta: ', response)
          if (response.message) {
            containerDatos.innerHTML = `<p class="m-4 bg-light p-4 border rounded">Por favor ingrese una Latitud y Longitud o de click en un punto
            del mapa para visualizar los datos. <br><br>
            Más información pulsar el botón <strong>Info</strong>.</p>`
            toastBody.innerHTML = response.message
            toastLive.setAttribute("style", "background-color: #ffff00d1;");
            spinner.setAttribute("style", "display: none;");
            toast.show()
          }
          else {
            containerDatos.innerHTML = "";
            datos = response;
            marker.setLatLng([latitud, longitud]).addTo(map);
            map.flyTo([latitud, longitud], 14);
            const categorias = infodatos.categorias;
            for (const categoria in categorias) {
              containerDatos.insertAdjacentHTML('beforeend',
                `<div class="accordion-item">
                  <h3 class="accordion-header" id="heading${categoria}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${categoria}" aria-expanded="true" aria-controls="collapse${categoria}" style="font-size: 1.5rem;">
                    ${categorias[categoria].nombre}
                    </button>
                  </h3>
                  <div id="collapse${categoria}" class="accordion-collapse collapse show" aria-labelledby="heading${categoria}" data-bs-parent="#accordion${categoria}">
                    <div class="accordion-body" id="accordion-body-${categoria}">`
              )

              const accordionBody = document.getElementById(`accordion-body-${categoria}`)

              const variables = categorias[categoria].variables
              // Renderizado tabla de zonifiacion Edafoclimatica
              if (categoria == 'zonas') {
                console.log('respuesta clusters', response['cluster'])
                if (response['cluster'].message) {
                  accordionBody.insertAdjacentHTML('beforeend',
                    `<p class=" bg-light p-4 border rounded">${response['cluster'].message}</p>`
                  );
                } else {
                  const cluster = response['cluster']
                  let tabla = ''
                  for (const variable in cluster) {
                    if (variable !== 'numCluster') {
                      let num = 1
                      const count = Object.keys(cluster[variable]).length
                      tabla += `<tr><td rowspan="${count}" class="align-middle">${infodatos[variable].nombre} ${infodatos[variable].unidad && '(' + infodatos[variable].unidad + ')'}</td>`
                      if (Object.hasOwnProperty.call(cluster, variable)) {
                        const datosVariable = cluster[variable];
                        for (const rango in datosVariable) {
                          if (Object.hasOwnProperty.call(datosVariable, rango)) {
                            const porcentaje = datosVariable[rango];
                            if (num !== 1)
                              tabla += '<tr>'
                            tabla += `<td>${rango}</td><td>${porcentaje} %</td></tr>`
                          }
                        }
                      }
                    }
                  }
                  accordionBody.insertAdjacentHTML('beforeend',
                    `<p class=" bg-light p-4 border rounded">Usted se encuentra dentro de la <strong>zona edafoclimática 
                      ${cluster.numCluster}</strong></p>`
                  );
                  accordionBody.insertAdjacentHTML('beforeend',
                    `<table class="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th scope="col" class="colmVariable">Variable</th>
                          <th scope="col">Rango</th>
                          <th scope="col">Porcentaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${tabla}
                      </tbody>
                    </table>`
                  );
                }
              } else {
                // renderizado tarjetas con informacion del punto
                variables.forEach(key => {
                  const element = response[key];
                  const nombre = infodatos[key].nombre;
                  const unidad = infodatos[key].unidad;
                  const descripcion = infodatos[key].descripcion;
                  const sigla = infodatos[key].sigla;
                  accordionBody.insertAdjacentHTML('beforeend',
                    `<div class="card my-3">
                      <h5 class="card-header"> ${nombre} ${sigla && " - " + sigla} ${unidad && " (" + unidad + ")"}
                        ${descripcion && '<a class="d-inline-block" data-bs-toggle="tooltip" title="' + descripcion + '">' +
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                          </svg>
                        </a>`}
                      </h5>
                      <div class="card-body">
                        <p class="card-text">${element}</p>
                      </div>
                    </div>`
                  );
                });
              }
              if (categoria == "textura_suelo") {
                const textura = infodatos.categorias.textura_suelo.variables.filter(variable => variable != "textura")
                const series = textura.map(element => response[element]);
                const labels = textura.map(element => infodatos[element].nombre)
                accordionBody.insertAdjacentHTML('beforeend', '<div id="chart-textura"> </div>')
                chartRadialBar(series, labels, response["simboloTextu"])
              } else if (categoria == "relaciones") {
                const relaciones = infodatos.categorias.relaciones
                const data = relaciones.variables.map(element => response[element]);
                const categories = relaciones.variables.map(element => infodatos[element].nombre.replace("Relación catiónica ", ""))
                accordionBody.insertAdjacentHTML('beforeend', '<div id="chart-relaciones"> </div>')
                chartBar(data, categories)
              }
            }
            tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
              return new bootstrap.Tooltip(tooltipTriggerEl)
            })

            toastBody.innerHTML = "Datos cargados"
            toastLive.setAttribute("style", "background-color: rgb(27 243 69 / 85%);");
            spinner.setAttribute("style", "display: none;");
            btnSave.style.removeProperty("display")
            toast.show()
          }
        },
        error: function (error) {
          console.log(error);
          containerDatos.innerHTML = `<p class="m-4 bg-light p-4 border rounded">Por favor ingrese una Latitud y Longitud o de click en un punto
            del mapa para visualizar los datos. <br><br>
            Más información pulsar el botón <strong>Info</strong>.</p>`
          toastBody.innerHTML = "Error de conexion, intente mas tarde"
          toastLive.setAttribute("style", "background-color: #ff3636e3;");
          spinner.setAttribute("style", "display: none;");
          toast.show()
        },
      });
    }

    // Propiedades y pintado de Grafica de barras para relaciones entre elementos
    function chartBar(data, categories) {
      var options = {
        series: [{
          name: "Relación",
          data: data
        }],
        chart: {
          height: 350,
          type: 'bar'
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              fontSize: '12px'
            }
          },
          title: {
            text: 'Relaciones catiónicas'
          }
        },
        yaxis: {
          labels: {
            formatter: function (val, index) {
              return val.toFixed(2);
            }
          },
        }
      };

      var chart = new ApexCharts(document.querySelector("#chart-relaciones"), options);
      chart.render();
    }

    // Propiedades y pintado de Grafica de radialbar para textura de suelos
    function chartRadialBar(series, labels, clase) {
      var options = {
        series: series,
        chart: {
          height: 390,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
              margin: 5,
              size: '40%',
              background: 'transparent',
            },
            dataLabels: {
              name: {
                fontSize: '22px',
              },
              value: {
                fontSize: '16px',
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Clase textural',
                formatter: function (w) {
                  return clase
                }
              }
            }
          }
        },
        labels: labels,
        legend: {
          show: true,
          floating: true,
          fontSize: '16px',
          position: 'left',
          offsetX: 19,
          offsetY: 14,
          labels: {
            useSeriesColors: true,
          },
          markers: {
            size: 0
          },
          formatter: function (seriesName, opts) {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%"
          },
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              show: true
            }
          }
        }]
      };

      var chart = new ApexCharts(document.querySelector("#chart-textura"), options);
      chart.render();
    }

    // Funcion para generar pdf con los datos
    function pdf() {

      const longitud = document.getElementById("longitud").value;
      const latitud = document.getElementById("latitud").value;
      const nombreUsuario = document.getElementById("nombreUsuario").value;

      var doc = new jsPDF({
        orientation: "p",
        format: "letter"
      });

      const docWidth = doc.internal.pageSize.width;
      const docHeight = doc.internal.pageSize.height;

      const pdfConfig = {
        headerTextSize: 15,
        labelTextSize: 12,
        fieldTextSize: 10,
        lineHeight: 6,
        subLineHeight: 4,
        cell: 15
      };

      //inicia a 15mm
      var currentHeight = 15

      //      Encabezado

      doc.addImage("/static/assets/img/logo.png", "PNG", 10, 10, 100, 30)

      currentHeight += pdfConfig.subLineHeight;
      currentHeight += pdfConfig.subLineHeight;
      doc.setFontSize(pdfConfig.fieldTextSize);
      doc.text(docWidth - 10, currentHeight, "boyacaseadapta@gmail.com", "right");
      currentHeight += pdfConfig.subLineHeight;
      doc.text(docWidth - 10, currentHeight, "https://www.boyacaseadapta.com", "right");

      currentHeight += pdfConfig.subLineHeight;
      doc.text(docWidth - 10, currentHeight, "https://twitter.com/boyacaseadaptac", "right");

      currentHeight += pdfConfig.subLineHeight;
      doc.text(docWidth - 10, currentHeight, "https://www.facebook.com/BoyacaSeAdaptaC", "right");

      currentHeight += pdfConfig.subLineHeight;
      doc.line(10, currentHeight, docWidth - 10, currentHeight);

      //    Informacion

      doc.setFontSize(pdfConfig.fieldTextSize);
      currentHeight += pdfConfig.lineHeight;

      doc.text(10, currentHeight, "Consultado por:");
      currentHeight += pdfConfig.lineHeight;

      doc.setFontSize(pdfConfig.headerTextSize);
      doc.text(10, currentHeight, nombreUsuario);
      currentHeight += pdfConfig.lineHeight;

      doc.setFontSize(pdfConfig.fieldTextSize);

      doc.text(10, currentHeight, `Longitud: ${longitud}`);
      doc.text(docWidth - 10, currentHeight, `Fecha de consulta:`, "right");
      currentHeight += pdfConfig.lineHeight;

      doc.text(10, currentHeight, `Latitud: ${latitud}`);
      doc.text(docWidth - 10, currentHeight, new Date(Date.now()).toLocaleDateString(), "right");
      currentHeight += pdfConfig.subLineHeight * 3;

      //   Mensaje de introduccion

      doc.setFontSize(pdfConfig.headerTextSize);
      doc.text(docWidth / 2, currentHeight, "Perfil de fertilidad de suelos, basado en Big Data", "center");
      currentHeight += pdfConfig.subLineHeight;
      currentHeight += pdfConfig.subLineHeight;

      doc.setFontSize(pdfConfig.fieldTextSize);
      let lines = doc.splitTextToSize("Este resultado es una aproximación a las características de sus suelos, basado en análisis de información, a partir de una malla rígida, capturada por los profesionales del proyecto. No reemplaza un análisis de suelo convencional, pero le servirá de guía para la toma de decisiones.", docWidth - 20);
      doc.text(lines, 10, currentHeight);

      //   Datos

      currentHeight += pdfConfig.subLineHeight * 4;

      const categorias = infodatos.categorias;
      for (const categoria in categorias) {

        if (currentHeight + 35 > docHeight - 20 || categoria == 'zonas') {
          doc.addPage()
          doc.addImage("/static/assets/img/logo.png", "PNG", 10, 10, 100, 30)
          doc.line(10, 39, docWidth - 10, 39);
          currentHeight = 51
        }

        doc.setFontSize(pdfConfig.headerTextSize);
        doc.text(docWidth / 2, currentHeight, categorias[categoria].nombre, "center");

        currentHeight += pdfConfig.subLineHeight;
        currentHeight += pdfConfig.subLineHeight;

        const variables = categorias[categoria].variables
        if (categoria == 'zonas') {
          const cluster = datos['cluster']
          const me = `Usted se encuentra dentro de la zona edafoclimática ${cluster.numCluster}`
          doc.setFontSize(pdfConfig.fieldTextSize);
          let lines = doc.splitTextToSize(`Usted se encuentra dentro de la zona edafoclimática ${cluster.numCluster}.`, docWidth - 20);
          doc.text(lines, 10, currentHeight);
          currentHeight += pdfConfig.subLineHeight;
          doc.setFontSize(pdfConfig.headerTextSize);

          doc.cell(10, currentHeight, (docWidth / 3) , pdfConfig.cell , `Variable`);
          doc.cell((docWidth / 3) + 10, currentHeight, (docWidth / 3) - 10, pdfConfig.cell , `Rangos`);
          doc.cell((docWidth / 1.5) , currentHeight, (docWidth / 3) - 10, pdfConfig.cell , `Porcentajes`);
          currentHeight += pdfConfig.cell;

          for (const variable in cluster) {
            if (variable !== 'numCluster') {

              const count = Object.keys(cluster[variable]).length
              if (currentHeight + (pdfConfig.cell * count) > docHeight - 20) {
                doc.addPage()
                doc.addImage("/static/assets/img/logo.png", "PNG", 10, 10, 100, 30)
                doc.line(10, 39, docWidth - 10, 39);
                currentHeight = 51
              }
              doc.cell(10, currentHeight, (docWidth / 3) , pdfConfig.cell * count, `${infodatos[variable].nombre} ${infodatos[variable].unidad && '(' + infodatos[variable].unidad + ')'}`);
              if (Object.hasOwnProperty.call(cluster, variable)) {
                const datosVariable = cluster[variable];
                for (const rango in datosVariable) {
                  if (Object.hasOwnProperty.call(datosVariable, rango)) {
                    const porcentaje = datosVariable[rango];
                    doc.cell((docWidth / 3) + 10 , currentHeight, (docWidth / 3) - 10, pdfConfig.cell , rango);
                    doc.cell((docWidth / 1.5), currentHeight, (docWidth / 3) - 10, pdfConfig.cell , `${porcentaje}`);
                    currentHeight += pdfConfig.cell;
                  }
                }
              }
            }
          }
        } else {
          for (let index = 0; index < variables.length; index += 2) {

            if (currentHeight + 30 > docHeight - 20) {
              doc.addPage()
              doc.addImage("/static/assets/img/logo.png", "PNG", 10, 10, 100, 30)
              doc.line(10, 39, docWidth - 10, 39);
              currentHeight = 51
            }
            const key = variables[index];
            const key2 = variables[index + 1]

            const element = datos[key];
            const nombre = infodatos[key].nombre;
            const unidad = infodatos[key].unidad;
            const sigla = infodatos[key].sigla;
            const element2 = key2 ? datos[key2] : "";
            const nombre2 = key2 ? infodatos[key2].nombre : "";
            const unidad2 = key2 ? infodatos[key2].unidad : "";
            const sigla2 = key2 ? infodatos[key2].sigla : "";

            doc.cell(10, currentHeight, (docWidth / 2) - 10, pdfConfig.cell, `${nombre}${sigla && " - " + sigla}${unidad && " (" + unidad + ")"}`);
            doc.cell(docWidth / 2, currentHeight, (docWidth / 2) - 10, pdfConfig.cell, `${nombre2}${sigla2 && " - " + sigla2}${unidad2 && " (" + unidad2 + ")"}`);
            currentHeight += pdfConfig.cell;

            doc.cell(10, currentHeight, (docWidth / 2) - 10, pdfConfig.cell, `${element}`);
            doc.cell(docWidth / 2, currentHeight, (docWidth / 2) - 10, pdfConfig.cell, `${element2}`);

            currentHeight += pdfConfig.cell;
          }
        }

        currentHeight += pdfConfig.subLineHeight;
        currentHeight += pdfConfig.subLineHeight;

      }
      doc.save(`suelo-${nombreUsuario}`)
    }