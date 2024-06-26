import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query'; // Импортируем QueryClient и QueryClientProvider
import Login from 'pages/Login';
import RegistrationForm from 'pages/Registration';
import Dashboard from 'pages/Dashboard';
import Navigation from 'components/Navigation';
import { Layout } from 'antd';
import UserProjects from 'pages/Project';
import TeamPage from 'pages/TeamPage';
import TabNavigation from 'components/TabNavigation';
import TaskBoard from 'pages/TaskPersonal'
import ReportsPage from 'pages/ReportsPage';
import LearningMaterialsPage from 'pages/LearningMaterialsPage';



const { Content } = Layout;

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Navigation />
          <Layout>
            <Content style={{ background: '#fff' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registration" element={<RegistrationForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<UserProjects />} />
                {/* <Route path="/projects/:projectId/columns" element={<BoardTaskPage />} />
                <Route path="/projects/:projectId/list" element={<TaskListView />} /> */}
                <Route path="/teams/:teamId/" element={<TeamPage />} />
                <Route path="/tasks/" element={<TaskBoard />} />
                <Route path="/projects/:projectId/" element={<TabNavigation />} />
                <Route path='/reports' element={<ReportsPage/>}/>
                
                <Route path='/notes' element={<LearningMaterialsPage/>}/>
                {/* <Route path="/projects/:projectId/" element={<ProjectPage/>} /> */}
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
