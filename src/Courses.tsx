import React, { useState, useEffect, use } from "react";
import { Table, Button, Form, Modal, Spinner, Dropdown } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";
import Copy from "./Components/images/icons/copy.png";

interface Data {
  course_id: string;
  course_name: string;
  course_description: string;
  tracks: string[];
  track_names:string;
  course_level: string;
  batch_count?: number;
  days?: number;
  students_count: number;
}

interface Track {
  track_id: string;
  track_name: string;
}

const Courses: React.FC = () => {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<Data[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [formData, setFormData] = useState<{
    course_id: string;
    course_name: string;
    course_description: string;
    course_level: string;
    tracks: string[];
  }>({
    course_id: "",
    course_name: "",
    course_description: "",
    course_level: "",
    tracks: [],
  });
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Data | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const levels = ["Level1", "Level2", "Level3"];
  const levelValues = ["level1", "level2", "level3"];

  useEffect(() => {
    fetchCourses();
    fetchTracks();
  }, []);


  const fetchCourses = async () => {
    try {
      const response = await fetch("https://exskilence-suite-be.azurewebsites.net/get_all_courses/");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data.courses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

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

  
  const handleModal = (type: string, course?: Data): void => {
    setModalType(type);
    if (type === "new") {
      setFormData({
        course_id: "",
        course_name: "",
        course_description: "",
        course_level: "",
        tracks: [],
      });
      setSelectAll(false);
      setSelectedTracks([]);
    } else if (course) {
      setSelectedTracks(course.tracks);
      setFormData(course);
      setSelectAll(
        levelValues.every((level) => course.course_level.includes(level))
      );
      
      
    }
    setShowModal(true);
    setError("");
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value, checked } = e.target;

    if (value === "selectAll") {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);

      setFormData({
        ...formData,
        course_level: newSelectAll ? levelValues.join(",") : "",
      });
    } else {
      const updatedLevels = formData.course_level
        .split(",")
        .filter((level) => level !== "");

      if (checked) {
        updatedLevels.push(value);
      } else {
        const index = updatedLevels.indexOf(value);
        if (index > -1) {
          updatedLevels.splice(index, 1);
        }
      }

      const newLevel = updatedLevels.join(",");
      setFormData({
        ...formData,
        course_level: newLevel,
      });

      setSelectAll(updatedLevels.length === levelValues.length);
    }
  };

  const handleTrackChange = (trackId: string, checked: boolean): void => {
    let updatedTracks = [...selectedTracks];
    if (checked) {
      updatedTracks.push(trackId);
    } else {
      updatedTracks = updatedTracks.filter((track) => track !== trackId);
    }
    setSelectedTracks(updatedTracks);
    setFormData({
      ...formData,
      tracks: updatedTracks,
    });
  };
  

  const handleSave = async (): Promise<void> => {
    if (!formData.course_name || !formData.course_description) {
      setError("All fields are required");
      return;
    }
    if (formData.tracks.length === 0) {
      setError("Select atleast one track");
      return;
    }
    const isCourseTaken = courses.some(
      (course) =>
        course.course_name.toLowerCase() ===
          formData.course_name.toLowerCase() &&
        course.course_id?.toLowerCase() != formData.course_id?.toLowerCase()
    );
    if (isCourseTaken) {
      setError("Course Name not available");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const json = {
        ...formData,
        by: sessionStorage.getItem("Email"),
      };
      const response = await fetch(" https://exskilence-suite-be.azurewebsites.net/create_course/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error("Failed to save Courses");
      }

      fetchCourses();
      setShowModal(false);
    } catch (error) {
      setError("Error saving Courses");
      console.error("Error saving Courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (course: Data): void => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedCourse) {
      try {
        const json = {
          course_id: selectedCourse.course_id,
        };
        const response = await fetch("https://exskilence-suite-be.azurewebsites.net/delete_course/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });

        if (!response.ok) {
          throw new Error("Failed to delete course");
        }
        fetchCourses();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleCopy = (course: Data): void => {
    const textToCopy = `Course ID: ${course.course_id}\nCourse Name: ${course.course_name}\nCourse Description: ${course.course_description}\nCourse Level: ${course.course_level}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  return (
    <div
      className="border pt-3 px-2 rounded-2 bg-white my-2 me-2"
      style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}
    >
      <div className="d-flex justify-content-between pe-3">
        <span className="d-flex justify-content-start align-items-center ps-4">
          <label>Search</label>
          <Form.Control
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "150px" }}
            className="ms-2"
          />
        </span>
        <button
          className="btn"
          onClick={() => {
            handleModal("new");
          }}
        >
          + New Course
        </button>
      </div>
      <div className="p-4">
        <Table className="border-top mt-2">
          <thead
            style={{
              borderBottom: "1px solid black",
              borderTop: "1px solid black",
            }}
          >
            <tr>
              <td>Sl No</td>
              <td>Course Name</td>
              <td>Description</td>
              <td>Tracks</td>
              <td>Level</td>
              <td>Students</td>
              <td>Batches</td>
              <td>Days</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {courses
              .filter((course) =>
                course.course_name.toLowerCase().includes(search.toLowerCase())
              )
              .map((course, index) => (
                <tr key={index + 1}>
                  <td>{index + 1}</td>
                  <td>{course.course_name}</td>
                  <td>{course.course_description}</td>
                  <td>{course.track_names?course.track_names.replaceAll(",", ", "):"--"}</td> 
                  <td>{course.course_level.replaceAll(",", " ")}</td>
                  <td>{course.students_count}</td>
                  <td>{course.batch_count}</td>
                  <td>{course.days ? course.days : "--"}</td>
                  <td>
                    <img
                      className="m-0 p-0"
                      role="button"
                      src={Edit}
                      onClick={() => {
                        handleModal("edit", course);
                      }}
                      alt="Edit"
                      aria-label="Edit"
                    />
                    <img
                      src={Copy}
                      alt="Copy"
                      role="button"
                      aria-label="Copy"
                      onClick={() => handleCopy(course)}
                    />
                    <img
                      src={Delete}
                      alt="Delete"
                      role="button"
                      aria-label="Delete"
                      onClick={() => handleDelete(course)}
                    />
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
          <p>
            Are you sure you want to delete the course:{" "}
            <strong>{selectedCourse?.course_name}</strong>?
          </p>
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
          <Modal.Title>
            {modalType === "new" ? "Add New Course" : "Edit Course"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>
            <Form.Group
              controlId="formTrack"
              className="d-flex align-items-center justify-content-between"
            >
              <Form.Label className="me-2">Track</Form.Label>
              <Dropdown style={{ width: '50%' }}>
  <Dropdown.Toggle variant="secondary" id="dropdown-basic" style={{ width: '100%' }}>
    Select Tracks
  </Dropdown.Toggle>
  <Dropdown.Menu onMouseDown={(e) => e.stopPropagation()} style={{ width: '100%' }}>
    {tracks.map((track) => (
      <Dropdown.Item key={track.track_id} as="div">
        <Form.Check
          type="checkbox"
          label={track.track_name}
          checked={selectedTracks.includes(track.track_id)}
          onChange={(e) =>
            handleTrackChange(track.track_id, e.target.checked)
          }
        />
      </Dropdown.Item>
    ))}
  </Dropdown.Menu>
</Dropdown>

            </Form.Group>
            <Form.Group
              controlId="formCourseName"
              className="mt-3 d-flex align-items-center justify-content-between"
            >
              <Form.Label className="me-2">Course Name</Form.Label>
              <Form.Control
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={(e) =>
                  setFormData({ ...formData, course_name: e.target.value })
                }
                style={{
                  width: "50%",
                }}
              />
            </Form.Group>

            <Form.Group
              controlId="formCourseDescription"
              className="mt-3 d-flex align-items-center justify-content-between"
            >
              <Form.Label>Course Description</Form.Label>
              <Form.Control
                type="text"
                name="course_description"
                value={formData.course_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    course_description: e.target.value,
                  })
                }
                style={{
                  width: "50%",
                }}
              />
            </Form.Group>

            <Form.Group
              controlId="formCourseLevel"
              className="mt-3 d-flex  justify-content-start"
            >
              <Form.Label
                style={{
                  width: "50%",
                }}
              >
                Course Level
              </Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  value="selectAll"
                  label="Select All"
                  checked={selectAll}
                  onChange={handleLevelChange}
                />
                <div>
                  {levels.map((level, index) => (
                    <Form.Check
                      key={level}
                      type="checkbox"
                      value={levelValues[index]}
                      label={level}
                      checked={formData.course_level
                        .split(",")
                        .includes(levelValues[index])}
                      onChange={handleLevelChange}
                    />
                  ))}
                </div>
              </div>
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

export default Courses;
