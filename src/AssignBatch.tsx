import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";

interface Course {
  course_id: string;
  course_name: string;
  batches: { batch_id: string; batch_name: string }[];
}

interface FormData {
  hoursPerDay: string;
  saturdayStudyHoliday: string;
  startDate: string;
  sundayHoliday: string;
  batch_id: string; // Add batch_id to formData
}

const AssignBatch: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>(""); // To store selected batch
  const [questionsDisplay, setQuestionsDisplay] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    hoursPerDay: "",
    saturdayStudyHoliday: "",
    startDate: "",
    sundayHoliday: "",
    batch_id: "", // Initialize batch_id
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/get_courses/"
      );
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setSelectedCourse(null);
      setSelectedBatch(""); // Reset batch dropdown if no course is selected
      return;
    }
    const selectedCourseObj = courses.find(
      (course) => course.course_id === selectedValue
    );
    setSelectedCourse(selectedCourseObj || null);
    setSelectedBatch(""); // Reset batch dropdown for new course
  };

  const handleBatchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBatch(event.target.value);
    setFormData((prevData) => ({ ...prevData, batch_id: event.target.value }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleGoButton = async () => {
    if (!questionsDisplay) {
      setQuestionsDisplay(true);
    } else {
      try {
        const payload = { ...formData, course_id: selectedCourse?.course_id };

        const selectedDate = new Date(formData.startDate);
        selectedDate.setDate(selectedDate.getDate() - 1); 
        const adjustedDate = selectedDate.toISOString().split("T")[0]; 

        navigate("/day-wise-group", {
          state: {
            data: { ...payload, startDate: adjustedDate }, 
          },
        });
      } catch (error) {
        console.error("Error saving batch", error);
      }
    }
  };

  return (
    <div
      className="border pt-3 px-2 rounded-2 bg-white my-2 me-2"
      style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}
    >
      <div>
        <div className="container-fluid mt-2">
          <h4 className="text-center mb-2">Assign Batches</h4>
          <div className="d-flex justify-content-center align-items-center">
            <div className="d-flex justify-content-center mt-3">
              <label>Select Course Plan:</label>
              <select
                style={{ width: "250px" }}
                className="form-select ms-2 form-select-sm"
                onChange={handleCourseChange}
                disabled={questionsDisplay}
                value={selectedCourse?.course_id || ""}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {selectedCourse && selectedCourse.batches.length > 0 ? (
                <div className="d-flex justify-content-center mt-3 ms-2">
                  <label>Select Batch:</label>
                  <select
                    style={{ width: "250px" }} // Same width as Course dropdown
                    className="form-select ms-2 form-select-sm"
                    onChange={handleBatchChange}
                    value={selectedBatch}
                    disabled={questionsDisplay}
                  >
                    <option value="">Select Batch</option>
                    {selectedCourse.batches.map((batch) => (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        {batch.batch_name}
                      </option>
                    ))}
                  </select>
                  {questionsDisplay ? (
                    <button
                      className="rounded-2 ms-3"
                      onClick={() => setQuestionsDisplay(false)}
                    >
                      Change Course
                    </button>
                  ) : (
                    <button
                      onClick={handleGoButton}
                      className="rounded-2 ms-3"
                      disabled={!selectedCourse || !selectedBatch}
                    >
                      Go
                    </button>
                  )}
                </div>
              ) : (
                selectedCourse && (
                  <div className="d-flex justify-content-center mt-3">
                    <p className="text-danger">Please create a batch first.</p>
                  </div>
                )
              )}
            </div>
          </div>

          {questionsDisplay && (
            <div className="card p-3 shadow-sm mt-3 container-md">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  No. of Hours per Day:
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="hoursPerDay"
                  value={formData.hoursPerDay}
                  onChange={handleInputChange}
                  min="1"
                  max="16"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Do you want Saturday study day?
                </label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="saturdayStudyHoliday"
                    value="Yes"
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="saturdayStudyHoliday"
                    value="No"
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Do you want Sunday as a holiday?
                </label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sundayHoliday"
                    value="Yes"
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sundayHoliday"
                    value="No"
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Start Date:</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>

              <button
                onClick={handleGoButton}
                className="btn btn-primary w-100 mt-2"
                disabled={!Object.values(formData).every((value) => value)}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 9999,
          }}
        >
          <PulseLoader size={10} />
        </div>
      )}
    </div>
  );
};

export default AssignBatch;
