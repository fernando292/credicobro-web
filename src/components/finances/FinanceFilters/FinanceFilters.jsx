import {
  useState
} from "react";

import "./FinanceFilters.css";


function FinanceFilters({
  onFilter
}) {

  const [filters, setFilters] = useState({

    type: "all",

    startDate: "",

    endDate: ""

  });


  function handleChange(e) {

    const {
      name,
      value
    } = e.target;


    const updatedFilters = {

      ...filters,

      [name]: value

    };


    setFilters(
      updatedFilters
    );


    if (onFilter) {

      onFilter(
        updatedFilters
      );

    }

  }


  function handleClear() {

    const clearedFilters = {

      type: "all",

      startDate: "",

      endDate: ""

    };


    setFilters(
      clearedFilters
    );


    if (onFilter) {

      onFilter(
        clearedFilters
      );

    }

  }


  return (

    <div className="finance-filters">


      <div className="finance-filters__field">

        <label htmlFor="finance-filter-type">
          Tipo
        </label>

        <select
          id="finance-filter-type"
          name="type"
          value={filters.type}
          onChange={handleChange}
        >

          <option value="all">
            Todos
          </option>

          <option value="income">
            Ingresos
          </option>

          <option value="expense">
            Egresos
          </option>

        </select>

      </div>


      <div className="finance-filters__field">

        <label htmlFor="finance-filter-start">
          Desde
        </label>

        <input
          id="finance-filter-start"
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
        />

      </div>


      <div className="finance-filters__field">

        <label htmlFor="finance-filter-end">
          Hasta
        </label>

        <input
          id="finance-filter-end"
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
        />

      </div>


      <button
        type="button"
        className="finance-filters__clear"
        onClick={handleClear}
      >

        Limpiar

      </button>


    </div>

  );

}


export default FinanceFilters;