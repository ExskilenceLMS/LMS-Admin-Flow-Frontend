import React, { useState, useEffect } from 'react';
import { Form, Table, Modal, Button, Spinner } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";
import Trainer from "./Components/images/icons/Trainer.png";
import Student from "./Components/images/icons/Student.png";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Course {
  course_id: string;
  course_name: string;
}

interface Batch {
  course_id: string;
  batch_name: string;
  batch_id?: string;
  delivery_type: string;
  max_no_of_students: number;
  start_date: string;
  indicative_date: string;
}

const BatchCreation: React.FC = () => {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [modalType, setModalType] = useState<string>("new");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<Batch>({
    course_id: "",
    batch_name: "",
    delivery_type: "Online",
    max_no_of_students: 0,
    start_date: "",
    indicative_date: "",
  });
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
const [selectedCourse, setSelectedCourse] = useState("");
const navigate= useNavigate();
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://exskilence-suite-be.azurewebsites.net/get_all_courses_for_batch/');
      setCourses(response.data.courses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching courses:', error);
    }
  };
  
useEffect(() => {
    if (selectedCourse!="") {
        fetchBatches();
    }
},[selectedCourse])

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_all_batch/${selectedCourse}/`);
      setBatches(response.data.batches);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDelete = (batch: Batch): void => {
    setSelectedBatch(batch);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedBatch) {
      try {
        const json = {
          batch_id: selectedBatch.batch_id,
        };
  
        const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/delete_batch/", json, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        fetchBatches();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting batch:", error);
      }
    }
  };

  const handleModal = (type: string, batch?: Batch): void => {
    setModalType(type);
    if (type === "new") {
      setFormData({ course_id: selectedCourse, batch_name: "", delivery_type: "Online", max_no_of_students: 0, start_date: "", indicative_date: "" });
    } else if (batch) {
      setFormData(batch);
    }
    setShowModal(true);
    setError("");
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.batch_name || !formData.indicative_date || !formData.start_date) {
      setError("All fields are required");
      return;
    }
  
    const isBatchTaken = batches.some(batch => (batch.batch_name.toLowerCase() === formData.batch_name.toLowerCase() && batch.batch_id!==formData.batch_id));
    if (isBatchTaken) {
      setError("Batch Name not available");
      return;
    }
  
    const startDate = new Date(formData.start_date);
    const indicativeDate = new Date(formData.indicative_date);
  
    if (startDate >= indicativeDate) {
      setError("Start date must be before indicative date");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const json = {
        ...formData,
      };
  
      const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/create_batch/", json, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      fetchBatches();
      setShowModal(false);
    } catch (error) {
      setError("Error saving batch");
      console.error("Error saving batch:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2" style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}>
      <div className="d-flex justify-content-between pe-3">
        <span className="d-flex justify-content-start align-items-center ps-4">
          <label className='me-2'>Course</label>
          <Form.Select className="me-3" style={{width:"150px"}} onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse}>
  <option value="">Select Course</option> 
  {courses.map((course) => (
    <option key={course.course_id} value={course.course_id}>
      {course.course_name}
    </option>
  ))}
</Form.Select>


          <label>Batch </label>
          <Form.Control
            type="text"
            // placeholder="Enter Batch Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "150px" }}
            className="ms-2"
          />
          {/* <button className='btn border-secondary shadow ms-3'>Search</button> */}
        </span>
        <button className="btn" onClick={() => { handleModal("new") }}>
          + New Batch
        </button>
      </div>
      <div className="p-4">

      <Table className='border-top mt-2'>
        <thead  style={{borderBottom:'1px solid black',borderTop:'1px solid black'}}>
          <tr>
            <td className='fw-normal'>Sl No</td>
            <td className='fw-normal'>Batch Name</td>
            <td className='fw-normal'>Batch Id</td>
            <td className='fw-normal'>Max No of Students</td>
            <td className='fw-normal'>Start Date</td>
            <td className='fw-normal'>End Date</td>
            <td className='fw-normal'>Delivery Type</td>
            <td className='fw-normal'>Actions</td>
          </tr>
        </thead>
        <tbody>
          {batches
            .filter((batch) => batch.batch_name.toLowerCase().includes(search.toLowerCase()))
            .map((batch, index) => (
              <tr key={index + 1}>
                <td>{index + 1}</td>
                <td>{batch.batch_name}</td>
                <td>{batch.batch_id}</td>
                <td>{String(batch.max_no_of_students)}</td>
                <td>{batch.start_date}</td>
                <td>{batch.indicative_date}</td>
                <td>{batch.delivery_type}</td>
                <td>
                  <img src={Edit} onClick={() => { handleModal("edit", batch) }} role ="button" alt="Edit" aria-label="Edit" />
                  <img src={Delete} alt="Delete" role ="button"  aria-label="Delete" onClick={() => handleDelete(batch)} />
                  <img src ={Trainer} alt='Trainer' role ="button"  aria-label="Trainer"  onClick={() => {
                      navigate('/batches/user', { state: { batch_id: batch.batch_id, course_id:selectedCourse , batch_name: batch.batch_name } });
                    }}
                  />
                  <img src= {Student} alt='Student' role ="button"  sizes='20'  aria-label="Student" onClick={() => {
                      navigate('/batches/student', { state: { batch_id: batch.batch_id, course_id:selectedCourse , batch_name: batch.batch_name } });
                    }} />
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "new" ? "Add New Batch" : "Edit Batch"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>

            <Form.Group controlId="formCourse" className="d-flex align-items-center justify-content-between">
              <Form.Label>Course</Form.Label>
              <Form.Select style={{
      width: "50%"
    }} name="course_id" disabled={modalType === "edit"} value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formBatchName" className=" mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Batch Name</Form.Label>
              <Form.Control style={{
      width: "50%"
    }}
                type="text"
                name="batch_name"
                value={formData.batch_name}
                onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                // placeholder="Enter Batch Name"
              />
            </Form.Group>

            <Form.Group controlId="formDeliveryType"  className=" mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Delivery Type</Form.Label>
              <Form.Select style={{
      width: "50%"
    }} name="delivery_type" value={formData.delivery_type} onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}>
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formMaxNoOfStudents"  className=" mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Max No of students</Form.Label>
              <Form.Control
                type="number"
                name="max_no_of_students"
                value={formData.max_no_of_students || ""}
                min={0}
                style={{
                  width: "50%"
                }}
                onChange={(e) => setFormData({
                  ...formData,
                  max_no_of_students: e.target.value === "" ? 0 : Number(e.target.value)
                })}
                // placeholder="Enter Max No of students"
              />
            </Form.Group>

            <Form.Group  className=" mt-3 d-flex align-items-center justify-content-between"controlId="formStartDate">
              <Form.Label>Enter Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                style={{
                  width: "50%"
                }}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                // placeholder="Enter Start Date"
              />
            </Form.Group>

            <Form.Group controlId="formIndicativeDate"  className=" mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Enter Indicative Date</Form.Label>
              <Form.Control
              style={{
                width: "50%"
              }}
                type="date"
                name="indicative_date"
                value={formData.indicative_date}
                onChange={(e) => setFormData({ ...formData, indicative_date: e.target.value })}
                // placeholder="Enter Indicative Date"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the batch: <strong>{selectedBatch?.batch_name}</strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BatchCreation;
