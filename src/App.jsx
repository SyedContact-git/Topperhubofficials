import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Platform from './pages/Platform'
import Batch from './pages/Batch'
import Content from './pages/Content'
import VideoPlayer from './pages/VideoPlayer'
import LiveClasses from './pages/LiveClasses'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/platform/:platformId" element={<Platform />} />
        <Route path="/platform/:platformId/batch/:batchId" element={<Batch />} />
        <Route path="/platform/:platformId/batch/:batchId/content" element={<Content />} />
        <Route path="/platform/:platformId/batch/:batchId/content/:parentId" element={<Content />} />
        <Route path="/platform/:platformId/batch/:batchId/video/:videoId" element={<VideoPlayer />} />
        <Route path="/platform/:platformId/batch/:batchId/live" element={<LiveClasses />} />
        <Route path="/platform/:platformId/live" element={<LiveClasses />} />
      </Routes>
    </Layout>
  )
}
