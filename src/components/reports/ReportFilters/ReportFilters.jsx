import "./ReportFilters.css";


function ReportFilters({

  search,
  setSearch,

  status,
  setStatus

}) {


  return (

    <div className="report-filters">


      <input

        type="text"

        placeholder="Buscar cliente..."

        value={search}

        onChange={(e)=>
          setSearch(e.target.value)
        }

      />



      <select

        value={status}

        onChange={(e)=>
          setStatus(e.target.value)
        }

      >

        <option value="Todos">

          Todos

        </option>


        <option value="Activo">

          Activos

        </option>


        <option value="Pagado">

          Pagados

        </option>


      </select>



    </div>

  );

}


export default ReportFilters;