import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SingleSlit from './pages/SingleSlit';
import CircularAperture from './pages/CircularAperture';
import Rayleigh from './pages/Rayleigh';
import Comparison from './pages/Comparison';
import Sandbox from './pages/Sandbox';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/single-slit" replace />} />
        <Route path="/single-slit" element={<SingleSlit />} />
        <Route path="/circular-aperture" element={<CircularAperture />} />
        <Route path="/rayleigh" element={<Rayleigh />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </Layout>
  );
}
