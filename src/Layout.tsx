import React, { useState } from 'react';
import Sidebar from './Components/files/Sidebar';
import Header from './Components/files/Header';
import { useLocation } from 'react-router-dom';
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const location = useLocation();

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  return (
    <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      {location.pathname !== "/" && <Sidebar show={showSidebar} toggleSidebar={toggleSidebar} />}
      <div
        style={{
          marginLeft: location.pathname == "/"?0:  showSidebar ? "190px" : "70px", 
          backgroundColor: "#f0f0f0",
          // transition: "margin-left 0.3s ease", 
        }}
      >
        {location.pathname !== "/" && <Header/>}
        {children}
      </div>
    </div>
  );
};

export default Layout;
