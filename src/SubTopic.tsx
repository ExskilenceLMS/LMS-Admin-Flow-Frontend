import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";
import {Spinner} from "react-bootstrap";
import axios from "axios";
interface Data {
  sub_topic_id?: string;
  sub_topic_name: string;
  sub_topic_alt_name: string;
  sub_topic_description: string;
  subject_id?: string;
  subject_name?: string;
  topic_id?: string;
  topic_name?: string;
}
interface Subject {
  subject_id: string;
  subject_name: string;
}
interface Topic {
  topic_id: string;
  topic_name: string;
}

interface Track {
  track_id: string;
  track_name: string;
}

const SubTopic: React.FC = () => {
  const [subTopics, setSubTopics] = useState<Data[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [loading, setLoading] = useState<boolean>(false);
  const[subjects, setSubjects] = useState<Subject[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState("")
  const [formData, setFormData] = useState<Data>({
    sub_topic_id: "",
    sub_topic_name: "",
    sub_topic_alt_name: "",
    sub_topic_description: "",
    subject_id: "",
    topic_id:"",
  });
  const [error, setError] = useState<string>("");
   const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedSubTopic, setSelectedSubTopic] = useState<Data>()
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTopic,setSelectedTopic] =useState("")
  const [topics, setTopics] = useState<Topic[]>([]);
  const handleModal = (type: string, subTopic?: Data): void => {
    setError("");
    setModalType(type);
    if (type === "new") {
      setFormData({ sub_topic_id: "", sub_topic_name: "", sub_topic_alt_name: "" ,sub_topic_description: "", subject_id:selectedSubject, topic_id:selectedTopic });
    } else if (subTopic) {
      setFormData(subTopic);
    }
    setShowModal(true);
  };

  const handleChange = (e:any): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setError(""); 
    if (!formData.sub_topic_name ) {
      setError("Sub Topic Name is  required");
      return;
    }
    if (!formData.topic_id ) {
      setError("Topic is  required");
      return;
    }
    if (modalType === "new") {
      console.log('new')
      const existingSubTopic = subTopics.find(
        (subTopic) =>
          subTopic.sub_topic_name.toLowerCase() === formData.sub_topic_name.toLowerCase() &&
          subTopic.subject_id?.toLowerCase() === formData.subject_id?.toLowerCase() &&
          subTopic.topic_id?.toLowerCase() === formData.topic_id?.toLowerCase()
      );
      console.log(existingSubTopic)
      if (existingSubTopic) {
        setError("A subTopic with this name already exists. Please choose a different name.");
        return;
      }
    }
    else{
      console.log("edit")
     const existingSubTopic = subTopics.find(
      (subTopic) =>
        subTopic.sub_topic_name.toLowerCase() === formData.sub_topic_name.toLowerCase() &&
        subTopic.sub_topic_id?.toLowerCase() !== formData.sub_topic_id?.toLowerCase() &&
        subTopic.subject_id?.toLowerCase() === formData.subject_id?.toLowerCase() &&
        subTopic.topic_id?.toLowerCase() === formData.topic_id?.toLowerCase()
    );
    if (existingSubTopic) {
      setError("A subTopic with this name already exists. Please choose a different name.");
      return;
    }
    }
    
    let subTopicsToSend = {...formData, by:sessionStorage.getItem("Email")};
    try {
      const response = await fetch('https://exskilence-suite-be.azurewebsites.net/create_subTopic/', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subTopicsToSend),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save subTopics');
      }
  
      console.log('Sub Topics saved successfully');
    } catch (error) {
      console.error('Error saving subTopics:', error);
    }
  
    setShowModal(false);
    fetchSubTopics();
  };

useEffect(() => {
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

useEffect(() => {
      setTopics([]);
      setSelectedSubject('')
      setSubjects([]);
      if (selectedTrack!="") {
       fetchSubjects();
      }
  },[selectedTrack])

     useEffect(() => {
      setSubTopics([]);
      setSelectedTopic("");
         if (selectedSubject!="") {
          
          fetchTopics();
         }
     },[selectedSubject])

     useEffect (() => {
      if (selectedTopic!="") {
        fetchSubTopics();
      }
     },[selectedTopic])

    const fetchTopics = async () => {
      try {
        const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_topics_for_subject/${selectedSubject}/`);
        setTopics(response.data.topics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subTopics:', error);
        setLoading(false);
      }
    }

     const fetchSubTopics = async () => {
      try {
        const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_all_subTopics/${selectedTopic}/`);
        setSubTopics(response.data.sub_topics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subTopics:', error);
        setLoading(false);
      }
    };
     const fetchSubjects = async () => {
      try {
        const response = await fetch(`https://exskilence-suite-be.azurewebsites.net/subjects_for_subTopics/${selectedTrack}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch subTopics');
        }
        const data = await response.json();
        setSubjects(data.subjects);
        setLoading(false);  
      } catch (error) {
        setLoading(false);  
      }
    };

     const handleDelete = (subTopic: Data): void => {
      setSelectedSubTopic(subTopic);
      setShowDeleteModal(true);
    };
  
    const confirmDelete = async (): Promise<void> => {
      if (selectedSubTopic) {
        try {
          const json={
            sub_topic_id: selectedSubTopic.sub_topic_id
          }
          const response = await fetch("https://exskilence-suite-be.azurewebsites.net/delete_sub_topic/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(json),
          });
  
          if (!response.ok) {
            throw new Error("Failed to delete subTopic");
          }
          fetchSubTopics();
          setShowDeleteModal(false);
        } catch (error) {
          console.error("Error deleting subTopic:", error);
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
                   <Form.Select className="me-3" style={{width:"150px"}} onChange={(e) => setSelectedTrack(e.target.value)} value={selectedTrack}>
                     <option value="">Select Track</option>
                     {tracks.map((track) => (
                       <option key={track.track_id} value={track.track_id}> {track.track_name} </option>
                     ))}
                   </Form.Select>
               <label className="mx-2">Subject</label>
                   <Form.Select className="me-3" style={{width:"150px"}}  onChange={(e) => setSelectedSubject(e.target.value)} value={selectedSubject}>
                 <option value="">Select Subject</option> 
                 {subjects.map((subject) => (
                   <option key={subject.subject_id} value={subject.subject_id}>
                     {subject.subject_name}
                   </option>
                 ))}
               </Form.Select>

        <label className="me-2">Topic</label>
            <Form.Select className="me-3" style={{width:"150px"}} onChange={(e) => setSelectedTopic(e.target.value)} value={selectedTopic}>
          <option value="">Select Topic</option> 
          {topics.map((topic) => (
            <option key={topic.topic_id} value={topic.topic_id}>
              {topic.topic_name}
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
        <button className="btn"  role ="button" onClick={() => { handleModal("new") }} disabled={selectedSubject === ""}>
          + New Sub Topic
        </button>
      </div>

      <div className="p-4">
      <Table className=' mt-2'>
        <thead style={{borderBottom:'1px solid black',borderTop:'1px solid black'}}>
          <tr>
            <td>Sl No</td>
            <td>Sub Topic ID</td>
            <td>Sub Topic Name</td>
            <td>Sub Topic Alt Name</td>
            <td>Sub Topic Description</td>
            <td>Topic Name</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {subTopics.filter((subTopic) => subTopic.sub_topic_name.toLowerCase().includes(search.toLowerCase())).map((subTopic, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{subTopic.sub_topic_id}</td>
              <td>{subTopic.sub_topic_name}</td>
              <td>{subTopic.sub_topic_alt_name}</td>
              <td>{subTopic.sub_topic_description}</td>
              <td>{subTopic.topic_name}</td>
              <td>
                <img
                  src={Edit}
                  alt="Edit" role ="button" 
                  onClick={() => { handleModal("edit", subTopic) }}
                />
                <img src={Delete}  role ="button" alt="Delete" onClick={() => handleDelete(subTopic)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "new" ? "Add New Sub Topic" : "Edit Sub Topic"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {/* <Form.Group controlId="formSubject">
              <Form.Label>Subject</Form.Label>
              <Form.Select
                value={formData.subject_id}  
                name="subject_id"
                onChange={handleChange}  
                disabled={modalType === "edit"}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group> */}

            <Form.Group controlId="formTopic" className="d-flex align-items-center justify-content-between">
              <Form.Label>Topic</Form.Label>
              <Form.Select
                value={formData.topic_id}  
                name="topic_id"
                onChange={handleChange}  
                disabled={modalType === "edit"}
                style={{
                  width: "50%"
                }}
>
                <option value="">Select</option>
                {topics.map((topic) => (
                  <option key={topic.topic_id} value={topic.topic_id}>
                    {topic.topic_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formSubTopicName" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Sub Topic Name</Form.Label>
              <Form.Control
                type="text"
                name="sub_topic_name"
                value={formData.sub_topic_name}
                onChange={handleChange}
                // placeholder="Enter Sub Topic Name"
                style={{
                  width: "50%"
                }}
              />
            </Form.Group>

            <Form.Group controlId="formSubTopicAltName" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Sub Topic Alt Name</Form.Label>
              <Form.Control
                type="text"
                name="sub_topic_alt_name"
                value={formData.sub_topic_alt_name}
                onChange={handleChange}
                // placeholder="Enter Alternate Sub Topic Name"

                style={{
                  width: "50%"
                }}/>
            </Form.Group>

            <Form.Group controlId="formSubTopicDescription" className="mt-3 d-flex align-items-center justify-content-between">
              <Form.Label>Sub Topic Description</Form.Label>
              <Form.Control
                type="text"
                name="sub_topic_description"
                value={formData.sub_topic_description}
                onChange={handleChange}
                // placeholder="Enter Sub Topic Description"
                style={{
                  width: "50%"
                }}              />
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
                <p>Are you sure you want to delete the subTopic: <strong>{selectedSubTopic?.sub_topic_name}</strong>?</p>
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

export default SubTopic;
