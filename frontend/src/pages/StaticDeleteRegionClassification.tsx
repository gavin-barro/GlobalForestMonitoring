import { useEffect, useState } from "react";
import { getAllRegionClassifications, getAllLandCoverTypes, getAllRegions, requestDeleteRegionClassification } from "../services";
import type { RegionClassification, LandCoverType, Region } from "../types";
import "./common.css";

export default function StaticDeleteRegionClassification() {
    const [classifications, setClassifications] = useState<RegionClassification[]>([]);
    const [landCoverTypes, setLandCoverTypes] = useState<LandCoverType[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);

    useEffect(() => {
        getAllRegionClassifications().then(setClassifications);
        getAllLandCoverTypes().then(setLandCoverTypes);
        getAllRegions().then(setRegions);
    }, []);

    const getLCTName = (lct_id: number) => {
        const lct = landCoverTypes.find(l => l.lct_id === lct_id);
        return lct ? lct.type_name : "Unknown";
    };

    const getRegionName = (region_id: number) => {
        const region = regions.find(r => r.region_id === region_id);
        return region ? region.region_name : "Unknown";
    };

    const handleDelete = async (lct_id: number, region_id: number) => {
        const success = await requestDeleteRegionClassification(lct_id, region_id);
        if (success) {
            setClassifications(prev => prev.filter(c => !(c.lct_id === lct_id && c.region_id === region_id)));
        } else {
            console.log(`Failed to delete classification: lct=${lct_id}, region=${region_id}`);
        }
    };

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Manage Region Classifications</h1>
                <div className="list-container">
                    {classifications.map((cls) => (
                        <div className="list-entry" key={`${cls.lct_id}-${cls.region_id}`}>
                            <div className="region-name">
                                {getRegionName(cls.region_id)} → {getLCTName(cls.lct_id)}
                            </div>
                            <button onClick={() => handleDelete(cls.lct_id, cls.region_id)}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}