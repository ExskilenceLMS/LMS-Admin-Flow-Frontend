import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";
import {Spinner} from "react-bootstrap";
import axios from "axios";
interface Data {
  topic_id?: string;
  topic_name: string;
  topic_alt_name: string;
  topic_description: string;
  subject_id?: string;
  subject_name?: string;
}
interface Subject {
  subject_id: string;
  subject_name: string;
}

interface Track {
  track_id: string;
  track_name: string;
}

const Topic: React.FC = () => {
  const [topics, setTopics] = useState<Data[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [loading, setLoading] = useState<boolean>(false);
  const[subjects, setSubjects] = useState<Subject[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [formData, setFormData] = useState<Data>({
    topic_id: "",
    topic_name: "",
    topic_alt_name: "",
    topic_description: "",
    subject_id: "",
  });
  const [error, setError] = useState<string>("");
   const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<Data>()
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("")
  const handleModal = (type: string, topic?: Data): void => {
    setError("");
    setModalType(type);
    if (type === "new") {
      setFormData({ topic_id: "", topic_name: "", topic_alt_name: "" ,topic_description: "", subject_id:selectedSubject});
    } else if (topic) {
      setFormData(topic);
    }
    setShowModal(true);
  };

  const handleChange = (e:any): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setError(""); 
    if (!formData.topic_name ) {
      setError("Topic Name is  required");
      return;
    }
    const existingTopic = topics.find(
      (topic) =>
        topic.topic_name.toLowerCase() === formData.topic_name.toLowerCase() &&
        topic.topic_id?.toLowerCase() !== formData.topic_id?.toLowerCase() &&
        topic.subject_id?.toLowerCase() === formData.subject_id?.toLowerCase()
    );
  
    if (existingTopic) {
      setError("A topic with this name already exists. Please choose a different name.");
      return;
    }
    let topicsToSend = {...formData, by:sessionStorage.getItem("Email")};
    try {
      const response = await fetch('https://exskilence-suite-be.azurewebsites.net/create_topic/', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicsToSend),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save topics');
      }
  
      console.log('Topics saved successfully');
    } catch (error) {
      console.error('Error saving topics:', error);
    }
  
    setShowModal(false);
    fetchTopics();
  };

    useEffect(() => {
      fetchTracks();
     }, []);

     useEffect(() => {
      setTopics([]);
         if (selectedSubject!="") {
          
          fetchTopics();
         }
     },[selectedSubject])

     useEffect(() => {
      setTopics([]);
      setSelectedSubject('')
      setSubjects([]);
      if (selectedTrack!="") {
       fetchSubjects();
      }
  },[selectedTrack])

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
     const fetchTopics = async () => {
      try {
        const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_all_topics/${selectedSubject}/`);
        setTopics(response.data.topics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setLoading(false);
      }
    };
     const fetchSubjects = async () => {
      try {
        const response = await fetch(`https://exskilence-suite-be.azurewebsites.net/subjects_for_topics/${selectedTrack}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setSubjects(data.subjects);
        setLoading(false);  
      } catch (error) {
        setLoading(false);  
      }
    };

     const handleDelete = (topic: Data): void => {
      setSelectedTopic(topic);
      setShowDeleteModal(true);
    };
  
    const confirmDelete = async (): Promise<void> => {
      if (selectedTopic) {
        try {
          const json={
            topic_id: selectedTopic.topic_id
          }
          const response = await fetch("https://exskilence-suite-be.azurewebsites.net/delete_topic/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(json),
          });
  
          if (!response.ok) {
            throw new Error("Failed to delete topic");
          }
          fetchTopics();
          setShowDeleteModal(false);
        } catch (error) {
          console.error("Error deleting topic:", error);
        }
      }
    };

    
  return (
    <>
    {loading &&
      <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, 
      }}
    >
      <Spinner animation="border" role="status" />
    </div>
  }
    <div className="border rounded-2 bg-white my-2 me-2" style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}>
      <div className="d-flex justify-content-between mt-2 pe-3">
      <span className="d-flex justify-content-start align-items-center ps-4">
        <label className="me-2">Track</label>
            <Form.Select style={{width:"150px"}} className="me-3" onChange={(e) => setSelectedTrack(e.target.value)} value={selectedTrack}>
              <option value="">Select Track</option>
              {tracks.map((track) => (
                <option key={track.track_id} value={track.track_id}> {track.track_name} </option>
              ))}
            </Form.Select>
        <label className="mx-2">Subject</label>
            <Form.Select className="me-3" style={{width:"150px"}} onChange={(e) => setSelectedSubject(e.target.value)} value={selectedSubject}>
          <option value="">Select Subject</option> 
          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </Form.Select>
        
        
        <label>Search</label>
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "150px" }}
              className="ms-2"
            />
                </span>


        <span className="d-flex justify-content-start align-items-center ps-4">
            
          </span>
        <button className="btn" onClick={() => { handleModal("new") }}>
          + New Topic
        </button>
      </div>

      <div className="p-4">
      <Table className=' mt-2'>
        <thead style={{borderBottom:'1px solid black',borderTop:'1px solid black'}}>
          <tr>
            <td>Sl No</td>
            <td>Topic ID</td>
            <td>Topic Name</td>
            <td>Topic Alt Name</td>
            <td>Topic Description</td>
            <td>Subject Name</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {topics.filter((topic) => topic.topic_name.toLowerCase().includes(search.toLowerCase())).map((topic, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{topic.topic_id}</td>
              <td>{topic.topic_name}</td>
              <td>{topic.topic_alt_name}</td>
              <td>{topic.topic_description}</td>
              <td>{topic.subject_name}</td>
              <td>
                <img
                  src={Edit}  role ="button" 
                  alt="Edit"
                  onClick={() => { handleModal("edit", topic) }}
                />
                <img src={Delete} role ="button"  alt="Delete" onClick={() => handleDelete(topic)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "new" ? "Add New Topic" : "Edit Topic"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Form.Group controlId="formSubject" className="d-flex align-items-center justify-content-between">
              <Form.Label>Subject</Form.Label>
              <Form.Select
                value={formData.subject_id}  
                name="subject_id"
                onChange={handleChange}  
                disabled={modalType === "edit"}
                style={{
                  width: "50%"
                }}
              >
                <option value="">Select</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formTopicName" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Topic Name</Form.Label>
              <Form.Control
                type="text"
                name="topic_name"
                value={formData.topic_name}
                onChange={handleChange}
                // placeholder="Enter Topic Name"
                style={{
                  width: "50%"
                }}
              />
            </Form.Group>

            <Form.Group controlId="formTopicAltName" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Topic Alt Name</Form.Label>
              <Form.Control
                type="text"
                name="topic_alt_name"
                value={formData.topic_alt_name}
                onChange={handleChange}
                // placeholder="Enter Alternate Topic Name"
                style={{
                  width: "50%"
                }}
              />
            </Form.Group>

            <Form.Group controlId="formTopicDescription" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Topic Description</Form.Label>
              <Form.Control
                type="text"
                name="topic_description"
                value={formData.topic_description}
                onChange={handleChange}
                // placeholder="Enter Topic Description"
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
                <p>Are you sure you want to delete the topic: <strong>{selectedTopic?.topic_name}</strong>?</p>
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
    </>
  );
};

export default Topic;
