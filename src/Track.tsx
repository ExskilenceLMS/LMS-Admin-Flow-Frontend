import React, { useState,useEffect } from "react";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";


interface Data {
  track_id: string;
  track_name: string;
  track: string;
  batch_count?: number;
  courses_count?: number;
  course_name?: string;
}

const Tracks: React.FC = () => {
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState<Data[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [formData, setFormData] = useState({
    track_id:"",
    track_name: "",
    // days: "",
  });
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<Data | null>(null);

  const [selectedDropdownTrack, setSelectedDropdownTrack] = useState<string>("");
  useEffect(() => {
    fetchTracks();
  }, []);
  const fetchTracks = async () => {
    try {
      const response = await fetch('https://exskilence-suite-be.azurewebsites.net/get_all_tracks/');
      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }
      const data = await response.json();
      setTracks(data.tracks);
      setLoading(false);  
    } catch (error) {
      setLoading(false);  
    }
  };
  const handleModal = (type: string, track?: Data): void => {
    setError("");
    setModalType(type);
    if (type === "new") {
      setFormData({track_id: "", track_name: ""});
      setSelectAll(false);
    } else if (track) {
      setFormData(track);
    }
    setShowModal(true);
    setError("");
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.track_name ) {
      setError("All fields are required");
      return;
    }
    const isTrackTaken = tracks.some(track => (track.track_name.toLowerCase() === formData.track_name.toLowerCase() && track.track_id?.toLowerCase() != formData.track_id?.toLowerCase()));
    if (isTrackTaken) {
      setError("Track Name not available");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const json={
        ...formData,
        by:sessionStorage.getItem("Email")
      }
      const response = await fetch(" https://exskilence-suite-be.azurewebsites.net/create_track/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error("Failed to save Tracks");
      }

      fetchTracks();
      setShowModal(false);
    } catch (error) {
      setError("Error saving Tracks");
      console.error("Error saving Tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (track: Data): void => {
    setSelectedTrack(track);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedTrack) {
      try {
        const json={
          track_id: selectedTrack.track_id
        }
        const response = await fetch("https://exskilence-suite-be.azurewebsites.net/delete_track/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });

        if (!response.ok) {
          throw new Error("Failed to delete track");
        }
        fetchTracks();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting track:", error);
      }
    }
  };


  return (
    <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2" style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}>
      <div className="d-flex justify-content-between pe-3">
        <span className="d-flex justify-content-start align-items-center ps-4">
        <label>Tracks</label>
                  <Form.Select
                    aria-label="Default select example"
                    style={{width:"150px"}}
                    className="ms-2"
                    value={selectedDropdownTrack}
                    onChange={(e) => {setSelectedDropdownTrack(e.target.value)}}
                  >
                    <option value="">Select</option>
                    {Array.from(new Set(tracks.map(track => track.track_name)))
  .map((name) => {
    const track = tracks.find(t => t.track_name === name);
    return (
      <option key={track?.track_id} value={track?.track_id}>
        {track?.track_name}
      </option>
    );
  })}

                  </Form.Select>
          <label className="ms-2">Search</label>
          <Form.Control
            type="text"
            // placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "150px" }}
            className="ms-2"
          />
        </span>
        <button className="btn" onClick={() => { handleModal("new") }}>
          + New Track
        </button>
      </div>
            <div className="p-4">
      
      <Table  className='border-top mt-2'>
        <thead style={{borderBottom:'1px solid black',borderTop:'1px solid black'}}>
          <tr>
            <td>Sl No</td>
            <td>Track</td>
            <td>Courses</td>
            <td>Batches</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {tracks.filter ((track) => track.track_id=== selectedDropdownTrack || selectedDropdownTrack === "")
            .filter((track) => track.track_name.toLowerCase().includes(search.toLowerCase()))
            .map((track, index) => (
              <tr key={index + 1}>
                <td>{index + 1}</td>
                <td>{track.track_name}</td>
                <td>{track.course_name ? track.course_name : "--"}</td> 
                <td>{track.batch_count ? track.batch_count : "--"}</td> 
                <td>
                  {/* <img className='m-0 p-0' role="button" src={Edit} onClick={() => { handleModal("edit", track) }} alt="Edit" aria-label="Edit" /> */}
                  <img src={Delete} alt="Delete" role="button" aria-label="Delete" onClick={() => handleDelete(track)} />
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
          <p>Are you sure you want to delete the track: <strong>{selectedTrack?.track_name}</strong>?</p>
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

      <Modal show={showModal} width="80vw" onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "new" ? "Add New Track" : "Edit Track"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>
          <Form.Group controlId="formTrackName" className="d-flex align-items-center justify-content-between">
  <Form.Label className="me-2">Track Name</Form.Label>
  <Form.Control
    type="text"
    name="track_name"
    value={formData.track_name}
    onChange={(e) => setFormData({ ...formData, track_name: e.target.value })}
    style={{
      width: "50%"
    }}
  />
</Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Tracks;
