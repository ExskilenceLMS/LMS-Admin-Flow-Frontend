import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import Delete from "./Components/images/icons/delete.png";
import Edit from "./Components/images/icons/edit.png";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface Course {
  course_id: string;
  course_name: string;
}

interface StudentData {
  student_id?: string;
  course_id: string;
  batch_id: string;
  student_firstname: string;
  student_lastname: string;
  student_email: string;
  student_gender: string;
  student_country: string;
  student_state: string;
  student_city: string;
  student_dob: string;
  student_course_starttime: string;
  college: string;
  branch: string;
  student_address: string;
  student_pincode: string;
  student_phone: string;
  student_altphone: string;
  student_type: string;
  student_isActive: boolean;
  student_qualification: string;
  allocate: boolean;
}

interface Batch {
  batch_name: string;
  batch_id: string;
}

interface College {
  college_id: string;
  college_name: string;
  center_name: string;
  college_code: string;
  branches: Branch[];
}

interface Branch {
  branch_id: string;
  branch_name: string;
}

const Student: React.FC = () => {
  const location = useLocation();
  const batchId = location.state?.batch_id ? location.state.batch_id : "";
  const batchName = location.state?.batch_name ? location.state.batch_name : "";
  const courseId = location.state?.course_id ? location.state.course_id : "";
  const navigate = useNavigate();
  const [batchStudents, setBatchStudents] = useState<StudentData[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("new");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [students, setStudents] = useState<StudentData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId);
  const [selectedBatch, setSelectedBatch] = useState(batchId);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [modalBatches, setModalBatches] = useState<Batch[]>([]);
  const [modalCourses, setModalCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [formData, setFormData] = useState<StudentData>({
    student_firstname: "",
    student_lastname: "",
    course_id: selectedCourse,
    batch_id: selectedBatch,
    student_email: "",
    student_gender: "",
    student_country: "India",
    student_state: "Karnataka",
    student_city: "",
    student_dob: "",
    student_course_starttime: "",
    college: "",
    branch: "",
    student_address: "",
    student_pincode: "",
    student_phone: "",
    student_altphone: "",
    student_type: "Swapnodaya",
    student_isActive: true,
    student_qualification: "",
    allocate: false
  });
  const [showResModal, setResShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>('');

  useEffect(() => {
    if (!batchId || !courseId || !batchName) {
      navigate("/batches");
    }
  }, [batchId, courseId]);

  useEffect(() => {
    fetchCourses();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (selectedBatch !== "") {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedCourse !== "") {
      setStudents([])
      fetchBatches();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (formData.course_id !== "") {
      fetchModalBatches();
    }
  }, [formData.course_id]);

  useEffect(() => {
    if (selectedCollege !== "") {
      const college = colleges.find(college => college.college_code === selectedCollege);
      if (college) {
        setBranches(college.branches);
      }
    } else {
      setBranches([]);
    }
  }, [selectedCollege, colleges]);
  

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_all_batch/${selectedCourse}/`);
      setBatches(response.data.batches);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchModalBatches = async () => {
    try {
      const response = await axios.get(`https://exskilence-suite-be.azurewebsites.net/get_all_batch/${formData.course_id}/`);
      const batches = response.data.batches;
      setModalBatches(batches);
      if (batches.length > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          batch_id: batches[0].batch_id,
        }));
      }
      setLoading(false);
    } catch (error) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        batch_id: "",
      }));
      setModalBatches([]);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://exskilence-suite-be.azurewebsites.net/get_all_courses_for_batch/');
      setCourses(response.data.courses);
      setModalCourses(response.data.courses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching courses:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await axios.get('https://exskilence-suite-be.azurewebsites.net/branch_and_college/');
      setColleges(response.data.colleges);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchStudents = async () => {
    if (selectedCourse === "" || selectedBatch === "") return;
    try {
      const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/get_students_of_batch/", { batch_id: selectedBatch, course_id: selectedCourse });
      setStudents(response.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleModal = (type: string, student?: StudentData): void => {
    setModalType(type);
    if (type === "new") {
      setFormData({
        student_firstname: "",
        course_id: selectedCourse,
        batch_id: selectedBatch,
        student_lastname: "",
        student_email: "",
        student_gender: "",
        student_country: "India",
        student_state: "Karnataka",
        student_city: "",
        student_course_starttime: "",
        student_dob: "",
        college: "",
        branch: "",
        student_address: "",
        student_pincode: "",
        student_phone: "",
        student_altphone: "",
        student_isActive: true,
        student_qualification: "",
        student_type: "Swapnodaya",
        allocate: false
      });
      setSelectedCollege("");
      setSelectedBranch("");
      setSelectAll(false);
    } else if (student) {
      setFormData(student);
      setSelectedCollege(student.college);
      setSelectedBranch(student.branch);
      setSelectAll(false);
    }
    setShowModal(true);
    setError("");
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.batch_id || !formData.student_firstname || !formData.student_lastname || !formData.student_gender || !formData.student_email || !formData.student_phone || !formData.student_dob || !formData.college || !formData.branch) {
      setError("All * marked fields are required");
      return;
    }

    const isBatchTaken = students.some(student => (student.student_email.toLowerCase() === formData.student_email.toLowerCase() && student.student_id !== formData.student_id));
    if (isBatchTaken) {
      setError("Email not available");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const json = { ...formData };
      const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/create_student/", json, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSelectedCollege('')
      setSelectedBranch('')
      fetchStudents();
      setShowModal(false);
    } catch (error) {
      setError("Error saving Student");
      console.error("Error saving Student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (student: StudentData): void => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedStudent) {
      try {
        const json = {
          id: selectedStudent.student_id,
        };

        const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/delete_student/", json, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        fetchStudents();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'csv') {
        reader.onload = function (event) {
          const csvData = event.target?.result;
          if (csvData) {
            const parsedData = Papa.parse(csvData as string, {
              header: true,
              skipEmptyLines: true,
            });
            const filteredData = parsedData.data.filter((row: Record<string, string>) => Object.values(row).some(value => value !== ""));
            insertDataIntoDatabase(filteredData);
          }
        };
        reader.readAsText(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        reader.onload = function (event) {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false });
          const headers = worksheet[0] as string[];
          const rows = worksheet.slice(1).map((row: unknown, index: number) => {
            if (Array.isArray(row)) {
              let obj: Record<string, string> = {};
              headers.forEach((header, i) => {
                if (header === 'dob' && typeof row[i] === 'number') {
                  const date = new Date((row[i] - (25567 + 1)) * 86400 * 1000);
                  obj[header] = date.toISOString().split('T')[0];
                } else {
                  obj[header] = row[i] ?? "";
                }
              });
              return obj;
            }
            return {};
          });
          const filteredRows = rows.filter(row => Object.values(row).some(value => value !== ""));

          insertDataIntoDatabase(filteredRows);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Unsupported file format. Please upload a CSV or Excel file.');
      }
    }
  };

  const insertDataIntoDatabase = (data: any) => {
    setLoading(true);
    axios
      .post('https://exskilence-suite-be.azurewebsites.net/import_students/', { data, course_id: selectedCourse, batch_id: selectedBatch })
      .then((response) => {
        const message = response.data.message;
        const editedCount = response.data.edited_count;
        const savedCount = response.data.saved_count;
        const errorCount = response.data.error_count;
        const editedStudents = response.data.edited_student ? response.data.edited_student.slice(0, response.data.edited_student.length - 2) : "None";
        const savedStudents = response.data.saved_student ? response.data.saved_student.slice(0, response.data.saved_student.length - 2) : "None";
        const errorStudents = response.data.error_student ? response.data.error_student.slice(0, response.data.error_student.length - 2) : "None";
        const newMessage = `${message}\nEdited Count: ${editedCount}\nSaved Count: ${savedCount}\nError Count: ${errorCount}\nEdited Students: ${editedStudents}\nSaved Students: ${savedStudents}\nError for Students: ${errorStudents}`;
        setModalMessage(newMessage);
        setResShowModal(true);
        fetchStudents();
      })
      .catch((error) => {
        console.error('There was an error inserting the data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
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
      <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2" style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }}>
        <div className="d-flex justify-content-between ">
          <span className="d-flex justify-content-start align-items-center ps-4">
            <label className='me-2'>Course</label>
            <Form.Select className="me-3" style={{ width: "150px" }} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBatch('') }} value={selectedCourse}>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </Form.Select>
            <label className='me-2'>Batch</label>
            <Form.Select className="me-3" style={{ width: "150px" }} onChange={(e) => setSelectedBatch(e.target.value)} value={selectedBatch}>
              <option value="" key="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.batch_name}
                </option>
              ))}
            </Form.Select>
          </span>
          <div>
            <button className="btn" onClick={() => { handleModal("new") }}>
              + New Student
            </button>
            <span>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="fileUpload"
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={() => document.getElementById('fileUpload')?.click()}
              >
                Import
              </button>
            </span>
          </div>
        </div>
        <div className="p-4">
          <Table className='border-top mt-2'>
            <thead style={{ borderBottom: '1px solid black', borderTop: '1px solid black' }}>
              <tr>
                <td className='fw-normal'>ID</td>
                <td className='fw-normal'>Name</td>
                <td className='fw-normal'>Student Type</td>
                <td className='fw-normal'>College</td>
                <td className='fw-normal'>Branch</td>
                <td className='fw-normal'>Allocation</td>
                <td className='fw-normal'>Action</td>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.student_id}>
                  <td>{student.student_id}</td>
                  <td>{student.student_firstname + " " + student.student_lastname}</td>
                  <td>{student.student_type}</td>
                  <td>{student.college}</td>
                  <td>{student.branch}</td>
                  <td role="button" onClick={async () => {
                    try {
                      setLoading(true);
                      const response = await axios.post("https://exskilence-suite-be.azurewebsites.net/allocate_student/", { student_id: student.student_id });
                      fetchStudents();
                      setLoading(false);
                    } catch (error) {
                      console.error("Error fetching students:", error);
                    }
                  }}>{student.allocate ? "Unassign" : "Assign"}</td>
                  <td>
                    <img role="button" src={Edit} onClick={() => { handleModal("edit", student) }} alt="Edit" aria-label="Edit" />
                    <img role="button" src={Delete} alt="Delete" aria-label="Delete" onClick={() => handleDelete(student)} />
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
            <p>Are you sure you want to delete the student: <strong>{selectedStudent?.student_firstname + " " + selectedStudent?.student_lastname}</strong>?</p>
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

        <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg">
          <Modal.Header closeButton>
            <Modal.Title>{modalType === "new" ? "Add New Student" : "Edit Student"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='pt-0'>
            {error && <p className="text-danger">{error}</p>}
            <Form>
              <div className="row">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentCourse" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Course</Form.Label>
                    <Form.Select style={{ width: "50%" }} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} value={formData.course_id}>
                      {modalCourses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.course_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentBatch" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Batch</Form.Label>
                    <Form.Select style={{ width: "50%" }} onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })} value={formData.batch_id}>
                      {modalBatches.map((batch) => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                          {batch.batch_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
              <div className="row  ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentFirstName" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*First Name</Form.Label>
                    <Form.Control
                      type="text" style={{ width: "50%" }}
                      name="student_firstname"
                      required
                      value={formData.student_firstname}
                      onChange={(e) => setFormData({ ...formData, student_firstname: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentLastName" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Last Name</Form.Label>
                    <Form.Control
                      type="text" style={{ width: "50%" }}
                      name="student_lastname"
                      value={formData.student_lastname}
                      onChange={(e) => setFormData({ ...formData, student_lastname: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentGender" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Gender</Form.Label>
                    <Form.Select style={{ width: "50%" }} onChange={(e) => setFormData({ ...formData, student_gender: e.target.value })} value={formData.student_gender}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentMail" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Email</Form.Label>
                    <Form.Control style={{ width: "50%" }}
                      type="email"
                      name="student_email"
                      value={formData.student_email}
                      onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentPhone" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Mobile</Form.Label>
                    <Form.Control
                      style={{ width: "50%" }}
                      type="number"
                      name="student_phone"
                      value={formData.student_phone}
                      onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentDOB" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      style={{ width: "50%" }}
                      name="student_dob"
                      value={formData.student_dob}
                      onChange={(e) => setFormData({ ...formData, student_dob: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentCountry" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      style={{ width: "50%" }}
                      type="text"
                      name="student_country"
                      value={formData.student_country}
                      onChange={(e) => setFormData({ ...formData, student_country: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentState" className="d-flex align-items-center justify-content-between">
                    <Form.Label>State</Form.Label>
                    <Form.Control style={{ width: "50%" }}
                      type="text"
                      name="student_state"
                      value={formData.student_state}
                      onChange={(e) => setFormData({ ...formData, student_state: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentCity" className="d-flex align-items-center justify-content-between">
                    <Form.Label>City</Form.Label>
                    <Form.Control style={{ width: "50%" }}
                      type="text"
                      name="student_city"
                      value={formData.student_city}
                      onChange={(e) => setFormData({ ...formData, student_city: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentAddress" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      style={{ width: "50%" }}
                      type="text"
                      name="student_address"
                      value={formData.student_address}
                      onChange={(e) => setFormData({ ...formData, student_address: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentPinCode" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Pin Code</Form.Label>
                    <Form.Control
                      style={{ width: "50%" }}
                      type="text"
                      name="student_pincode"
                      value={formData.student_pincode}
                      onChange={(e) => setFormData({ ...formData, student_pincode: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentAltPhone" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Alt Mobile</Form.Label>
                    <Form.Control
                      type="number"
                      style={{ width: "50%" }}
                      name="student_altphone"
                      value={formData.student_altphone}
                      onChange={(e) => setFormData({ ...formData, student_altphone: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentQualification" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Qualification</Form.Label>
                    <Form.Control
                      style={{ width: "50%" }}
                      type="text"
                      name="student_qualification"
                      value={formData.student_qualification}
                      onChange={(e) => setFormData({ ...formData, student_qualification: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentCollege" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*College</Form.Label>
                    <Form.Select style={{ width: "50%" }} onChange={(e) => { setSelectedCollege(e.target.value); setFormData({ ...formData, college: e.target.value }) }} value={selectedCollege}>
                      <option value="">Select College</option>
                      {colleges.map((college) => (
                        <option key={college.college_id} value={college.college_code}>
                          {college.college_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentBranch" className="d-flex align-items-center justify-content-between">
                    <Form.Label>*Branch</Form.Label>
                    <Form.Select style={{ width: "50%" }} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} value={formData.branch}>
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_name}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentType" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Student Type</Form.Label>
                    <Form.Select
                      style={{ width: "50%" }}
                      name="student_type"
                      value={formData.student_type}
                      onChange={(e) => setFormData({ ...formData, student_type: e.target.value })}
                    >
                      <option value="Swapnodaya">Swapnodaya</option>
                      <option value="Exskilence">Exskilence</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
              <div className="row ">
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentIsActive" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Is Active</Form.Label>
                    <div className="d-flex justify-content-evenly" style={{ width: "50%" }}>
                      <Form.Check
                        type="radio"
                        id="isActiveYes"
                        label="Yes"
                        name="isActive"
                        value="true"
                        checked={formData.student_isActive === true}
                        onChange={(e) => setFormData({ ...formData, student_isActive: true })}
                      />
                      <Form.Check
                        type="radio"
                        id="isActiveNo"
                        label="No"
                        name="isActive"
                        value="false"
                        checked={formData.student_isActive === false}
                        onChange={(e) => setFormData({ ...formData, student_isActive: false })}
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-12 col-md-6  mt-3">
                  <Form.Group controlId="formStudentAllocate" className="d-flex align-items-center justify-content-between">
                    <Form.Label>Allocate</Form.Label>
                    <div className="d-flex justify-content-evenly" style={{ width: "50%" }}>
                      <Form.Check
                        type="radio"
                        id="AllocateYes"
                        label="Yes"
                        name="Allocate"
                        value="true"
                        checked={formData.allocate === true}
                        onChange={(e) => setFormData({ ...formData, allocate: true })}
                      />
                      <Form.Check
                        type="radio"
                        id="AllocateNo"
                        label="No"
                        name="Allocate"
                        value="false"
                        checked={formData.allocate === false}
                        onChange={(e) => setFormData({ ...formData, allocate: false })}
                      />
                    </div>
                  </Form.Group>
                </div>
              </div>
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
        <Modal show={showResModal} onHide={() => setResShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Response Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <pre>{modalMessage}</pre>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setResShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  )
}

export default Student;
