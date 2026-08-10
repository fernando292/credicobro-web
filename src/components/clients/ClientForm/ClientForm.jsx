
import {
  useEffect,
  useState
} from "react";

import "./ClientForm.css";


const ADDRESS_TYPES = [
  "Calle",
  "Carrera",
  "Avenida",
  "Avenida Calle",
  "Avenida Carrera",
  "Circular",
  "Diagonal",
  "Transversal"
];


const LETTERS = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H"
];


function ClientForm({

  onSave,

  client

}) {


  const initialForm = {

    name: "",

    document: "",

    phone: "",

    email: "",

    addressType: "Carrera",

    addressNumber: "",

    addressNumberLetter: "",

    addressSecondary: "",

    addressSecondaryLetter: "",

    addressPlate: "",

    addressPlateLetter: "",

    addressComplement: "",

    neighborhood: "",

    city: "",

    address: "",

    status: "Activo"

  };


  const [form, setForm] = useState(
    initialForm
  );


  useEffect(() => {

    if (client) {

      setForm({

        ...initialForm,

        ...client,

        addressType:
          client.addressType ||
          "Carrera",

        addressNumberLetter:
          client.addressNumberLetter ||
          "",

        addressSecondaryLetter:
          client.addressSecondaryLetter ||
          "",

        addressPlateLetter:
          client.addressPlateLetter ||
          ""

      });

    } else {

      setForm(initialForm);

    }

  }, [client]);


  function handleChange(e) {

    const {
      name,
      value
    } = e.target;


    setForm(previous => ({

      ...previous,

      [name]: value

    }));

  }


  function buildAddress() {

    const {

      addressType,

      addressNumber,

      addressNumberLetter,

      addressSecondary,

      addressSecondaryLetter,

      addressPlate,

      addressPlateLetter,

      addressComplement,

      neighborhood,

      city

    } = form;


    let address = "";


    if (addressType) {

      address += addressType;

    }


    if (addressNumber) {

      address += ` ${addressNumber}`;

    }


    if (addressNumberLetter) {

      address += addressNumberLetter;

    }


    if (addressSecondary) {

      address += ` # ${addressSecondary}`;

    }


    if (addressSecondaryLetter) {

      address += addressSecondaryLetter;

    }


    if (addressPlate) {

      address += `-${addressPlate}`;

    }


    if (addressPlateLetter) {

      address += addressPlateLetter;

    }


    const complementParts = [

      addressComplement,

      neighborhood,

      city

    ].filter(

      value => value?.trim()

    );


    if (complementParts.length > 0) {

      address += `, ${complementParts.join(", ")}`;

    }


    return address;

  }


  function handleSubmit(e) {

    e.preventDefault();


    if (!form.name.trim()) {

      return;

    }


    const generatedAddress =
      buildAddress();


    onSave({

      ...form,

      address: generatedAddress,

      createdAt:
        client?.createdAt ||
        new Date()

    });


    if (!client) {

      setForm(initialForm);

    }

  }


  return (

    <form

      className="client-form"

      onSubmit={handleSubmit}

    >


      <div className="client-form__grid">


        {/* ============================================
           INFORMACIÓN DEL CLIENTE
        ============================================ */}


        <div>

          <label>
            Nombre completo
          </label>

          <input

            name="name"

            value={form.name}

            onChange={handleChange}

            placeholder="Ej: Juan Pérez"

            required

          />

        </div>


        <div>

          <label>
            Documento
          </label>

          <input

            name="document"

            value={form.document}

            onChange={handleChange}

            placeholder="Número de documento"

          />

        </div>


        <div>

          <label>
            Teléfono
          </label>

          <input

            name="phone"

            value={form.phone}

            onChange={handleChange}

            placeholder="300 000 0000"

          />

        </div>


        <div>

          <label>
            Correo
          </label>

          <input

            type="email"

            name="email"

            value={form.email}

            onChange={handleChange}

            placeholder="correo@email.com"

          />

        </div>


        {/* ============================================
           DIRECCIÓN
        ============================================ */}


        <div className="client-form__full">

          <h3 className="client-form__section-title">
            Dirección
          </h3>

        </div>


        {/* TIPO DE VÍA */}

        <div>

          <label>
            Tipo de vía
          </label>

          <select

            name="addressType"

            value={form.addressType}

            onChange={handleChange}

          >

            {ADDRESS_TYPES.map(type => (

              <option

                key={type}

                value={type}

              >

                {type}

              </option>

            ))}

          </select>

        </div>


        {/* NÚMERO PRINCIPAL */}

        <div>

          <label>
            Número
          </label>

          <div className="client-form__address-inline">

            <input

              name="addressNumber"

              value={form.addressNumber}

              onChange={handleChange}

              placeholder="30"

              inputMode="numeric"

            />


            <select

              name="addressNumberLetter"

              value={form.addressNumberLetter}

              onChange={handleChange}

            >

              {LETTERS.map(letter => (

                <option

                  key={letter || "none"}

                  value={letter}

                >

                  {letter || "Sin letra"}

                </option>

              ))}

            </select>

          </div>

        </div>


        {/* NÚMERO SECUNDARIO */}

        <div>

          <label>
            Número secundario
          </label>

          <div className="client-form__address-inline">

            <input

              name="addressSecondary"

              value={form.addressSecondary}

              onChange={handleChange}

              placeholder="23"

              inputMode="numeric"

            />


            <select

              name="addressSecondaryLetter"

              value={form.addressSecondaryLetter}

              onChange={handleChange}

            >

              {LETTERS.map(letter => (

                <option

                  key={letter || "none"}

                  value={letter}

                >

                  {letter || "Sin letra"}

                </option>

              ))}

            </select>

          </div>

        </div>


        {/* PLACA */}

        <div>

          <label>
            Placa
          </label>

          <div className="client-form__address-inline">

            <input

              name="addressPlate"

              value={form.addressPlate}

              onChange={handleChange}

              placeholder="12"

              inputMode="numeric"

            />


            <select

              name="addressPlateLetter"

              value={form.addressPlateLetter}

              onChange={handleChange}

            >

              {LETTERS.map(letter => (

                <option

                  key={letter || "none"}

                  value={letter}

                >

                  {letter || "Sin letra"}

                </option>

              ))}

            </select>

          </div>

        </div>


        {/* COMPLEMENTO */}

        <div>

          <label>
            Complemento
          </label>

          <input

            name="addressComplement"

            value={form.addressComplement}

            onChange={handleChange}

            placeholder="Casa, apartamento, local..."

          />

        </div>


        {/* BARRIO */}

        <div>

          <label>
            Barrio
          </label>

          <input

            name="neighborhood"

            value={form.neighborhood}

            onChange={handleChange}

            placeholder="Ej: Laureles"

          />

        </div>


        {/* CIUDAD */}

        <div>

          <label>
            Ciudad
          </label>

          <input

            name="city"

            value={form.city}

            onChange={handleChange}

            placeholder="Ej: Medellín"

          />

        </div>


        {/* DIRECCIÓN GENERADA */}

        <div className="client-form__full">

          <label>
            Dirección generada
          </label>

          <div className="client-form__address-preview">

            {buildAddress() ||
              "La dirección aparecerá aquí..."}

          </div>

        </div>


      </div>


      <button

        type="submit"

      >

        {

          client

            ? "Actualizar cliente"

            : "Guardar cliente"

        }

      </button>


    </form>

  );

}


export default ClientForm;
