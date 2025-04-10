import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import axios from 'axios';
import { PulseLoader } from "react-spinners";

interface Item {
  id: string;
  key: string;
  itemType: 'video' | 'file';
  path?: string;
  text: string;
  time: string;
  level: string;
}

interface MediaItem {
    path?: string;
    text: string;
    time: string;
    level: string;
  }
  
interface Subtopic {
  subtopicName: string;
  mcq: boolean;
  coding: boolean;
  items: Item[];
}

interface Topic {
  topicName: string;
  subtopics: { [key: string]: Subtopic };
}

interface SelectedItems {
  subject_id: string;
  subject_name: string;
  course: { course_id: string };
  topics: { id: string; name: string; subtopics: any[] }[];
}

function ReorderContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [items, setItems] = useState<{ [key: string]: Topic }>({});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  useEffect(() => {
    if (!location.state?.selectedItems) {
      navigate('/');
      return;
    }

    const selectedItems = location.state?.selectedItems as SelectedItems;
    console.log(selectedItems)
const groupedItems: { [key: string]: Topic } = {};

selectedItems.topics.forEach((topic: { id: string; name: string; subtopics: any[] }) => {
    groupedItems[topic.id] = {
        topicName: topic.name,
        subtopics: {}
    };

    topic.subtopics.forEach((subtopic: { id: string; subtopicName: string; mcq: boolean; coding: boolean; videos: any; files: any }) => {
        groupedItems[topic.id].subtopics[subtopic.id] = {
            subtopicName: subtopic.subtopicName,
            mcq: subtopic.mcq,
            coding: subtopic.coding,
            items: [
                ...subtopic.videos.map((video: any) => ({
                    id: video.id, // Retain the original ID
                    itemType: 'video' as 'video',
                    path: video.path, // Assuming 'path' is the correct field for URL
                    text: video.text,
                    time: video.time,
                    level: video.level,
                })),
                ...subtopic.files.map((file: any) => ({
                    id: file.id, // Retain the original ID
                    itemType: 'file' as 'file',
                    path: file.path,
                    text: file.text,
                    time: file.time,
                    level: file.level,
                }))
            ]
        };
    });
});


    setItems(groupedItems);
  }, [location.state, navigate]);

  const handleTopicClick = (topicId: string) => {
    if (selectedTopic === topicId) {
      setSelectedTopic(null);
      setSelectedSubtopic(null);
    } else {
      setSelectedTopic(topicId);
      setSelectedSubtopic(null);
    }
  };

  const handleSubtopicClick = (subtopicId: string) => {
    if (selectedSubtopic === subtopicId) {
      setSelectedSubtopic(null);
    } else {
      setSelectedSubtopic(subtopicId);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    setItems((prevItems) => {
      const updatedItems = { ...prevItems };
      const currentSubtopicItems = [...updatedItems[selectedTopic!].subtopics[selectedSubtopic!].items];
      const [removed] = currentSubtopicItems.splice(sourceIndex, 1);
      currentSubtopicItems.splice(destinationIndex, 0, removed);
      updatedItems[selectedTopic!].subtopics[selectedSubtopic!] = {
        ...updatedItems[selectedTopic!].subtopics[selectedSubtopic!],
        items: currentSubtopicItems
      };

      return updatedItems;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const sub_id = location.state?.selectedItems.subject_id;
    try {
      const orderedData = {
        [sub_id]: {
          subject_name: location.state?.selectedItems.subject_name,
          topics: Object.keys(items).map((topicId) => ({
            id: topicId,
            name: items[topicId].topicName,
            subtopics: Object.keys(items[topicId].subtopics).map((subtopicId) => ({
              id: subtopicId,
              subtopicName: items[topicId].subtopics[subtopicId].subtopicName,
              mcq: items[topicId].subtopics[subtopicId].mcq,
              coding: items[topicId].subtopics[subtopicId].coding,
              data: items[topicId].subtopics[subtopicId].items.map((item) => ({
                type: item.itemType,
                id: item.id,
                path: item.path,
                text: item.text,
                time: item.time,
                level: item.level,
              }))
            }))
          })),
        },
        subject_id: sub_id,
        course_id: location.state?.selectedItems.course.course_id,
        created_by: sessionStorage.getItem('Email'),
      };

      await axios.post('https://exskilence-suite-be.azurewebsites.net/Content_creation/save_subject_plans_details/', orderedData);
      navigate('/course-configuration');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving the order. Please try again.');
    }
    setIsLoading(false);
  };

  const getCurrentItems = (): Item[] => {
    const currentSubtopic = items[selectedTopic!]?.subtopics[selectedSubtopic!];
    return currentSubtopic ? currentSubtopic.items : [];
  };

  return (
    <div className="border pt-3 px-2 rounded-2 bg-white my-2 me-2"
    style={{ height: `calc(100vh - 90px)`, overflowY: "auto" }} >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="fs-4">Reorder Content</p>
        <div>
          <button
            className="btn btn-secondary me-2"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={Object.keys(items).length === 0}
          >
            Save Order
          </button>
        </div>
      </div>

      <div className="accordion mb-4">
        {Object.keys(items).map((topicId) => (
          <div key={topicId} className="accordion-item">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${selectedTopic === topicId ? '' : 'collapsed'}`}
                type="button"
                onClick={() => handleTopicClick(topicId)}
              >
                {items[topicId].topicName}
              </button>
            </h2>
            {selectedTopic === topicId && (
              <div className="accordion-collapse collapse show">
                <div className="accordion-body">
                  {Object.keys(items[topicId].subtopics).map((subtopicId) => (
                    <div key={subtopicId} className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${selectedSubtopic === subtopicId ? '' : 'collapsed'}`}
                          type="button"
                          onClick={() => handleSubtopicClick(subtopicId)}
                        >
                          {items[topicId].subtopics[subtopicId].subtopicName}
                        </button>
                      </h2>
                      {selectedSubtopic === subtopicId && (
                        <div className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <DragDropContext onDragEnd={handleDragEnd}>
                              <Droppable droppableId="content-list">
                                {(provided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="border rounded p-3"
                                  >
                                    {getCurrentItems().map((item, index) => (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="border p-3 mb-2 bg-white rounded d-flex justify-content-between align-items-center"
                                          >
                                            <div>
                                              <span className="me-2">
                                                {item.itemType === 'video' ? '📹' : '📄'}
                                              </span>
                                              <span className="fw-bold">{item.text}</span>
                                            </div>
                                            <div className="text-muted">
                                              <span className="me-3">{item.time}</span>
                                              <span>⠿</span>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {getCurrentItems().length === 0 && (
                                      <div className="text-center p-4 text-muted">
                                        No items in this subtopic
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 1000 }}>
          <PulseLoader size={10} />
        </div>
      )}
    </div>
  );
}

export default ReorderContent;
