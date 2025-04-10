import React, { useState } from "react";
import { Table } from "react-bootstrap";

const Test: React.FC = () => {


  const [active, setActive] = useState<"creation" | "assign" | "report">("creation");
  const [data, setData] = useState("")

  return (
    <div
      className="border rounded-2 bg-white my-2 me-2"
      style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}
    >
      <div className="ps-2 pt-2">
        <div>
          <button
            className="me-2 pt-2 px-5 bg-white border-0"
            onClick={() => setActive("creation")}
            style={{
              color: active === "creation" ? "blue" : "black",
            }}
          >
            Test Creation
          </button>
          <button
            className="me-2 pt-2 px-5 bg-white border-0"
            onClick={() => setActive("assign")}
            style={{
              color: active === "assign" ? "blue" : "black",
            }}
          >
            Test Assign
          </button>
          <button
            className="me-2 pt-2 px-5 bg-white border-0"
            onClick={() => setActive("report")}
            style={{
              color: active === "report" ? "blue" : "black",
            }}
          >
            Test Report
          </button>
        </div>
        <hr/>
        <div>
{/* {active === "creation" && (
              <div className="d-flex border-black rounded-1 justify-content-center align-items-center mt-3 m-2">
            
                <div className="w-50">
                <p className="text-center m-0 p-2 w-100" style={{backgroundColor:"darkblue",color:"white"}}>Create New Test</p>
                <div className="border m-0 border-black p-2 p-lg-4 p-xl-5 p-xxl-auto"> 
                    <form>
                      <label>Test Name</label>
                      <input type="text" className="form-control"  />
                      <div className="d-flex justify-content-between mt-2">
                      <div>
                        <label>Duration</label> <br/>
                        <div className="d-flex">
                          <div>
                          <input type="number" min={0} className="form-control" style={{width:"40px"}} />
                          <span>Hours</span>
                          </div>
                          <span className="mx-2 d-flex align-items-start">:</span>
                          <div>
                          <input type="number" min={0} className="form-control" style={{width:"40px"}} />
                          <span>Mins</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label>Test Marks</label>
                        <input type="text" className="form-control" style={{width:"80px"}} />
                      </div>
                      </div>
                      <label>Description</label>
                      <input type="textarea" placeholder="Write here..." className="form-control" />

                      <div>
                        <button className="p-">Cancel</button>
                        <button>Create</button>
                      </div>
                    </form>
                </div>
                </div>
            </div>
)} */}
        </div>
      </div>
    </div>
  );
};

export default Test;
