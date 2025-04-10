import React, { useState, useEffect, use } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Announcements from "../images/icons/announcements.png";
import Chats from "../images/icons/chats.png";
import Dashboard from "../images/icons/dashboard.png";
import ContentHelper from "../images/icons/contentHelper.png";
import LiveSessions from "../images/icons/liveSessions.png";
import MasterData from "../images/icons/masterData.png";
import QuestionBank from "../images/icons/questionBank.png";
import Reports from "../images/icons/reports.png";
import Tests from "../images/icons/tests.png";
import Tickets from "../images/icons/tickets.png";
import Users from "../images/icons/users.png";

interface subMenu {
  label: string;
  path?: string;
  active?: string[];
  onClick?: () => void;
}

interface Menu {
  icon: string;
  label: string;
  path?: string;
  active?: string[];
  subMenu?: subMenu[];
  paths?: string[];
}

interface SidebarProps {
  show: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ show, toggleSidebar }) => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  const pathname = location.pathname;

  useEffect(() => {
    if (!sessionStorage.getItem("Admin")){
      navigate('/')
    }
  }, [location]);

  const sidebarItems: Menu[] = [
    { icon: Dashboard, label: "Dashboard", path: "" },
    {
      icon: MasterData,
      label: "Master Data",
      subMenu: [
        { label: "Track", path: "track" },
        { label: "Course Creation", path: "courses" },
        { label: "Course Configuration", path: "course-configuration" },
        {
          label: "Batch Creation",
          path: "batches",
          active: ["batches", "batches/user", "/batches/student"],
        },
        { label: "Batch Calendar", path: "batch-calendar" },
        { label: "Rules", path: "rules" },
      ],
      paths: [
        "/courses",
        "/batches",
        "/batches/user",
        "/batches/student",
        "/rules",
        "/course-configuration",
        "/batch-calendar"
      ],
    },
    { icon: LiveSessions, label: "Live Sessions", path: "" },
    { icon: Tests, label: "Tests", path: "test" },
    {
      icon: Reports,
      label: "Reports",
      subMenu: [{ label: "Batch Report", path: "" }],
    },
    { icon: QuestionBank, label: "Question Bank", path: "" },
    { icon: Users, label: "Users", path: "" },
    {
      icon: ContentHelper,
      label: "Content Helper",
      subMenu: [
        { label: "Study Materials", path: "" },
        { label: "Subject", path: "subject" },
        { label: "Topic", path: "topic" },
        { label: "Sub Topic", path: "sub-topic" },
        // { label:"Content Creation",path:"content-creation"},
      ],
      paths: ["/subject", "/topic", "/sub-topic"],
    },
    { icon: Announcements, label: "Announcements", path: "" },
    { icon: Tickets, label: "Tickets", path: "" },
    { icon: Chats, label: "Chats", path: "" },
  ];

  useEffect(() => {
    {
      sidebarItems.forEach((item) => {
        if (item.paths?.includes(pathname)) {
          setActiveMainMenu(item.label);
          setOpenSubMenu(item.label);
        }
      });
    }
  }, [pathname]);

  useEffect(() => {
    const storedActiveMenu = sessionStorage.getItem("activeMainMenu");
    if (storedActiveMenu) {
      setActiveMainMenu(storedActiveMenu);
    }
  }, []);

  useEffect(() => {
    if (activeMainMenu) {
      sessionStorage.setItem("activeMainMenu", activeMainMenu);
    }
  }, [activeMainMenu]);


  const toggleSubMenu = (menu: string) => {
    setOpenSubMenu((prev) => (prev === menu ? null : menu));
  };

  const isActive = (path: string) => location.pathname === `/${path}`;

  const isSubMenuActive = (subItem: subMenu) => {
    if (subItem.active) {
      return subItem.active.includes(location.pathname.split("/")[1]);
    }
    return location.pathname === `/${subItem.path}`;
  };

  return (
    <div
      className="d-flex flex-column bg-light shadow"
      style={{
        width: show ? "180px" : "60px",
        height: "100vh",
        // transition: "width 0.2s ease-in-out",
        position: "fixed",
        overflowX: "hidden",
        top: "0",
        left: "0",
        zIndex: "1000",
        overflow: "auto",
        borderRight: "1px solid #ccc",
      }}
    >
      <header
        className="d-flex"
        style={{ cursor: "pointer" }}
        onClick={toggleSidebar}
      >
        <span
          className="mb-0 fs-2 ps-2 fw-bolder text-start"
          style={{
            fontFamily: "Lucida Console",
          }}
        >
          EU
        </span>
      </header>

      <div
        className="mt-3"
        style={{
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        {sidebarItems.slice(0, 8).map((item, index) => (
          <div key={index}>
            <div
              className="d-flex align-items-center p-2 px-3 mb-1 hover-bg-primary"
              style={{
                cursor: "pointer",
                borderLeft:
                  activeMainMenu === item.label ? "4px solid black" : "none",
                borderRadius: "4px",
              }}
              onClick={() => {
                if (item.subMenu) {
                  toggleSubMenu(item.label);
                } else if (item.path) {
                  navigate(`/${item.path}`);
                  setActiveMainMenu(item.label);
                  setOpenSubMenu(null);
                }
              }}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="me-3"
                style={{
                  width: "25px",
                }}
              />
              <span className={show ? "d-block" : "d-none"}>{item.label}</span>
            </div>

            {openSubMenu === item.label && item.subMenu && (
              <div className={show ? "d-block" : "d-none"}>
                {item.subMenu.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    className="d-flex align-items-center p-1 ps-5 mb-1 hover-bg-primary ms-3"
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      textDecoration: isSubMenuActive(subItem)
                        ? "underline"
                        : "none",
                      textDecorationThickness: isSubMenuActive(subItem)
                        ? "2px"
                        : "none",
                      textDecorationColor: isSubMenuActive(subItem)
                        ? "blue"
                        : "none",
                      borderRadius: "4px",
                    }}
                    onClick={() => {
                      if (subItem.onClick) {
                        subItem.onClick();
                      } else if (subItem.path) {
                        navigate(`/${subItem.path}`);
                        setActiveMainMenu(item.label);
                      }
                    }}
                  >
                    <span className={show ? "d-block" : "d-none"}>
                      {subItem.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex-grow-1"
        style={{
          cursor: "pointer",
        }}
        onClick={toggleSidebar}
      ></div>

      <div className="mt-auto" style={{ fontSize: "14px" }}>
        {sidebarItems.slice(8).map((item, index) => (
          <div key={index}>
            <div
              className="d-flex align-items-center p-2 px-3 mb-1 hover-bg-primary"
              style={{
                cursor: "pointer",
                borderLeft:
                  activeMainMenu === item.label ? "4px solid black" : "none",
                borderRadius: "4px",
              }}
              onClick={() => {
                if (item.subMenu) {
                  toggleSubMenu(item.label);
                } else if (item.path) {
                  navigate(`/${item.path}`);
                  setActiveMainMenu(item.label);
                  setOpenSubMenu(null);
                }
              }}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="me-3"
                style={{
                  width: "25px",
                }}
              />
              <span className={show ? "d-block" : "d-none"}>{item.label}</span>
            </div>

            {openSubMenu === item.label && item.subMenu && (
              <div className={show ? "d-block" : "d-none"}>
                {item.subMenu.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    className="d-flex align-items-center p-1 ps-4 mb-1 hover-bg-primary ms-3"
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      borderLeft: isSubMenuActive(subItem)
                        ? "4px solid black"
                        : "none",
                      borderRadius: "4px",
                    }}
                    onClick={() => {
                      if (subItem.onClick) {
                        subItem.onClick();
                      } else if (subItem.path) {
                        navigate(`/${subItem.path}`);
                      }
                    }}
                  >
                    <span className={show ? "d-block" : "d-none"}>
                      {subItem.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
