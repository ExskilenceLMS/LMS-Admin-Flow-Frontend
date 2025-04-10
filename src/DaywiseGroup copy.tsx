import React, { useState, useEffect } from "react";
import { PulseLoader } from "react-spinners";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface Subtopic {
  id: string;
  subtopicName?: string;
  mcq?: { level1?: number; level2?: number; level3?: number };
  coding?: { level1?: number; level2?: number; level3?: number };
  data: { type: string; path?: string; url?: string; text: string; time: string; level: string }[];
}

interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

interface CourseData {
  [key: string]: {
    subject_name?: string;
    topics: Topic[];
  };
}

interface ScheduleData {
  [key: string]: {
    day: string;
    topic: string;
    date: string;
    dayOfWeek: string;
    duration: string;
    actualTime: string;
    mcq: { [key: string]: { level1?: number; level2?: number; level3?: number } };
    coding: { [key: string]: { level1?: number; level2?: number; level3?: number } };
    subtopicids: { subtopic_id: string; subtopic_name: string }[];
    content: { [key: string]: { type: string; path?: string; url?: string; text: string; time: string; level: string }[] };
  }[];
}

interface Selection {
  hoursPerDay: string;
  saturdayStudyHoliday: string;
  startDate: string;
  sundayHoliday: string;
  course_id: string;
  batch_id: string;
}

const DayWiseGroup: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [selectedDurations, setSelectedDurations] = useState<{ [key: string]: string }>({});
  const [fetchedJson, setFetchedJson] = useState<CourseData>({});
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const data = location.state?.data as Selection;

  const selection: Selection = {
    hoursPerDay: data.hoursPerDay,
    saturdayStudyHoliday: data.saturdayStudyHoliday,
    startDate: data.startDate,
    sundayHoliday: data.sundayHoliday,
    course_id: data.course_id,
    batch_id: data.batch_id,
  };
  console.log(selection);
  useEffect(() => {
    const fetchJson = async () => {
      const json = {
        course_id: selection.course_id,
      };
      try {
        const response = await axios.post(
          "https://exskilence-suite-be.azurewebsites.net/Content_creation/get_all_data_of_course/",
          json
        );
        setFetchedJson(response.data);
        const scheduleData = convertToScheduleData(response.data, selection);
        setSchedule(scheduleData);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchJson();
  }, [selection.course_id]);

  const setSelectedOption = (value: string, day: string) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [day]: value,
    }));
  };

  const setSelectedDuration = (value: string, day: string) => {
    setSelectedDurations(prevState => ({
      ...prevState,
      [day]: value,
    }));
  };

  const convertToScheduleData = (selecteddata: CourseData, course_details: Selection): ScheduleData => {
    const schedule: ScheduleData = {};
    let currentDay = 0;
    let currentDate = new Date(course_details.startDate);
    const isHoliday = (date: Date) => {
      const dayOfWeek = date.getDay();
      return (dayOfWeek === 6 && course_details.saturdayStudyHoliday === 'Yes') ||
             (dayOfWeek === 0 && course_details.sundayHoliday === 'Yes');
    };
    Object.values(selecteddata).forEach(subjectData => {
      const subjectName = subjectData.subject_name || "Unknown Subject";
      schedule[subjectName] = [];
      let actualTime = 0;
      let daySchedule: any = null;
      let isFirstSubtopic = true;
      const topics = subjectData.topics || [];
      topics.forEach(topic => {
        const subtopics = topic.subtopics || [];
        subtopics.forEach(subtopic => {
          if (daySchedule === null || isHoliday(currentDate)) {
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: "",
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: course_details.hoursPerDay,
              actualTime: "0.00",
              mcq: {},
              coding: {},
              subtopicids: [],
              content: {},
            };
            actualTime = 0;
          }
          const dataDuration = subtopic.data.reduce((acc, item) => acc + parseFloat(item.time), 0) / 60;
          const mcqDuration = (subtopic.mcq?.level1 || 0) * 1 + (subtopic.mcq?.level2 || 0) * 1.5 + (subtopic.mcq?.level3 || 0) * 2;
          const codingDuration = (subtopic.coding?.level1 || 0) * 10 + (subtopic.coding?.level2 || 0) * 20 + (subtopic.coding?.level3 || 0) * 30;
          const mcqCodingDuration = (mcqDuration + codingDuration) / 60;
          const availableTime = parseFloat(course_details.hoursPerDay);
          if (isFirstSubtopic || (actualTime + dataDuration <= availableTime)) {
            daySchedule.topic += (daySchedule.topic ? ", " : "") + `${subtopic.subtopicName} data`;
            daySchedule.subtopicids.push({ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName });
            daySchedule.content[subtopic.id] = subtopic.data;
            actualTime += dataDuration;
            if (actualTime + mcqCodingDuration <= availableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: course_details.hoursPerDay,
                actualTime: actualTime.toFixed(2),
                mcq: {},
                coding: {},
                subtopicids: [{ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName }],
                content: {},
              };
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
            }
            isFirstSubtopic = false;
          } else {
            daySchedule.actualTime = actualTime.toFixed(2);
            schedule[subjectName].push(daySchedule);
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            actualTime = dataDuration;
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: `${subtopic.subtopicName} data`,
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: course_details.hoursPerDay,
              actualTime: actualTime.toFixed(2),
              mcq: {},
              coding: {},
              subtopicids: [{ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName }],
              content: { [subtopic.id]: subtopic.data },
            };
            if (actualTime + mcqCodingDuration <= availableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: course_details.hoursPerDay,
                actualTime: actualTime.toFixed(2),
                mcq: {},
                coding: {},
                subtopicids: [{ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName }],
                content: {},
              };
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
            }
          }
        });
      });
      if (daySchedule) {
        daySchedule.actualTime = actualTime.toFixed(2);
        schedule[subjectName].push(daySchedule);
      }
    });
    return schedule;
  };

  const editScheduleData = (selecteddata: CourseData, course_details: Selection, hoursList: number[]): ScheduleData => {
    const schedule: ScheduleData = {};
    let currentDay = 0;
    let currentDate = new Date(course_details.startDate);
    const isHoliday = (date: Date) => {
      const dayOfWeek = date.getDay();
      return (dayOfWeek === 6 && course_details.saturdayStudyHoliday === 'Yes') ||
             (dayOfWeek === 0 && course_details.sundayHoliday === 'Yes');
    };
    const getHoursForDay = (day: number) => {
      const index = day - 1;
      if (index < hoursList.length) {
        return hoursList[index];
      }
      return hoursList.length > 0 ? hoursList[hoursList.length - 1] : 1;
    };
    Object.values(selecteddata).forEach(subjectData => {
      const subjectName = subjectData.subject_name || "Unknown Subject";
      schedule[subjectName] = [];
      let actualTime = 0;
      let daySchedule: any = null;
      let isFirstSubtopic = true;
      const topics = subjectData.topics || [];
      topics.forEach(topic => {
        const subtopics = topic.subtopics || [];
        subtopics.forEach(subtopic => {
          if (daySchedule === null || isHoliday(currentDate)) {
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            const dayHours = getHoursForDay(currentDay);
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: "",
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: dayHours.toString(),
              actualTime: "0.00",
              mcq: {},
              coding: {},
              subtopicids: [],
              content: {},
            };
            actualTime = 0;
          }
          const dataDuration = subtopic.data.reduce((acc, item) => acc + parseFloat(item.time), 0) / 60;
          const mcqDuration = (subtopic.mcq?.level1 || 0) * 1 + (subtopic.mcq?.level2 || 0) * 1.5 + (subtopic.mcq?.level3 || 0) * 2;
          const codingDuration = (subtopic.coding?.level1 || 0) * 10 + (subtopic.coding?.level2 || 0) * 20 + (subtopic.coding?.level3 || 0) * 30;
          const mcqCodingDuration = (mcqDuration + codingDuration) / 60;
          const availableTime = parseFloat(daySchedule.duration);
          if (isFirstSubtopic || (actualTime + dataDuration <= availableTime)) {
            daySchedule.topic += (daySchedule.topic ? ", " : "") + `${subtopic.subtopicName} data`;
            daySchedule.subtopicids.push({ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName });
            daySchedule.content[subtopic.id] = subtopic.data;
            actualTime += dataDuration;
            if (actualTime + mcqCodingDuration <= availableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              const newDayHours = getHoursForDay(currentDay);
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: newDayHours.toString(),
                actualTime: actualTime.toFixed(2),
                mcq: {},
                coding: {},
                subtopicids: [{ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName }],
                content: {},
              };
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
            }
            isFirstSubtopic = false;
          } else {
            daySchedule.actualTime = actualTime.toFixed(2);
            schedule[subjectName].push(daySchedule);
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            const newDayHours = getHoursForDay(currentDay);
            actualTime = dataDuration;
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: `${subtopic.subtopicName} data`,
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: newDayHours.toString(),
              actualTime: actualTime.toFixed(2),
              mcq: {},
              coding: {},
              subtopicids: [{ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName }],
              content: { [subtopic.id]: subtopic.data },
            };
            const newAvailableTime = parseFloat(daySchedule.duration);
            if (actualTime + mcqCodingDuration <= newAvailableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              const nextDayHours = getHoursForDay(currentDay);
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: nextDayHours.toString(),
                actualTime: actualTime.toFixed(2),
                mcq: {},
                coding: {},
                subtopicids: [{ subtopic_id: subtopic.id, subtopic_name: subtopic.subtopicName }],
                content: {},
              };
              if (subtopic.mcq) {
                daySchedule.mcq[subtopic.id] = {
                  level1: subtopic.mcq?.level1 || 0,
                  level2: subtopic.mcq?.level2 || 0,
                  level3: subtopic.mcq?.level3 || 0,
                };
              }
              if (subtopic.coding) {
                daySchedule.coding[subtopic.id] = {
                  level1: subtopic.coding?.level1 || 0,
                  level2: subtopic.coding?.level2 || 0,
                  level3: subtopic.coding?.level3 || 0,
                };
              }
            }
          }
        });
      });
      if (daySchedule) {
        daySchedule.actualTime = actualTime.toFixed(2);
        schedule[subjectName].push(daySchedule);
      }
    });
    return schedule;
  };

  const handleTimeClick = (selectedDay: string, hours: string) => {
    const time = getListOfTime(selectedDay, Number(hours));
    const hey = editScheduleData(fetchedJson, selection, time);
    setSchedule(hey);
  };


  function getListOfTime(day: string, inputHours: number): number[] {
    let ls: number[] = [];
    Object.values(schedule).forEach(subject => {
        subject.forEach(entry => {
            if (entry.day === day) {
                let duration = inputHours;
                ls.push(duration);
            } else {
                let duration = parseInt(entry.duration, 10) || 0;
                if (duration > 0) {
                    ls.push(duration);
                }
            }
        });
    });
    return ls;
}

  const handleGoClick = (selectedDay: string, selectedOption: string) => {
    if (!selectedOption) return;
    let json: any = {};
    let flag = false;
    setSchedule(prevSchedule => {
      const updatedSchedule = { ...prevSchedule };
      const subjects = Object.keys(updatedSchedule);
      subjects.forEach(subject => {
        const days = updatedSchedule[subject];
        days.forEach(day => {
          if (!json[subject]) {
            json[subject] = [];
          }
          if (flag) {
            let nextDate = new Date(new Date(day.date).setDate(new Date(day.date).getDate() + 1));
            let nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            while (isHoliday(nextDate)) {
              nextDate = new Date(nextDate.setDate(nextDate.getDate() + 1));
              nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            }
            json[subject].push({
              day: `Day ${parseInt(day.day.split(' ')[1]) + 1}`,
              topic: day.topic,
              date: nextDate.toISOString().split('T')[0],
              dayOfWeek: nextDayOfWeek,
              duration: day.duration,
              actualTime: day.actualTime,
              mcq: day.mcq,
              coding: day.coding,
              subtopicids: day.subtopicids,
              content: day.content
            });
          }
          else if (day.day === selectedDay) {
            const local = day;
            flag = true;
            json[subject].push({
              day: selectedDay,
              topic: selectedOption,
              date: day.date,
              dayOfWeek: day.dayOfWeek,
            });
            let nextDate = new Date(new Date(local.date).setDate(new Date(day.date).getDate() + 1));
            let nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            while (isHoliday(nextDate)) {
              nextDate = new Date(nextDate.setDate(nextDate.getDate() + 1));
              nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            }
            json[subject].push({
              day: `Day ${parseInt(day.day.split(' ')[1]) + 1}`,
              topic: local.topic,
              date: nextDate.toISOString().split('T')[0],
              dayOfWeek: nextDayOfWeek,
              duration: local.duration,
              actualTime: local.actualTime,
              mcq: local.mcq,
              coding: local.coding,
              subtopicids: local.subtopicids,
              content: local.content
            });
          }
          else {
            json[subject].push({
              day: day.day,
              topic: day.topic,
              date: day.date,
              dayOfWeek: day.dayOfWeek,
              duration: day.duration,
              actualTime: day.actualTime,
              mcq: day.mcq,
              coding: day.coding,
              subtopicids: day.subtopicids,
              content: day.content
            });
          }
        });
      });
      return json;
    });
  };

  const isHoliday = (date: Date) => {
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 6 && selection.saturdayStudyHoliday === 'Yes') ||
           (dayOfWeek === 0 && selection.sundayHoliday === 'Yes');
  };

  const handleSave = async () => {
    setShowModal(true);
  };

  const handleModalOk = async () => {
    try {
      const response = await axios.post('https://exskilence-suite-be.azurewebsites.net/Content_creation/save_daywise/', {
        schedule: schedule,
        course_id: selection.course_id,
        batch_id: selection.batch_id,
      });
      console.log('Data sent successfully:', response.data);
      setShowModal(false);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2"
    style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }} >

      <div >

        <div className="container-fluid mt-2">
          <div className="d-flex justify-content-end align-items-end">
            <button onClick={handleSave}>Save</button>
          </div>
          <div className="container-fluid mt-2">
            {Object.keys(schedule).length > 0 ? (
              Object.keys(schedule).map(category => (
                <div key={category}>
                  <h6>{category}</h6>
                  {schedule[category].map((item, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between px-2 py-1 mb-2">
                      <div className="d-flex justify-content-between align-items-start w-100 border border-black mx-2 p-2 rounded-2">
                        <span className="me-3">{item.day}</span>
                        <span style={{ width: "250px" }} className="me-3 text-start">{item.topic}</span>
                        {new Date(item.date).toLocaleDateString('en-US')}
                        <span className="me-3">{item.dayOfWeek}</span>
                        {item.duration ? (
                          <select
                            style={{ width: "60px" }}
                            className="me-3"
                            onChange={(e) => {
                              const newDuration = e.target.value;
                              setSelectedDuration(newDuration, item.day);
                              handleTimeClick(item.day, newDuration);
                            }}
                            value={selectedDurations[item.day] || item.duration}
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num} hrs
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="me-3" style={{ width: "60px" }}></span>
                        )}
                        {item.duration ? <span className="me-3" style={{width:"60px"}}>{item.actualTime} hrs (actual)</span>: <span className="me-3" style={{width:"60px"}}></span>}
                      </div>
                      <div className="d-flex">
                        <select
                          className="mx-2"
                          onChange={(e) => setSelectedOption(e.target.value, item.day)}
                          value={selectedOptions[item.day] || ""}
                        >
                          <option value="">Select any </option>
                          <option>Preparation Day</option>
                          <option>Weekly Test</option>
                          <option>Onsite Workshop</option>
                          <option>Internals</option>
                          <option>Semester Exam</option>
                          <option>Festivals</option>
                          <option>Other</option>
                        </select>
                        <button
    onClick={() => {
      handleGoClick(item.day, selectedOptions[item.day]);
      setSelectedOption("", item.day);
    }}
    className="btn btn-primary"
  >
    Go
  </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No schedule data available.</p>
            )}
          </div>
        </div>

      </div>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 9999 }}>
          <PulseLoader size={10} />
        </div>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          
          Are you sure you want to proceed? 
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalOk}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DayWiseGroup;
