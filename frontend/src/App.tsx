import './App.css'
import { Routes, Route } from "react-router-dom";
import StaticAddRegion from "./pages/StaticAddRegion";
import StaticAddUser from "./pages/StaticAddUser";
import StaticAddForestObservation from "./pages/StaticAddForestObservation";
import StaticDeleteUser from './pages/StaticDeleteUser';
import StaticDeleteRegion from './pages/StaticDeleteRegion';
import StaticDeleteForestObservation from './pages/StaticDeleteForestObservation';
import UpdateFeed from './pages/UpdateFeed';
import SubscriptionFeed from './pages/SubscriptionFeed'
import StaticAddLandCoverType from "./pages/StaticAddLandCoverType";
import StaticDeleteLandCoverType from "./pages/StaticDeleteLandCoverType";
import StaticAddRegionClassification from "./pages/StaticAddRegionClassification";
import StaticDeleteRegionClassification from "./pages/StaticDeleteRegionClassification";
import Login from "./pages/LoginPage";
import GuestDashboard from "./pages/dashboards/GuestDashboard";
import ViewerDashboard from "./pages/dashboards/ViewerDashboard";
import ResearcherDashboard from "./pages/dashboards/ResearcherDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";


function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/guest" element={<GuestDashboard />} />
        <Route path="/dashboard/viewer" element={<ViewerDashboard />} />
        <Route path="/dashboard/researcher" element={<ResearcherDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/static/add/region" element={<StaticAddRegion />} />
        <Route path="/static/add/user" element={<StaticAddUser />} />
        <Route path="/static/add/forest_observation" element={<StaticAddForestObservation />} />
        <Route path="/static/delete/region" element={<StaticDeleteRegion />} />
        <Route path="/static/delete/user" element={<StaticDeleteUser />} />
        <Route path="/static/delete/forest_observation" element={<StaticDeleteForestObservation />} />
        <Route path="/static/get/feed" element={<UpdateFeed />} />
        <Route path="/static/get/subscription" element={<SubscriptionFeed />} />
        <Route path="/static/add/land_cover_type" element={<StaticAddLandCoverType />} />
        <Route path="/static/delete/land_cover_type" element={<StaticDeleteLandCoverType />} />
        <Route path="/static/add/region_classification" element={<StaticAddRegionClassification />} />
        <Route path="/static/delete/region_classification" element={<StaticDeleteRegionClassification />} />
      </Routes>
    </div>
  )
}

export default App
