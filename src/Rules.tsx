import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import Edit from "./Components/images/icons/edit.png";
const Rules: React.FC = () => {
  interface Structure {
    level: string;
    score: number;
    testcase?: string;
    time: number;
  }

  interface Data {
    mcq: Structure[];
    coding: Structure[];
  }

  const [active, setActive] = useState<"mcq" | "coding">("mcq");
  const [data, setData] = useState<Data | null>(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalData, setModalData] = useState<Structure | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await axios.get("https://exskilence-suite-be.azurewebsites.net/fetch_rules/");
      setData(response.data); 
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  const handleTime = (data: number): string => {
    let num = Number(data);
    let hour = Math.floor(num / 60);
    let min = num % 60;

    if (hour === 0) {
      return `${min} minutes`;
    }
    return `${hour} hr ${min} minutes`;
  };

  const handleEdit = (index: number) => {
    const selectedData = data?.[active][index];
    setModalData(selectedData || null);
    setEditIndex(index);
    setModalShow(true);
  };

  const handleSave = async () => {
    if (modalData && editIndex !== null) {
      const updatedData = modalData;

      let json={
      }
      setData((prev) => {
        if (!prev) return { mcq: [], coding: [] };

        const updatedDataList = [...(prev[active] || [])];
        updatedDataList[editIndex] = updatedData;
          json={
            ...prev,
            [active]: updatedDataList,
          }
          try {
             axios.post("https://exskilence-suite-be.azurewebsites.net/update_rules/", json); 
            // fetchData();
            setModalShow(false);
          } catch (error) {
            console.error("Error saving data:", error);
          }
        return {
          ...prev,
          [active]: updatedDataList,
        };
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    if (modalData) {
      setModalData({ ...modalData, [field]: e.target.value });
    }
  };

  return (
    <div
      className="border rounded-2 bg-white my-2 me-2"
      style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}
    >
      <div className="ps-3 pt-2">
        <div>
          <button
            className="me-2 p-2 px-5 border rounded-1"
            onClick={() => setActive("mcq")}
            style={{
              backgroundColor: active === "mcq" ? "#DDDCDCA1" : "white",
              boxShadow:"rgba(0, 0, 0, 0.24) 0px 2px 4px"
            }}
          >
            MCQ
          </button>
          <button
            className="me-2 p-2 px-5 border rounded-1 "
            onClick={() => setActive("coding")}
            style={{
              backgroundColor: active === "coding" ? "#DDDCDCA1" : "white",
              boxShadow:"rgba(0, 0, 0, 0.24) 0px 2px 4px"
            }}
          >
            Coding
          </button>
        </div>

        <div className="mt-3">
          <div className="container p-0 m-0">
            <div className="row" style={{width:'100%'}}>
              <div className="col-lg-7 col-md-10">
                <div className="mt-2">
                  <div style={{ backgroundColor: "white" }}>
                    <div className="d-flex justify-content-between p-2 ps-3">
                      <div style={{ width: "25%" }}>Levels</div>
                      <div style={{ width: "15%" }}>Score</div>
                      {/* <div style={{ width: "25%" }}>Score for Correct Answer</div> */}
                      {active === "coding" && <div style={{ width: "30%" }}>Test cases and score</div>}
                      <div style={{ width: "25%" }}>Time in minutes</div>
                      <div style={{ width: "10%" }}>Action</div>
                    </div>
                  </div>
                  <div className="rounded" style={{ backgroundColor: "#DDDCDCA1",  boxShadow:"rgba(0, 0, 0, 0.24) 0px 2px 4px" }}>
                    {data && data[active] ? (
                      data[active].map((level, index) => (
                        <div key={index} className="d-flex justify-content-between p-1 ps-3">
                          <div style={{ width: "25%" }}>{level.level}</div>
                          <div style={{ width: "15%" }}>{level.score}</div>
                          {active === "coding" && <div style={{ width: "30%" }}>{level.testcase}</div>}
                          <div style={{ width: "25%" }}>{handleTime(level.time)}</div>
                          <div style={{ width: "10%" }}>
                            <img  role ="button" onClick={() => handleEdit(index)} src={Edit}/>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <Form>
              <Form.Group className="d-flex align-items-center justify-content-between">
                <Form.Label>Level</Form.Label>
                <Form.Control
                  type="text"
                  style={{
                    width: "50%"
                  }}
                  value={modalData.level}
                  // onChange={(e) => handleChange(e, "level")}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mt-3 d-flex align-items-center justify-content-between">
                <Form.Label>Score for Correct Answer</Form.Label>
                <Form.Control
                style={{
                  width: "50%"
                }}
                  type="number"
                  value={modalData.score}
                  onChange={(e) => handleChange(e, "score")}
                />
              </Form.Group>
              {active === "coding" && (
                <Form.Group className="mt-3 d-flex align-items-center justify-content-between">
                  <Form.Label>Testcases and Score</Form.Label>
                  <Form.Control
                  style={{
                    width: "50%"
                  }}
                    type="text"
                    value={modalData.testcase || ""}
                    onChange={(e) => handleChange(e, "testcase")}
                  />
                </Form.Group>
              )}
              <Form.Group className="mt-3 d-flex align-items-center justify-content-between">
                <Form.Label>Time in minutes</Form.Label>
                <Form.Control
                style={{
                  width: "50%"
                }}
                  type="number"
                  value={modalData.time}
                  onChange={(e) => handleChange(e, "time")}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Rules;
