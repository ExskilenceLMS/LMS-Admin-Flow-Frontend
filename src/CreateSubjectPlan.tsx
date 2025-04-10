import React, { useState, useEffect } from "react";
import axios from "axios";
import { PulseLoader } from "react-spinners";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";

interface Course {
  course_id: string;
  course_name: string;
  subjects: Subject[];
  level: string;
  Existing_Subjects: string[];
}

interface Subject {
  subject_id: string;
  subject_name: string;
}

interface Topic {
  topic_id: string;
  topic_name: string;
}

interface SubTopic {
  sub_topic_id: string;
  sub_topic_name: string;
  notes: number;
  videos: number;
  mcq: number;
  coding: number;
}

interface ContentItem {
  id: string;
  path?: string;
  text: string;
  time: string;
  level: string;
  type?: string;
}
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


interface ContentData {
  videos: { [key: string]: ContentItem };
  files: { [key: string]: ContentItem };
}

interface CountData {
  mcq: { [key: string]: number };
  coding: { [key: string]: number };
}

interface SelectedItemsData {
  [key: string]: {
    videos: { [key: string]: ContentItem };
    files: { [key: string]: ContentItem };
    topic: string;
    topicId: string;
    subtopicName: string;
    mcq: { [key: string]: number };
    coding: { [key: string]: number };
  };
}
type McqCodingType = 'mcq' | 'coding';

interface SelectedMcqCoding {
  [key: string]: {
    mcq: boolean;
    coding: boolean;
  };
}

interface InputCounts {
  [key: string]: {
    mcq: { [key: string]: number };
    coding: { [key: string]: number };
  };
}

interface ExistingDataTopic {
  id: string;
  name: string;
  subtopics: {
    id: string;
    subtopicName: string;
    mcq: { [key: string]: number };
    coding: { [key: string]: number };
    data: ContentItem[];
  }[];
}

const CreateSubjectPlan: React.FC = () => {
  const navigate = useNavigate();
  const [timeData, setTimeData] = useState<Data | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject>({ subject_id: "", subject_name: "" });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existSubjects, setExistSubjects] = useState<String[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course>({ course_id: "", course_name: "", subjects: [],level:"",Existing_Subjects:[] });
  const [subjectPlan, setSubjectPlan] = useState("");
  const [topicLevels, setTopicLevels] = useState<string[]>(['level1', 'level2', 'level3']);
  const [selectedTopic, setSelectedTopic] = useState<Topic>({ topic_id: "", topic_name: "" });
  const [selectedsub, setSelectedsub] = useState<SubTopic>({ sub_topic_id: "", sub_topic_name: "", notes: 0, videos: 0, mcq: 0, coding: 0 });
  const [showModal, setShowModal] = useState(false);
  const [subTopicData, setSubTopicData] = useState<SubTopic[]>([]);
  const [contentData, setContentData] = useState<ContentData>({ videos: {}, files: {} });
  const [inputCounts, setInputCounts] = useState<InputCounts>({});
  const [selectedItemsData, setSelectedItemsData] = useState<SelectedItemsData>({});
  const [selectedMcqCoding, setSelectedMcqCoding] = useState<SelectedMcqCoding>({});
  const [time, setTime] = useState<number>(0);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [count, setCount] = useState<CountData>({ mcq: {}, coding: {} });
  const [existingData, setExistingData] = useState<ExistingDataTopic[]>([]);

  // Loading states
  const [fetchContentLoading, setFetchContentLoading] = useState(false);
  const [fetchCountLoading, setFetchCountLoading] = useState(false);
  const [fetchSubTopicLoading, setFetchSubTopicLoading] = useState(false);
  const [fetchSubjectsLoading, setFetchSubjectsLoading] = useState(false);
  const [fetchCourseLoading, setFetchCourseLoading] = useState(false);
  const [fetchTopicLoading, setFetchTopicLoading] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      let calculatedTime = 0;
      Object.keys(selectedItemsData).forEach(key => {
        const data = selectedItemsData[key];
        if (data.files) {
          Object.keys(data.files).forEach(fileKey => {
            calculatedTime += parseInt(data.files[fileKey].time, 10);
          });
        }
        if (data.videos) {
          Object.keys(data.videos).forEach(videoKey => {
            calculatedTime += parseInt(data.videos[videoKey].time, 10);
          });
        }
        if (data.mcq) {
          Object.keys(data.mcq).forEach(level => {
            const mcqLevel = level.replace('level', 'Level');
            const mcqTimeData = timeData?.mcq.find(item => item.level === mcqLevel);
            if (mcqTimeData) {
              calculatedTime += data.mcq[level] * mcqTimeData.time;
            }
          });
        }
        if (data.coding) {
          Object.keys(data.coding).forEach(level => {
            const codingLevel = level.replace('level', 'Level');
            const codingTimeData = timeData?.coding.find(item => item.level === codingLevel);
            if (codingTimeData) {
              calculatedTime += data.coding[level] * codingTimeData.time;
            }
          });
        }
      });
      setTime(calculatedTime);
    };
    calculateTime();
  }, [selectedItemsData]);
  useEffect(() => {
    if (existingData.length > 0) {
      const initialSelectedItemsData: SelectedItemsData = {};
      const initialInputCounts: InputCounts = {};

      existingData.forEach(topic => {
        topic.subtopics.forEach(subtopic => {
          const videos: { [key: string]: ContentItem } = {};
          const files: { [key: string]: ContentItem } = {};
          subtopic.data.forEach(item => {
            if (item.type === 'video') {
              videos[item.id] = item;
            } else if (item.type === 'file') {
              files[item.id] = item;
            }
          });
          initialSelectedItemsData[subtopic.id] = {
            videos: videos,
            files: files,
            topic: topic.name,
            topicId: topic.id,
            subtopicName: subtopic.subtopicName,
            mcq: subtopic.mcq || {},
            coding: subtopic.coding || {}
          };
          initialInputCounts[subtopic.id] = {
            mcq: subtopic.mcq || {},
            coding: subtopic.coding || {}
          };
        });
      });
      setSelectedItemsData(initialSelectedItemsData);
      setInputCounts(initialInputCounts);
      setSelectedMcqCoding(prev => {
        const newSelectedMcqCoding: SelectedMcqCoding = { ...prev };
        existingData.forEach(topic => {
          topic.subtopics.forEach(subtopic => {
            newSelectedMcqCoding[subtopic.id] = {
              mcq: Object.values(subtopic.mcq || {}).some(count => count > 0),
              coding: Object.values(subtopic.coding || {}).some(count => count > 0)
            };
          });
        });
        return newSelectedMcqCoding;
      });
    }
  }, [existingData]);

  const handleCheckboxChange = (item: string, type: string, subTopic: SubTopic, itemData?: ContentItem) => {
    setSelectedItemsData(prev => {
      const newData = { ...prev };

      if (!newData[subTopic.sub_topic_id]) {
        newData[subTopic.sub_topic_id] = {
          videos: {},
          files: {},
          topic: selectedTopic.topic_name || "",
          topicId: selectedTopic.topic_id || "",
          subtopicName: subTopic.sub_topic_name,
          mcq: {},
          coding: {}
        };
      }

      if (type === "mcq" || type === "coding") {
        newData[subTopic.sub_topic_id][type] = item ? inputCounts[subTopic.sub_topic_id]?.[type] || {} : {};
      } else {
        const collection = type === "video" ? "videos" : "files";
        if (itemData) {
          newData[subTopic.sub_topic_id][collection][item] = {
            ...itemData,
          };
        } else {
          const { [item]: removed, ...rest } = newData[subTopic.sub_topic_id][collection];
          newData[subTopic.sub_topic_id][collection] = rest;
        }
      }

      if (Object.keys(newData[subTopic.sub_topic_id].videos).length === 0 &&
        Object.keys(newData[subTopic.sub_topic_id].files).length === 0 &&
        Object.keys(newData[subTopic.sub_topic_id].mcq).length === 0 &&
        Object.keys(newData[subTopic.sub_topic_id].coding).length === 0) {
        delete newData[subTopic.sub_topic_id];
      }

      return newData;
    });

    if (type === "mcq" || type === "coding") {
      setSelectedMcqCoding(prev => ({
        ...prev,
        [subTopic.sub_topic_id]: {
          ...prev[subTopic.sub_topic_id],
          [type]: item
        }
      }));
    }
  };

  const isAllSelected = (subTopicId: string, videos?: { [key: string]: ContentItem }, files?: { [key: string]: ContentItem }) => {
    if (!videos && !files) return false;

    const currentSubTopicData = selectedItemsData[subTopicId] || { videos: {}, files: {} };
    const availableVideos = Object.entries(videos || {}).filter(([_, video]) =>
      topicLevels.includes(video.level) || topicLevels.length === 0
    );
    const availableFiles = Object.entries(files || {}).filter(([_, file]) =>
      topicLevels.includes(file.level) || topicLevels.length === 0
    );
    const selectedVideosCount = Object.entries(currentSubTopicData.videos || {}).filter(([_, video]) =>
      topicLevels.includes(video.level) || topicLevels.length === 0
    ).length;
    const selectedFilesCount = Object.entries(currentSubTopicData.files || {}).filter(([_, file]) =>
      topicLevels.includes(file.level) || topicLevels.length === 0
    ).length;

    const hasAllVideos = selectedVideosCount === availableVideos.length;
    const hasAllFiles = selectedFilesCount === availableFiles.length;

    return hasAllVideos && hasAllFiles;
  };

  const handleSelectAllChange = (subTopic: SubTopic, videos?: { [key: string]: ContentItem }, files?: { [key: string]: ContentItem }) => {
    const isCurrentlyAllSelected = isAllSelected(subTopic.sub_topic_id, videos, files);
    setSelectedItemsData(prev => {
      const newData = { ...prev };
      if (isCurrentlyAllSelected) {
        delete newData[subTopic.sub_topic_id];
      } else {
        newData[subTopic.sub_topic_id] = {
          videos: {},
          files: {},
          topic: selectedTopic.topic_name || "",
          topicId: selectedTopic.topic_id || "",
          subtopicName: subTopic.sub_topic_name,
          mcq: inputCounts[subTopic.sub_topic_id]?.mcq || {},
          coding: inputCounts[subTopic.sub_topic_id]?.coding || {}
        };
        if (videos) {
          Object.entries(videos).forEach(([key, value]) => {
            if (topicLevels.includes(value.level) || topicLevels.length === 0) {
              newData[subTopic.sub_topic_id].videos[key] = {
                ...value,
              };
            }
          });
        }
        if (files) {
          Object.entries(files).forEach(([key, value]) => {
            if (topicLevels.includes(value.level) || topicLevels.length === 0) {
              newData[subTopic.sub_topic_id].files[key] = {
                ...value,
              };
            }
          });
        }
      }
      return newData;
    });
    setSelectedMcqCoding(prev => ({
      ...prev,
      [subTopic.sub_topic_id]: {
        mcq: !isCurrentlyAllSelected,
        coding: !isCurrentlyAllSelected
      }
    }));
    setInputCounts(prev => ({
      ...prev,
      [subTopic.sub_topic_id]: {
        mcq: !isCurrentlyAllSelected ? inputCounts[subTopic.sub_topic_id]?.mcq : {},
        coding: !isCurrentlyAllSelected ? inputCounts[subTopic.sub_topic_id]?.coding : {}
      }
    }));
  };

  const handleCountChange = (subTopic: SubTopic, type: McqCodingType, level: string, value: string) => {
    const maxCount = type === 'mcq' ? calculateMaxMcqCount(subTopic)[level] : calculateMaxCodingCount(subTopic)[level];
    const numValue = Math.min(Math.max(0, parseInt(value) || 0), maxCount);
    const updatedMcqCoding = selectedMcqCoding[subTopic.sub_topic_id] || { mcq: {}, coding: {} };

    setInputCounts(prev => ({
      ...prev,
      [subTopic.sub_topic_id]: {
        ...prev[subTopic.sub_topic_id],
        [type]: {
          ...prev[subTopic.sub_topic_id]?.[type],
          [level]: numValue
        }
      }
    }));

    if (updatedMcqCoding[type]) {
      setSelectedItemsData(prev => ({
        ...prev,
        [subTopic.sub_topic_id]: {
          ...prev[subTopic.sub_topic_id] || {
            name: subTopic.sub_topic_name,
            videos: {},
            files: {},
            topic: selectedTopic.topic_name || "",
            topicId: selectedTopic.topic_id || "",
            mcq: {},
            coding: {}
          },
          [type]: {
            ...prev[subTopic.sub_topic_id]?.[type],
            [level]: numValue
          }
        }
      }));
    }
  };

  const isItemSelected = (itemKey: string, type: string, subTopicId: string) => {
    return selectedItemsData[subTopicId]?.[type === "video" ? "videos" : "files"]?.[itemKey] !== undefined;
  };

  const handleReorderClick = () => {
    const hasSelectedItems = Object.values(selectedItemsData).some(subtopic =>
      Object.keys(subtopic.videos).length > 0 ||
      Object.keys(subtopic.files).length > 0 ||
      Object.keys(subtopic.mcq).length > 0 ||
      Object.keys(subtopic.coding).length > 0
    );
    if (hasSelectedItems) {
      const filteredData = Object.entries(selectedItemsData).reduce((acc, [subtopicId, data]) => {
        const filteredVideos = Object.entries(data.videos || {}).reduce((videosAcc, [videoId, video]) => {
          if (topicLevels.includes(video.level)) {
            videosAcc[videoId] = video;
          }
          return videosAcc;
        }, {} as { [key: string]: ContentItem });

        const filteredFiles = Object.entries(data.files || {}).reduce((filesAcc, [fileId, file]) => {
          if (topicLevels.includes(file.level)) {
            filesAcc[fileId] = file;
          }
          return filesAcc;
        }, {} as { [key: string]: ContentItem });

        const filteredMcq = Object.entries(data.mcq || {}).reduce((mcqAcc, [level, count]) => {
          if (topicLevels.includes(level)) {
            mcqAcc[level] = count;
          }
          return mcqAcc;
        }, {} as { [key: string]: number });

        const filteredCoding = Object.entries(data.coding || {}).reduce((codingAcc, [level, count]) => {
          if (topicLevels.includes(level)) {
            codingAcc[level] = count;
          }
          return codingAcc;
        }, {} as { [key: string]: number });

        if (Object.keys(filteredVideos).length > 0 || Object.keys(filteredFiles).length > 0 || Object.keys(filteredMcq).length > 0 || Object.keys(filteredCoding).length > 0) {
          acc[subtopicId] = {
            ...data,
            videos: filteredVideos,
            files: filteredFiles,
            mcq: filteredMcq,
            coding: filteredCoding
          };
        }

        return acc;
      }, {} as SelectedItemsData);

      const summaryData = Object.entries(filteredData).reduce((acc, [subtopicId, data]) => {
        const topic = topics.find(t => t.topic_id === data.topicId);
        if (!acc[data.topicId]) {
          acc[data.topicId] = {
            id: data.topicId,
            name: data.topic,
            subtopics: []
          };
        }

        const videos = Object.entries(data.videos || {}).map(([videoId, video]) => ({
          id: videoId,
          type: 'video',
          level: video.level,
          path: video.path,
          text: video.text,
          time: video.time
        }));

        const files = Object.entries(data.files || {}).map(([fileId, file]) => ({
          id: fileId,
          type: 'file',
          level: file.level,
          path: file.path,
          text: file.text,
          time: file.time
        }));

        acc[data.topicId].subtopics.push({
          id: subtopicId,
          subtopicName: data.subtopicName,
          videos: videos,
          files: files,
          mcq: data.mcq || {},
          coding: data.coding || {},
        });

        return acc;
      }, {} as { [key: string]: { id: string; name: string; subtopics: { id: string; subtopicName: string; videos: { id: string; type: string; level: string; path?: string; text: string; time: string }[]; files: { id: string; type: string; level: string; path?: string; text: string; time: string }[]; mcq: { [key: string]: number }; coding: { [key: string]: number } }[] } });

      const structuredData = {
        course: selectedCourse,
        subject_id: selectedSubject.subject_id,
        subject_name: selectedSubject.subject_name,
        topics: Object.values(summaryData)
      };

      console.log("Structured Data for Reorder:", structuredData);

      navigate('/reorder-content', {
        state: {
          selectedItems: structuredData,
          subjectPlan: subjectPlan
        }
      });
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("https://exskilence-suite-be.azurewebsites.net/fetch_rules/");
      setTimeData(response.data); 
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };
  useEffect(() => {
    fetchCourses();
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedsub.sub_topic_id !== "") {
      setContentData({ videos: {}, files: {} });
      fetchContent();
      setCount({ mcq: {}, coding: {} });
      fetchCount();
    }
  }, [selectedsub]);

  const fetchContent = async () => {
    if (!selectedsub.sub_topic_id) return;
    setFetchContentLoading(true);
    try {
      const response = await axios.post(
        `https://exskilence-suite-be.azurewebsites.net/get_content_for_subtopic/`,
        { sub_topic_id: selectedsub.sub_topic_id }
      );
      if (response.status === 200) {
        const content = response.data;
        const videos: { [key: string]: ContentItem } = {};
        const files: { [key: string]: ContentItem } = {};
        content.videos && Object.keys(content.videos).forEach(key => {
          videos[key] = { ...content.videos[key], type: 'video' };
        });
        content.files && Object.keys(content.files).forEach(key => {
          files[key] = { ...content.files[key], type: 'file' };
        });
        setContentData({ videos, files });
      }
      setFetchContentLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setFetchContentLoading(false);
    }
  };

  const fetchCount = async () => {
    if (!selectedsub.sub_topic_id) return;
    setFetchCountLoading(true);
    try {
      const response = await axios.post(
        `https://exskilence-suite-be.azurewebsites.net/get_questions_data_by_subtopic/`,
        { sub_topic_id: selectedsub.sub_topic_id }
      );
      if (response.status === 200) {
        setCount(response.data);
      }
      setFetchCountLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setFetchCountLoading(false);
    }
  };

  useEffect(() => {
    setTopics([]);
    setSelectedTopic({ topic_id: "", topic_name: "" });
    setSubTopicData([]);
    setSelectedsub({ sub_topic_id: "", sub_topic_name: "", notes: 0, videos: 0, mcq: 0, coding: 0 });
    setContentData({ videos: {}, files: {} });
    setInputCounts({});
    setSelectedItemsData({});
    setSelectedMcqCoding({});
    setCount({ mcq: {}, coding: {} });

    fetchTopics(selectedSubject.subject_id);
  }, [selectedSubject]);

  useEffect(() => {
    setSelectedSubject({ subject_id: "", subject_name: "" });
    setTopics([]);
    setSelectedTopic({ topic_id: "", topic_name: "" });
    setSubTopicData([]);
    setSelectedsub({ sub_topic_id: "", sub_topic_name: "", notes: 0, videos: 0, mcq: 0, coding: 0 });
    setContentData({ videos: {}, files: {} });
    setInputCounts({});
    setSelectedItemsData({});
    setSelectedMcqCoding({});
    setCount({ mcq: {}, coding: {} });
    setExistingData([]);
  }, [selectedCourse]);

  useEffect(() => {
    setContentData({ videos: {}, files: {} });
    setSelectedsub({ sub_topic_id: "", sub_topic_name: "", notes: 0, videos: 0, mcq: 0, coding: 0 });
    fetchSubTopics(selectedTopic.topic_id);
  }, [selectedTopic]);

  const handleSubjectClick = async (subject: Subject) => {
    if (!subject) {
      setSelectedSubject({ subject_id: "", subject_name: "" });
      return;
    }
    const selectedValue = subject.subject_id;

    const selectedSubjectObj = subjects.find(sub => sub.subject_id === selectedValue);
    setSelectedSubject({
      subject_id: selectedSubjectObj!.subject_id,
      subject_name: selectedSubjectObj!.subject_name
    });
    const existing = existSubjects.includes(selectedValue);
    if (existing) {
      const json = {
        course_id: selectedCourse.course_id,
        subject_id: subject.subject_id
      };
      try {
        const response = await axios.post(
          `https://exskilence-suite-be.azurewebsites.net/Content_creation/get_course_subjects/`,
          json
        );
        if (response.status === 200) {
          setExistingData(response.data.topics);
        }
      } catch (error) {
        console.error("Error adding new subject plan:", error);
      }
    }
  };

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setSelectedCourse({ course_id: "", course_name: "", subjects: [] ,level:"", Existing_Subjects:[]});
      return;
    }
    const selectedSubjectObj = courses.find(course => course.course_id === selectedValue);
    if (selectedSubjectObj) {
      setSelectedCourse({
        course_id: selectedSubjectObj.course_id,
        course_name: selectedSubjectObj.course_name,
        subjects: selectedSubjectObj.subjects,
        level: selectedSubjectObj.level,
        Existing_Subjects: selectedSubjectObj.Existing_Subjects
      });
      setSubjects(selectedSubjectObj.subjects);
      setExistSubjects(selectedSubjectObj.Existing_Subjects)
      setTopicLevels(selectedSubjectObj.level.split(","));
    }
  };

  const fetchSubTopics = async (topic: string) => {
    if (!topic) return;
    try {
      setFetchSubTopicLoading(true);
      const response = await axios.get(
        `https://exskilence-suite-be.azurewebsites.net/get_all_subtopics_data/${topic}`
      );
      setSubTopicData(response.data);
      setFetchSubTopicLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setFetchSubTopicLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setFetchCourseLoading(true);
      const response = await axios.get(
        "https://exskilence-suite-be.azurewebsites.net/get_all_course_tracks_and_subjects/"
      );
      setCourses(response.data);
      setFetchCourseLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setFetchCourseLoading(false);
    }
  };

  const fetchTopics = async (subjectId: string) => {
    if (!subjectId) return;
    try {
      setFetchTopicLoading(true);
      const response = await axios.get(
        `https://exskilence-suite-be.azurewebsites.net/topics_by_subject/${subjectId}/`
      );
      setTopics(response.data);
      setFetchTopicLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setFetchTopicLoading(false);
    }
  };

  const toggleTopicContent = (topic: Topic) => {
    setSelectedTopic((prevTopic) => (prevTopic.topic_id === topic.topic_id ? { topic_id: "", topic_name: "" } : { topic_id: topic.topic_id, topic_name: topic.topic_name }));
  };

  const toggleSubTopicContent = (subTopic: SubTopic) => {
    setSelectedsub((prev) => {
      const newSelectedSub = prev.sub_topic_id === subTopic.sub_topic_id
        ? { sub_topic_id: "", sub_topic_name: "", notes: 0, videos: 0, mcq: 0, coding: 0 }
        : { sub_topic_id: subTopic.sub_topic_id, sub_topic_name: subTopic.sub_topic_name, notes: subTopic.notes, videos: subTopic.videos, mcq: subTopic.mcq, coding: subTopic.coding };

      return newSelectedSub;
    });
  };

  const handleLevelChange = (level: string) => {
    setTopicLevels((prevLevels) => {
      const currentLevels = prevLevels || [];
      if (currentLevels.includes(level)) {
        return currentLevels.filter(l => l !== level);
      } else {
        return [...currentLevels, level];
      }
    });
  };

  const calculateMaxMcqCount = (subTopic: SubTopic): { [key: string]: number } => {
    const selectedLevels = topicLevels.filter(level => count?.mcq?.[level] !== undefined);
    return selectedLevels.reduce((sum, level) => ({ ...sum, [level]: count?.mcq?.[level] || 0 }), {});
  };

  const calculateMaxCodingCount = (subTopic: SubTopic): { [key: string]: number } => {
    const selectedLevels = topicLevels.filter(level => count?.coding?.[level] !== undefined);
    return selectedLevels.reduce((sum, level) => ({ ...sum, [level]: count?.coding?.[level] || 0 }), {});
  };

  const handlePreviewClick = async (path: string) => {
    setModalContent(null);
    setModalError(null);
    setShowModal(true);

    if (path.endsWith('.pdf') || path.endsWith('.doc') || path.endsWith('.docx') || path.endsWith('.pptx') || path.endsWith('.ppt')) {
      setModalContent(<iframe src={'https://docs.google.com/gview?url=' + path + '&embedded=true'} width="100%" height="500px" title="Preview" />);
    } else if (path.endsWith('.txt')) {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const text = await response.text();
        setModalContent(<pre>{text}</pre>);
      } catch (error) {
        setModalError('Error loading file');
      }
    } else if (path.endsWith('.html') || path.endsWith('.htm')) {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const text = await response.text();
        setModalContent(<iframe srcDoc={text} sandbox="allow-same-origin allow-scripts" width="100%" height="500px" title="HTML Preview" style={{ border: 'none' }} />);
      } catch (error) {
        setModalError('Error loading file');
      }
    } else {
      setModalContent(<iframe src={path} width="100%" height="500px" title="Preview" />);
    }
  };

  return (
    <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2"
    style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }} >
      <div >
        <div className="container-fluid">
          <div className="row d-flex mb-2 justify-content-between align-items-center">
            <div className="col d-flex justify-content-between align-items-center">
              <div className="d-flex justify-content-between align-items-center"><label className="ps-1 me-2">Subject Plan :</label>
                <select
                  className="form-select form-select-sm"
                  id="course"
                  onChange={handleCourseChange}
                  value={selectedCourse.course_id || ""}
                  style={{ width: "150px" }}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option
                      key={course.course_id}
                      value={course.course_id}
                    >
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <label className="me-2">Subject</label>
                <select
                  className="form-select form-select-sm"
                  id="subject"
                  value={selectedSubject.subject_id || ""}
                  style={{ width: "150px" }}
                  onChange={(e) => handleSubjectClick(subjects.find(sub => sub.subject_id === e.target.value) as Subject)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option
                      key={subject.subject_id}
                      value={subject.subject_id}
                      className={existSubjects.includes(subject.subject_id) ? "text-success" : ""}
                      style={{
                        backgroundColor: existSubjects.includes(subject.subject_id) ? "#f5f5f5" : "inherit"
                      }}
                    >
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <label className="me-2">Level : </label>
                <div className="">
                  <div
                    className=""
                    style={{ width: "160px" }}
                  >
                    {topicLevels.length > 0 ? topicLevels.join(", ") : "Select Level"}
                  </div>
                  <ul className="dropdown-menu p-0 m-0" aria-labelledby="dropdownMenuButton">
                    <li>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={topicLevels.includes("level1")}
                          onChange={() => handleLevelChange("level1")}
                          className="me-2"
                        />
                        Level 1
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={topicLevels.includes("level2")}
                          onChange={() => handleLevelChange("level2")}
                          className="me-2"
                        />
                        Level 2
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={topicLevels.includes("level3")}
                          onChange={() => handleLevelChange("level3")}
                          className="me-2"
                        />
                        Level 3
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <label className="me-2">Time : </label>
                <span className="fs-6">
                  {Math.floor(time / 60)} hr {(time % 60).toString().padStart(2, "0")} mins
                </span>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleReorderClick}
                disabled={!Object.values(selectedItemsData).some(
                  (subtopic) =>
                    Object.keys(subtopic.videos).length > 0 ||
                    Object.keys(subtopic.files).length > 0 ||
                    Object.keys(subtopic.mcq).length > 0 ||
                    Object.keys(subtopic.coding).length > 0
                )}
              >
                Reorder
              </button>
            </div>
          </div>
        </div>

        {topics.length > 0 && (
          <div className="mt-3 mx-3 p-2">
            {topics.map((topic) => (
              <div key={topic.topic_id} className="border border-black rounded-2 mb-3">
                <div className="ps-3 fs-5 py-2 d-flex justify-content-between" style={{ backgroundColor: "#F1F2FF" }}>
                  <span>{topic.topic_name}</span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span
                      role="button"
                      className="px-2 me-3"
                      style={{ width: "10px", cursor: "pointer" }}
                      onClick={() => toggleTopicContent(topic)}
                    >
                      {selectedTopic.topic_id === topic.topic_id ? "^" : "v"}
                    </span>
                  </span>
                </div>
                {selectedTopic.topic_id === topic.topic_id && (
                  <div className="mt-2">
                    {subTopicData.length > 0 && selectedTopic.topic_id === topic.topic_id && subTopicData.map((subTopic) => (
                      <div key={subTopic.sub_topic_id} className="mx-2 mb-2 border border-black rounded-2">
                        <div className="d-flex justify-content-between align-items-center py-1">
                          <span className="ps-2">
                            {selectedsub.sub_topic_id === subTopic.sub_topic_id && (
                              <input
                                type="checkbox"
                                className="me-2"
                                checked={isAllSelected(subTopic.sub_topic_id, contentData.videos || {}, contentData.files || {})}
                                onChange={() => handleSelectAllChange(subTopic, contentData.videos || {}, contentData.files || {})}
                              />
                            )}
                            {subTopic.sub_topic_name}
                          </span>

                          <div className="d-flex justify-content-between">
                            <div className="px-2 text-center">
                              <span>Videos</span> <br />
                              <span>{subTopic.videos || 0}</span>
                            </div>
                            <div className="px-2 text-center">
                              <span>Notes</span> <br />
                              <span>{subTopic.notes || 0}</span>
                            </div>
                            <div className="px-2 text-center">
                              <span>MCQ</span> <br />
                              <span>{subTopic.mcq || 0}</span>
                            </div>
                            <div className="px-2 text-center">
                              <span>Coding</span> <br />
                              <span>{subTopic.coding || 0}</span>
                            </div>
                            <span role="button" className="me-3" onClick={() => toggleSubTopicContent(subTopic)}>
                              {selectedsub.sub_topic_id === subTopic.sub_topic_id ? "^" : "v"}
                            </span>
                          </div>
                        </div>

                        {selectedsub.sub_topic_id === subTopic.sub_topic_id && (
                          <div className="mt-2 p-2">
                            {contentData.videos && Object.keys(contentData.videos).length > 0 && (
                              <>
                                {Object.keys(contentData.videos).map((videoKey) => {
                                  const video = contentData.videos[videoKey];
                                  const level = video.level;
                                  if (topicLevels.includes(level) || topicLevels.length === 0) {
                                    return (
                                      <div key={videoKey} className="d-flex justify-content-between mb-2">
                                        <span>
                                          <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(videoKey, "video", selectedsub, video)}
                                            checked={isItemSelected(videoKey, "video", selectedsub.sub_topic_id)}
                                          />
                                          <strong className="ms-2">{videoKey.toLocaleUpperCase()}</strong> {video.text}
                                        </span>
                                        <span>
                                          <strong className="me-3">{video.time}m</strong>
                                          <button className="border border-none rounded-2" onClick={() => handlePreviewClick(video.path!)} style={{ backgroundColor: "#F1F2FF" }}>
                                            Preview 
                                          </button>
                                        </span>
                                      </div>
                                    );
                                  }
                                })}
                              </>
                            )}

                            {contentData.files && Object.keys(contentData.files).length > 0 && (
                              <>
                                {Object.keys(contentData.files).map((fileKey) => {
                                  const file = contentData.files[fileKey];
                                  const level = file.level;
                                  if (topicLevels.includes(level) || topicLevels.length === 0) {
                                    return (
                                      <div key={fileKey} className="d-flex justify-content-between mb-2">
                                        <span>
                                          <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(fileKey, "file", selectedsub, file)}
                                            checked={isItemSelected(fileKey, "file", selectedsub.sub_topic_id)}
                                          />
                                          <strong className="ms-2">{fileKey.toLocaleUpperCase()}</strong> {file.text}
                                        </span>
                                        <span>
                                          <strong className="me-3">{file.time}m</strong>
                                          <button className="border border-none rounded-2" onClick={() => handlePreviewClick(file.path!)} style={{ backgroundColor: "#F1F2FF" }}>
                                            Preview
                                          </button>
                                        </span>
                                      </div>
                                    );
                                  }
                                })}
                              </>
                            )}
                            <div className="me-4">
                              <input
                                type="checkbox"
                                checked={selectedMcqCoding[subTopic.sub_topic_id]?.mcq || false}
                                onChange={(e) => {
                                  handleCheckboxChange(e.target.checked ? "mcq" : "", "mcq", subTopic);
                                }}
                                className="me-2"
                              />
                              <label>MCQ</label>
                              <br />
                              {topicLevels.map(level => (
                                <div key={level}>
                                  <label>{level.toLocaleUpperCase()} :</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={count?.mcq?.[level]}
                                    value={inputCounts[subTopic.sub_topic_id]?.mcq?.[level] || 0}
                                    onChange={(e) => handleCountChange(subTopic, "mcq", level, e.target.value)}
                                    className="ms-4"
                                    style={{ width: "60px" }}
                                    disabled={!selectedMcqCoding[subTopic.sub_topic_id]?.mcq}
                                  />
                                  <span className="ms-2">/ {count?.mcq?.[level]}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2">
                              <input
                                type="checkbox"
                                checked={selectedMcqCoding[subTopic.sub_topic_id]?.coding || false}
                                onChange={(e) => {
                                  handleCheckboxChange(e.target.checked ? "coding" : "", "coding", subTopic);
                                }}
                                className="me-2"
                              />
                              <label>Coding:</label>
                              <br />
                              {topicLevels.map(level => (
                                <div key={level}>
                                  <label>{level.toLocaleUpperCase()} :</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={count?.coding?.[level]}
                                    value={inputCounts[subTopic.sub_topic_id]?.coding?.[level] || 0}
                                    onChange={(e) => handleCountChange(subTopic, "coding", level, e.target.value)}
                                    className="ms-4"
                                    style={{ width: "60px" }}
                                    disabled={!selectedMcqCoding[subTopic.sub_topic_id]?.coding}
                                  />
                                  <span className="ms-2">/ {count?.coding?.[level]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <Modal centered show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalError ? (
              <div>{modalError}</div>
            ) : modalContent ? (
              modalContent
            ) : (
              <div>Loading...</div>
            )}
          </Modal.Body>
        </Modal>
      )}

      {(fetchContentLoading || fetchSubjectsLoading || fetchCountLoading || fetchSubTopicLoading || fetchCourseLoading || fetchTopicLoading) && (
        <div className="d-flex justify-content-center align-items-center" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 9999 }}>
          <PulseLoader size={10} className="px-2" />
        </div>
      )}
    </div>
  );
};

export default CreateSubjectPlan;
