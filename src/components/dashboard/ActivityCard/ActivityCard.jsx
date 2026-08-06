import "./ActivityCard.css";


function ActivityCard({

  activities = []

}) {


  return (

    <div className="activity-card">


      <h3>

        Actividad reciente

      </h3>



      <div className="activity-card__list">


        {

          activities.map((activity, index)=>(


            <div

              className="activity-card__item"

              key={index}

            >


              <div className="activity-card__dot"></div>



              <div>


                <p>

                  {
                    activity.text ||
                    activity
                  }

                </p>


              </div>



            </div>


          ))

        }


      </div>


    </div>


  );

}


export default ActivityCard;