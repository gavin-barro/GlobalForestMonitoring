import './App.css'
import AppHeader from './components/AppHeader'
import { Routes, Route } from "react-router-dom";
import StaticAddRegion from "./pages/StaticAddRegion";
import StaticAddUser from "./pages/StaticAddUser";
import StaticAddForestObservation from "./pages/StaticAddForestObservation";
import StaticDeleteUser from './pages/StaticDeleteUser';
import StaticDeleteRegion from './pages/StaticDeleteRegion';
import StaticDeleteForestObservation from './pages/StaticDeleteForestObservation';
import UpdateFeed from './pages/UpdateFeed';

function App() {
  return (
    <div className="app">
      <AppHeader />
      <Routes>
        <Route path="/static/add/region" element={<StaticAddRegion />} />
        <Route path="/static/add/user" element={<StaticAddUser />} />
        <Route path="/static/add/forest_observation" element={<StaticAddForestObservation />} />
        <Route path="/static/delete/region" element={<StaticDeleteRegion />} />
        <Route path="/static/delete/user" element={<StaticDeleteUser />} />
        <Route path="/static/delete/forest_observation" element={<StaticDeleteForestObservation />} />
        <Route path="/static/get/feed" element={<UpdateFeed />} />
      </Routes>
    </div>
  )
}

export default App
