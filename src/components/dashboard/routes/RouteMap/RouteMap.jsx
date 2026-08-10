
import {
  useEffect,
  useMemo
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import {
  LatLngBounds,
  divIcon
} from "leaflet";

import "leaflet/dist/leaflet.css";

import "./RouteMap.css";


/* ======================================================
   COLORES SEGÚN ESTADO DE LA VISITA
====================================================== */

const VISIT_COLORS = {

  "Pendiente": "#64748b",

  "Cobrado": "#16a34a",

  "Pago parcial": "#eab308",

  "No pagó": "#dc2626",

  "No atendió": "#f97316",

  "Reprogramado": "#2563eb"

};


/* ======================================================
   CREAR ICONO DEL MARCADOR
====================================================== */

function createMarkerIcon(status) {

  const color =
    VISIT_COLORS[status] ||
    VISIT_COLORS["Pendiente"];


  return divIcon({

    className: "",

    html: `
      <div
        class="route-map__marker"
        style="--marker-color: ${color};"
      >
        <span></span>
      </div>
    `,

    iconSize: [
      28,
      28
    ],

    iconAnchor: [
      14,
      14
    ],

    popupAnchor: [
      0,
      -18
    ]

  });

}


/* ======================================================
   AJUSTAR MAPA A LOS CLIENTES
====================================================== */

function MapBounds({
  clients
}) {

  const map = useMap();


  useEffect(() => {

    if (!clients.length) {

      return;

    }


    const bounds =
      new LatLngBounds(

        clients.map(client => [

          Number(
            client.latitude
          ),

          Number(
            client.longitude
          )

        ])

      );


    map.fitBounds(

      bounds,

      {

        padding: [
          40,
          40
        ],

        maxZoom: 15

      }

    );


  }, [

    clients,

    map

  ]);


  return null;

}


/* ======================================================
   MAPA DE RUTA
====================================================== */

function RouteMap({

  clients = [],

  visits = []

}) {


  /* ====================================================
     CLIENTES CON UBICACIÓN
  ==================================================== */

  const clientsWithLocation =
    clients.filter(

      client =>

        Number.isFinite(
          Number(
            client.latitude
          )
        ) &&

        Number.isFinite(
          Number(
            client.longitude
          )
        )

    );


  /* ====================================================
     VISITAS POR CLIENTE
  ==================================================== */

  const visitsByClientId =
    useMemo(

      () =>

        new Map(

          visits.map(

            visit => [

              String(
                visit.clientId
              ),

              visit

            ]

          )

        ),

      [
        visits
      ]

    );


  /* ====================================================
     POSICIÓN POR DEFECTO
  ==================================================== */

  const defaultPosition = [

    6.2442,

    -75.5812

  ];


  const mapCenter =

    clientsWithLocation.length > 0

      ? [

          Number(
            clientsWithLocation[0].latitude
          ),

          Number(
            clientsWithLocation[0].longitude
          )

        ]

      : defaultPosition;


  /* ====================================================
     RENDER
  ==================================================== */

  return (

    <div className="route-map">


      <MapContainer

        center={
          mapCenter
        }

        zoom={13}

        scrollWheelZoom={true}

        className="route-map__container"

      >


        <TileLayer

          attribution='&copy; OpenStreetMap contributors'

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        <MapBounds

          clients={
            clientsWithLocation
          }

        />


        {

          clientsWithLocation.map(

            client => {

              const visit =
                visitsByClientId.get(

                  String(
                    client.id
                  )

                );


              const status =
                visit?.status ||
                "Pendiente";


              const collected =
                Number(
                  visit?.collectedAmount ||
                  0
                );


              return (

                <Marker

                  key={
                    client.id
                  }

                  position={[

                    Number(
                      client.latitude
                    ),

                    Number(
                      client.longitude
                    )

                  ]}

                  icon={
                    createMarkerIcon(
                      status
                    )
                  }

                >


                  <Popup>


                    <div className="route-map__popup">


                      <strong>

                        {
                          client.name
                        }

                      </strong>


                      <span>

                        {
                          client.address ||
                          "Sin dirección"
                        }

                      </span>


                      {

                        client.phone && (

                          <span>

                            {
                              client.phone
                            }

                          </span>

                        )

                      }


                      <span

                        className="route-map__status"

                        style={{

                          color:
                            VISIT_COLORS[
                              status
                            ] ||
                            VISIT_COLORS[
                              "Pendiente"
                            ]

                        }}

                      >

                        Estado: {status}

                      </span>


                      {

                        collected > 0 && (

                          <span>

                            Recaudado: $

                            {
                              collected.toLocaleString()
                            }

                          </span>

                        )

                      }


                    </div>


                  </Popup>


                </Marker>

              );

            }

          )

        }


      </MapContainer>


    </div>

  );

}


export default RouteMap;
