import './App.css'
import AppHeader from './components/AppHeader'
import { Routes, Route } from "react-router-dom";
import StaticAddRegion from "./pages/StaticAddRegion";
import StaticAddUser from "./pages/StaticAddUser";
import StaticAddForestObservation from "./pages/StaticAddForestObservation";

function App() {
  return (
    <div className="app">
      <AppHeader />
      <Routes>
        <Route path="/static/add/region" element={<StaticAddRegion />} />
        <Route path="/static/add/user" element={<StaticAddUser />} />
        <Route path="/static/add/forestobservation" element={<StaticAddForestObservation />} />
      </Routes>
    </div>
  )
}

export default App
