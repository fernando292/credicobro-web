import "./NotificationItem.css";


function NotificationItem({

  notification

}) {



  return (


    <div className="notification-item">



      <div className="notification-item__content">


        <strong>

          {notification.title}

        </strong>



        <p>

          {notification.message}

        </p>



        <small>

          {notification.createdAt?.toDate
            ? notification.createdAt.toDate().toLocaleString()
            : "Nueva notificación"
          }

        </small>



      </div>



    </div>


  );


}



export default NotificationItem;