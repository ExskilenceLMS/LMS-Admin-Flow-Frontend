import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import Courses from './Courses';
import Layout from './Layout'; 
import Dashboard from './Dashboard';
import Rules from './Rules';
import Subject from './Subject';
import Test from './Test';
import Track from "./Track";
import BatchCreation from './Batches';
import Trainer from './Trainer';
import Student from './Student'; 
import Topic from './Topic';
import SubTopic from "./SubTopic";
import Login from './Login';
import CreateSubjectPlan from './CreateSubjectPlan';
import AssignBatch from './AssignBatch';
import ReorderContent from './ReorderContent';
import DayWiseGroup from './DaywiseGroup';
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={ <Layout> <Login /> </Layout> } />
      <Route path="/courses" element={ <Layout> <Courses /> </Layout> } />
      <Route path='/rules' element={ <Layout> <Rules /> </Layout> } />
      <Route path='/subject' element={ <Layout> <Subject /> </Layout> } />
      <Route path='/test' element={ <Layout> <Test /> </Layout> } />
      <Route path='/track' element={ <Layout> <Track /> </Layout> } />
      <Route path='/batches' element={ <Layout> <BatchCreation /> </Layout> } />
      <Route path='/batches/user' element={ <Layout> <Trainer /> </Layout> } />
      <Route path='/batches/student' element={ <Layout> <Student /> </Layout> } />
      <Route path='/topic' element={ <Layout> <Topic /> </Layout> } />
      <Route path='/sub-topic' element={<Layout> <SubTopic /> </Layout>} />
      <Route path='/course-configuration' element={ <Layout> <CreateSubjectPlan /> </Layout> } />
      <Route path='/batch-calendar' element={ <Layout> <AssignBatch /> </Layout> } />
      <Route path='/reorder-content' element={ <Layout> <ReorderContent /> </Layout> } />
      <Route path='/day-wise-group' element={ <Layout> <DayWiseGroup/> </Layout> } />
    </Routes>
  );
}

export default AppRoutes;
