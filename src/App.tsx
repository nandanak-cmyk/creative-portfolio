import { Navigate, Route, Routes } from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import ProjectPage from './pages/project/ProjectPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/work/:slug" element={<ProjectPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
