import {
  useState
} from "react";


import {
  Bell
} from "lucide-react";


import {
  useNotifications
} from "../../context/NotificationContext";


import NotificationBadge from "./NotificationBadge";

import NotificationDropdown from "./NotificationDropdown";


import "./NotificationBell.css";





function NotificationBell() {



  const [open,setOpen] = useState(false);




  const {

    notifications,

    unreadCount,

    markAllRead

  } = useNotifications();







  return (



    <div className="notification-bell">






      <button


        className="notification-bell__button"


        onClick={()=>setOpen(!open)}


      >



        <Bell size={22}/>




        <NotificationBadge

          count={unreadCount}

        />




      </button>









      {


        open && (




          <div className="notification-bell__dropdown">






            <NotificationDropdown



              notifications={notifications}



              unreadCount={unreadCount}



              onClose={()=>setOpen(false)}



              onMarkAllRead={markAllRead}



            />






          </div>




        )



      }






    </div>



  );



}



export default NotificationBell;