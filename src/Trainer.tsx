import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";
import axios from 'axios';

interface TrainerData {
  id: string;
  name: string;
  mobile_no: string;
  email_id: string;
  gender: string;
  address: string;
  enabled?: boolean;
}

interface Batch {
  batch_name: string;
  batch_id: string;
}

interface Course {
  course_id: string;
  course_name: string;
}

const Trainer: React.FC = () => {
  const location = useLocation();
  const batchId = location.state?.batch_id ? location.state.batch_id : "";
  const batchName = location.state?.batch_name ? location.state.batch_name : "";
  const courseId = location.state?.course_id ? location.state.course_id : "";
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [formData, setFormData] = useState({
    name: "",
    id:"",
    mobile_no: "",
    email_id: "",
    gender: "",
    address: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId);
  const [selectedBatch, setSelectedBatch] = useState(batchId);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentBatchTrainers, setCurrentBatchTrainers] = useState<TrainerData[]>([]);

  useEffect(() => {
    if (!batchId || !courseId || !batchName) {
      navigate("/batches");
    }
    setLoading(true);
    fetchData();
  }, [batchId, courseId]);

  useEffect(() => {
    if (selectedBatch) {
      setLoading(true);
      fetchSelectedBatchTrainers();
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedCourse !== "") {
      setLoading(true);
      fetchBatches();
    }
  }, [selectedCourse]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchTrainers(), fetchCourses()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_all_batch/${selectedCourse}/`);
      setBatches(response.data.batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://exskilence-suite-be.azurewebsites.net/get_all_courses_for_batch/');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await axios.get("https://exskilence-suite-be.azurewebsites.net/get_all_trainer/");
      setTrainers(response.data.trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };

  const fetchSelectedBatchTrainers = async () => {
    try {
      const json = { batch_id: selectedBatch };
      const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/get_trainer_for_batch/", json, {
        headers: { "Content-Type": "application/json" },
      });
      setCurrentBatchTrainers(response.data.trainers);
    } catch (error) {
      console.error("Error fetching selected batch trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModal = (type: string, trainer?: TrainerData): void => {
    setModalType(type);
    if (type === "new") {
      setFormData({ id:"",name: "", mobile_no: "", email_id: "", gender: "", address: "" });
    } else if (trainer) {
      setFormData(trainer);
    }
    setShowModal(true);
    setError("");
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.name || !formData.mobile_no || !formData.email_id || !formData.gender || !formData.address) {
      setError("All fields are required");
      return;
    }
    const isNameTaken = trainers.some(trainer => (trainer.email_id.toLowerCase() === formData.email_id.toLowerCase()) && (trainer.id !== formData.id));
    if (isNameTaken) {
      setError("Email not available");
      return;
    }
    setError("");

    try {
      const json = { ...formData };
      setLoading(true);
      await axios.post("https://exskilence-suite-be.azurewebsites.net/create_trainer/", json, {
        headers: { "Content-Type": "application/json" },
      });
      fetchTrainers();
      setShowModal(false);
    } catch (error) {
      setError("Error saving Trainer");
      console.error("Error saving Trainer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (trainer: TrainerData): void => {
    setSelectedTrainer(trainer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedTrainer) {
      try {
        const json = { id: selectedTrainer.id };
        setLoading(true);
        await axios.post("https://exskilence-suite-be.azurewebsites.net/delete_trainer/", json, {
          headers: { "Content-Type": "application/json" },
        });
        fetchTrainers();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting trainer:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const enableForBatch = async (trainer: TrainerData): Promise<void> => {
    if (trainer && selectedBatch) {
      try {
        setLoading(true);
        const json = { trainer_id: trainer.id, batch_id: selectedBatch };
        await axios.post("https://exskilence-suite-be.azurewebsites.net/enable_trainer_for_batch/", json, {
          headers: { "Content-Type": "application/json" },
        });
        fetchSelectedBatchTrainers();
      } catch (error) {
        console.error("Error enabling for batch:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const addToBatch = async (trainer: TrainerData): Promise<void> => {
    if (trainer && selectedBatch) {
      try {
        setLoading(true);
        const json = { trainer_id: trainer.id, batch_id: selectedBatch };
        await axios.post("https://exskilence-suite-be.azurewebsites.net/add_trainers_to_batch/", json, {
          headers: { "Content-Type": "application/json" },
        });
        fetchSelectedBatchTrainers();
      } catch (error) {
        console.error("Error adding to batch:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Spinner animation="border" role="status" />
        </div>
      )}

      <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2" style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}>
        <div className="d-flex justify-content-between ">
          <span className="d-flex justify-content-start align-items-center ps-4">
            <label className='me-2'>Course</label>
            <Form.Select style={{width:"150px"}} className="me-3" onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBatch(''); }} value={selectedCourse}>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </Form.Select>
            <label className='me-2'>Batch</label>
            <Form.Select className="me-3" style={{width:"150px"}} onChange={(e) => setSelectedBatch(e.target.value)} value={selectedBatch}>
              <option value="" key="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.batch_name}
                </option>
              ))}
            </Form.Select>
          </span>
          <button className="btn" onClick={() => { handleModal("new"); }}>
            + New Trainer
          </button>
        </div>
        <div className="p-4">
          <Table className='border-top mt-2'>
            <thead style={{ borderBottom: '1px solid black', borderTop: '1px solid black' }}>
              <tr>
                <td>ID</td>
                <td>Name</td>
                <td>Mobile No</td>
                <td>Email</td>
                <td>Add Trainer to Batch</td>
                <td>Enable for Batch</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer, index) => (
                <tr key={trainer.id}>
                  <td>{trainer.id}</td>
                  <td>{trainer.name}</td>
                  <td>{trainer.mobile_no}</td>
                  <td>{trainer.email_id}</td>
                  <td className="ms-3">
                   {selectedBatch !='' && <input
                      type="checkbox"
                      checked={currentBatchTrainers.some((selectedTrainer) => selectedTrainer.id === trainer.id)}
                      onChange={() => addToBatch(trainer)}
                    />}
                  </td>
                  <td className="ms-3">
                  {selectedBatch !='' && currentBatchTrainers.some((selectedTrainer) => selectedTrainer.id === trainer.id) ? (
                      <input
                        type="checkbox"
                        checked={currentBatchTrainers.some((selectedTrainer) => selectedTrainer.id === trainer.id && selectedTrainer.enabled)}
                        onChange={() => enableForBatch(trainer)}
                      />
                    ) : (
                      <span></span>
                    )}
                  </td>
                  <td>
                    <img  role ="button" src={Edit} onClick={() => { handleModal("edit", trainer); }} alt="Edit" aria-label="Edit" />
                    <img role ="button"  src={Delete} alt="Delete" aria-label="Delete" onClick={() => handleDelete(trainer)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete the trainer: <strong>{selectedTrainer?.name}</strong>?</p>
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

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{modalType === "new" ? "Add New Trainer" : "Edit Trainer"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}
            <Form>
              <Form.Group controlId="formTrainerName" className="d-flex align-items-center justify-content-between">
                <Form.Label>Name</Form.Label>
                <Form.Control
                style={{
                  width: "50%"
                }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  // placeholder="Enter Trainer Name"
                />
              </Form.Group>

              <Form.Group controlId="formTrainerMobile" className="mt-3 d-flex align-items-center justify-content-between">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                style={{
                  width: "50%"
                }}
                  type="number"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                  // placeholder="Enter Mobile Number"
                />
              </Form.Group>

              <Form.Group controlId="formTrainerEmail" className="mt-3 d-flex align-items-center justify-content-between">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  style={{
                    width: "50%"
                  }}
                  name="email_id"
                  value={formData.email_id}
                  onChange={(e) => setFormData({ ...formData, email_id: e.target.value })}
                  // placeholder="Enter Email ID"
                />
              </Form.Group>

              <Form.Group controlId="formTrainerGender" className="mt-3 d-flex align-items-center justify-content-between">
                <Form.Label>Gender</Form.Label>
                <Form.Control
                  as="select"
                  name="gender"
                  style={{
                    width: "50%"
                  }}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formTrainerAddress" className="mt-3 d-flex align-items-center justify-content-between">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="string"
                  style={{
                    width: "50%"
                  }}
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  // placeholder="Enter Address"
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
      </div>
    </>
  );
}

export default Trainer;
