
export async function geocodeClientAddress(client) {

  const {

    addressType,
    addressNumber,
    addressNumberLetter,
    addressSecondary,
    addressSecondaryLetter,
    addressPlate,
    addressPlateLetter,
    neighborhood,
    city

  } = client;


  if (
    !addressType ||
    !addressNumber ||
    !addressSecondary ||
    !addressPlate ||
    !city
  ) {

    return null;

  }


  const primaryNumber =
    `${addressNumber}${addressNumberLetter || ""}`;


  const secondaryNumber =
    `${addressSecondary}${addressSecondaryLetter || ""}`;


  const plate =
    `${addressPlate}${addressPlateLetter || ""}`;


  const streetAddress =
    `${addressType} ${primaryNumber} # ${secondaryNumber}-${plate}`;


  const queries = [

    `${streetAddress}, ${neighborhood}, ${city}, Colombia`,

    `${streetAddress}, ${city}, Colombia`,

    `${addressType} ${primaryNumber} # ${secondaryNumber}-${plate}, ${city}, Colombia`,

    `${addressType} ${primaryNumber}, ${city}, Colombia`,

    `${neighborhood}, ${city}, Colombia`

  ];


  async function searchAddress(query) {

    try {

      const url =
        "https://nominatim.openstreetmap.org/search?" +

        new URLSearchParams({

          format: "json",

          q: query,

          limit: "1",

          countrycodes: "co"

        });


      const response = await fetch(

        url,

        {

          headers: {

            Accept:
              "application/json"

          }

        }

      );


      if (!response.ok) {

        return null;

      }


      const data =
        await response.json();


      if (!data.length) {

        return null;

      }


      const latitude =
        Number(data[0].lat);


      const longitude =
        Number(data[0].lon);


      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {

        return null;

      }


      return {

        latitude,

        longitude

      };


    } catch (error) {

      console.error(

        "Error consultando Nominatim:",

        error

      );


      return null;

    }

  }


  for (const query of queries) {

    const location =
      await searchAddress(query);


    if (location) {

      console.log(

        "Dirección geocodificada:",

        query,

        location

      );


      return location;

    }

  }


  console.warn(

    "No se encontraron coordenadas para:",

    streetAddress,

    city

  );


  return null;

}
