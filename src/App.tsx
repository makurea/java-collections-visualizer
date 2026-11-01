import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/:slug" element={<CollectionPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}