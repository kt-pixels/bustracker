// https://transbus.opendevlabs.com/agency/301/avlapi/stops.geojson

export const stopsData = 
  [
    {
      type: "Feature",
      properties: {
        id: "BZ01",
        pk: 4739,
        popupContent: "A.C.R.",
        name: "A.C.R.",
        hasInfoPanel: false,
      },
      geometry: { type: "Point", coordinates: [26.81406, 45.14787] },
    },
    {
      type: "Feature",
      properties: {
        id: "BZ02",
        pk: 4740,
        popupContent: "A.C.R. - Maxi Farma",
        name: "A.C.R. - Maxi Farma",
        hasInfoPanel: false,
      },
      geometry: {
        type: "Point",
        coordinates: [26.814334272025906, 45.147901491207215],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "BZ03",
        pk: 4741,
        popupContent: "Agrana",
        name: "Agrana",
        hasInfoPanel: false,
      },
      geometry: { type: "Point", coordinates: [26.83985, 45.13485] },
    },
    {
      type: "Feature",
      properties: {
        id: "BZ228",
        pk: 4953,
        popupContent: "Agrosem",
        name: "Agrosem",
        hasInfoPanel: true,
      },
      geometry: {
        type: "Point",
        coordinates: [26.82970721537803, 45.13472230012396],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "bz1427",
        pk: 4849,
        popupContent: "Albe\u0219ti - Intersec\u021bie",
        name: "Albe\u0219ti - Intersec\u021bie",
        hasInfoPanel: false,
      },
      geometry: {
        type: "Point",
        coordinates: [26.92625994098164, 44.98903446865202],
      },
    },
    
  ];

// https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson?route=${route}

export const routsData = [
  {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          speed: 0,
          accuracy: null,
          gps_timestamp: "2024-03-13T12:41:52Z",
          route: "3",
          bearing: 1,
          isOnline: true,
          license_plate: "BZ11HSU",
          vehicle_type: 3,
        },
        geometry: {
          type: "Point",
          coordinates: [26.8172550201, 45.1560134888, 100.8],
        },
      },
    ],
  },
];

// https://transbus.opendevlabs.com/agency/301/gtfs/route/213/trips/

export const tripsData = [{ success: false, err_msg: "Cerere invalida" }];

//https://transbus.opendevlabs.com/agency/301/gtfs/route/213/trips/72721/

export const givingTrips = [{ success: false, err_msg: "Cerere invalida" }];

// https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson

export const allBuses = [
  {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          speed: 18,
          accuracy: null,
          gps_timestamp: "2024-03-13T04:09:28Z",
          route: "114B",
          bearing: 1,
          isOnline: false,
          license_plate: "BZ11HTK",
          vehicle_type: 3,
        },
        geometry: {
          type: "Point",
          coordinates: [26.9230289459, 45.0888900757, 78.1],
        },
      },
    ],
  },
];

// Routes

const routes = [
  {
    object_id: 213,
    short_name: "1",
    name: "Kaufland SUD - Piata Centrala - Kaufland Sud",
    color: "E30900",
    rtype: "BUS",
    extra_data: {
      headline: { 0: "N/A - N/A", 1: "KAUFLAND SUD - KAUFLAND SUD" },
    },
    headline: { 0: "N/A - N/A", 1: "KAUFLAND SUD - KAUFLAND SUD" },
    geo_shape:
      "SRID=4326;MULTILINESTRING ((26.80140495300293 45.13915763466751, 26.80767059326172 45.14148852632793), (26.79917335510254 45.13961171194493, 26.79986000061036 45.13864300938156, 26.80496692657471 45.14041390629747, 26.80786371231079 45.14147339097514, 26.80889368057251 45.14248745072615, 26.81556701660157 45.14926756584629, 26.81766986846924 45.15129539003134, 26.81763768196106 45.15271028432237, 26.81875348091126 45.15312642301719, 26.81932210922242 45.15240006986392, 26.82047009468079 45.15067494402304, 26.82168245315552 45.1517796358814, 26.82453632354736 45.14884383227693, 26.82578086853028 45.14315339060149, 26.83509349822998 45.14372851423381, 26.84226036071778 45.14409174722276, 26.84393405914307 45.14469713039464, 26.84612274169922 45.14575653547625, 26.84891223907471 45.14669484924983, 26.85178756713868 45.1475726126684, 26.85401916503906 45.14832929442211, 26.85496330261231 45.14899516605619, 26.84541463851929 45.1505084817497, 26.84297919273376 45.15074304208561, 26.83784008026123 45.15138618644162, 26.8359088897705 45.15163587582409, 26.83573722839356 45.15081114006686, 26.83509349822998 45.14978209523125, 26.83665990829468 45.1485865639301, 26.83812975883484 45.14755747893088, 26.83955669403077 45.1464527052385, 26.84105873107911 45.14528737279753, 26.84235692024231 45.14434146856014, 26.84145569801331 45.1441068818804, 26.83493256568909 45.14375121636343, 26.83128476142884 45.14356959907338, 26.82756185531617 45.14338041378102, 26.82621002197266 45.14331987435487, 26.82579159736634 45.14360743605652, 26.82561993598938 45.14419012242565, 26.82522296905518 45.14596841413, 26.82478308677674 45.14866223121148, 26.82482600212098 45.14933566559039, 26.82443976402283 45.15041011745059, 26.82376384735108 45.15143158459254, 26.82294845581055 45.15241520231572, 26.82170391082764 45.15181746741518, 26.82071685791016 45.15300536480119, 26.81933283805848 45.1524530334276, 26.81875348091126 45.15311129075425, 26.81756258010864 45.15274054905718, 26.81774497032166 45.15151481444194, 26.81679010391236 45.15045551637899, 26.81447267532349 45.14816282529814, 26.81040644645691 45.14407661256107, 26.80842161178589 45.1420333963512, 26.80790662765503 45.14156420303144, 26.80720925331116 45.14122365707458, 26.80152297019959 45.13915763466751, 26.80027842521667 45.1386959857284, 26.79969906806946 45.13874896202601, 26.79922699928284 45.13944521736309))",
  },
];
