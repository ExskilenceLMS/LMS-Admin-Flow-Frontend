import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";


interface Data {
  subject_id?: string;
  subject_name: string;
  subject_alt_name: string;
  track: string;
  subject_description: string;
}

interface Track {
  track_id: string;
  track_name: string;
}

const Subject: React.FC = () => {
  const [subjects, setSubjects] = useState<Data[]>([]);  
  const [tracks, setTracks] = useState<Track[]>([]);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Data>({
    subject_id: "",
    subject_name: "",
    subject_alt_name: "",
    track:"",
    subject_description: ""
  });
  const [error, setError] = useState<string>("");
   const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Data>()
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState('')
  const handleModal = (type: string, subject?: Data): void => {
    setError("")
    setModalType(type);
    if (type === "new") {
      setFormData({ subject_id: "", track: selectedTrack, subject_name: "", subject_alt_name: "" ,subject_description: ""});
    } else if (subject) {
      setFormData(subject);
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };



  const handleSave = async (): Promise<void> => {
    setError("");
    const existingSubject = subjects.find(subject => (subject.subject_name.toLowerCase() === formData.subject_name.toLowerCase() && subject.subject_id?.toLowerCase() != formData.subject_id?.toLowerCase()));
  
    if (existingSubject) {
      setError("A subject with this name already exists. Please choose a different name.");
      return;
    }
    if (formData.subject_name=='') {
      setError("Please enter a subject name");
      return;
    }
    if(formData.track ==""){
      setError("Please select a track");
      return;
    }
    let subjectsToSend = {...formData, by:sessionStorage.getItem("Email")};
    try {
      const response = await fetch('https://exskilence-suite-be.azurewebsites.net/create_subject/', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectsToSend),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save subjects');
      }
  
      console.log('Subjects saved successfully');
    } catch (error) {
      console.error('Error saving subjects:', error);
    }
  
    setShowModal(false);
    fetchSubjects();
  };
    useEffect(() => {
      fetchSubjects();
      fetchTracks();
     }, []);

     const fetchTracks = async () => {
      try {
        const response = await fetch(
          "https://exskilence-suite-be.azurewebsites.net/get_all_tracks_for_courses/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tracks");
        }
        const data = await response.json();
        setTracks(data.tracks);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
  
     const fetchSubjects = async () => {
       try {
         const response = await fetch('https://exskilence-suite-be.azurewebsites.net/get_all_subjects/');
         if (!response.ok) {
           throw new Error('Failed to fetch subjects');
         }
         const data = await response.json();
         setSubjects(data.subjects);
         setLoading(false);  
       } catch (error) {
         setLoading(false);  
       }
     };

     const handleDelete = (subject: Data): void => {
      setSelectedSubject(subject);
      setShowDeleteModal(true);
    };
  
    const confirmDelete = async (): Promise<void> => {
      if (selectedSubject) {
        try {
          const json={
            subject_id: selectedSubject.subject_id
          }
          const response = await fetch("https://exskilence-suite-be.azurewebsites.net/delete_subject/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(json),
          });
  
          if (!response.ok) {
            throw new Error("Failed to delete subject");
          }
          fetchSubjects();
          setShowDeleteModal(false);
        } catch (error) {
          console.error("Error deleting subject:", error);
        }
      }
    };

    
  return (
    <div className="border rounded-2 bg-white my-2 me-2" style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}>
      <div className="d-flex justify-content-between mt-2 pe-3 ">
        <div className="d-flex justify-content-start align-items-center">
        <span className="d-flex justify-content-start align-items-center ps-4">
          <label>Tracks</label>
          <Form.Select
            aria-label="Default select example"
            className="ms-2"
            value={selectedTrack} style={{width:"150px"}}
            onChange={(e) => {setSelectedTrack(e.target.value)}}
          >
            <option value="">Select</option>
            {tracks.map((track) => (
              <option key={track.track_id} value={track.track_id}> {track.track_name} </option>
            ))}
          </Form.Select>
        </span>
        <span className="d-flex justify-content-start align-items-center ps-4">
            <label>Search </label>
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "150px" }}
              className="ms-2"
            />
          </span>
        </div>
        <button className="btn" onClick={() => { handleModal("new") }}>
          + New Subject
        </button>
      </div>

      <div className="p-4">
      <Table className=' mt-2'>
        <thead style={{borderBottom:'1px solid black',borderTop:'1px solid black'}}>
          <tr>
            <td>Sl No</td>
            <td>Subject Id</td>
            <td>Subject Name</td>
            <td>Subject Alt Name</td>
            <td>Subject Description</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {subjects.filter((subject) => (subject.track === selectedTrack || selectedTrack === '')).filter((subject) => subject.subject_name.toLowerCase().includes(search.toLowerCase())).map((subject, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{subject.subject_id}</td>
              <td>{subject.subject_name}</td>
              <td>{subject.subject_alt_name}</td>
              <td>{subject.subject_description}</td>
              <td>
                <img
                  src={Edit}  role ="button" 
                  alt="Edit"
                  onClick={() => { handleModal("edit", subject) }}
                />
                <img src={Delete}  role ="button" alt="Delete" onClick={() => handleDelete(subject)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "new" ? "Add New Subject" : "Edit Subject"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Form.Group controlId="formTrackId" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Track </Form.Label>
              <Form.Select
                name="track_id"
                value={formData.track}
                disabled={formData.subject_id!=''}
                onChange={(e) => { setFormData({ ...formData, track: e.target.value }) }}
                style={{
                  width: "50%",
                }}
                >
                <option value="">Select</option>
                {tracks.map((track) => (
                  <option key={track.track_id} value={track.track_id}>
                    {track.track_name}
                  </option>
                ))}
                </Form.Select>
            </Form.Group>
            <Form.Group controlId="formSubjectName" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                name="subject_name"
                value={formData.subject_name}
                onChange={handleChange}
                style={{
                  width: "50%"
                }}
                // placeholder="Enter Subject Name"
              />
            </Form.Group>

            <Form.Group controlId="formSubjectAltName" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Subject Alt Name</Form.Label>
              <Form.Control
                type="text"
                name="subject_alt_name"
                value={formData.subject_alt_name}
                onChange={handleChange}
                // placeholder="Enter Alternate Subject Name"
                style={{
                  width: "50%"
                }}
              />
            </Form.Group>

            <Form.Group controlId="formSubjectDescription" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Subject Description</Form.Label>
              <Form.Control
                type="text"
                name="subject_description"
                value={formData.subject_description}
                onChange={handleChange}
                // placeholder="Enter Subject Description"
                style={{
                  width: "50%"
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Are you sure you want to delete the subject: <strong>{selectedSubject?.subject_name}</strong>?</p>
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

export default Subject;
