import React from 'react';
import Notification from "../images/icons/Notification.png";
import Back from "../images/icons/Back.png";
import User from "../images/icons/Profile.png";
import { useNavigate, useLocation } from "react-router-dom";

const Header:React.FC=()=> {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean); 
  
  const formattedTitle = pathSegments
    .map((segment, index) => 
      segment.replace("-", " ")
        .toLowerCase() 
        .replace(/\b\w/g, char => char.toUpperCase()) 
    )
    .join(' > ');


  return (
    <div className='pe-2'>
      <div className="container-fluid bg-white border rounded-2 p-3 d-flex justify-content-between me-5">
        <span className="text-center fs-6">
          <img
            src={Back}
            alt="Back btn"
            className="me-1"
            onClick={() => navigate(-1)}
          />
          {formattedTitle}
        </span>
        <span className="">
          <img className="me-2" src={User} alt="User" />
        </span>
      </div>
    </div>
  );
}

export default Header;
