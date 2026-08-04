import "./StatCard.css";


function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend
}) {


  return (

    <div className="stat-card">


      <div className={`stat-card__icon ${color}`}>

        <Icon size={26} />

      </div>



      <div className="stat-card__content">

        <span>
          {title}
        </span>


        <h2>
          {value}
        </h2>


        {
          trend && (

            <small>
              {trend}
            </small>

          )
        }


      </div>


    </div>

  );

}


export default StatCard;