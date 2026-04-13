import { useEffect, useState } from "react";
import { getAllLandCoverTypes, requestDeleteLandCoverType } from "../services";
import type { LandCoverType } from "../types";   
import "./common.css";

export default function StaticDeleteLandCoverTypePage() {
    const [landCoverTypes, setLandCoverTypes] = useState<LandCoverType[]>([]);

    useEffect(() => {
        getAllLandCoverTypes().then((result) => setLandCoverTypes(result));
    }, []);

    const handleDelete = async (lct_id: number) => {
        const success = await requestDeleteLandCoverType(lct_id);

        if (success) {
            setLandCoverTypes((prev) => prev.filter((lct) => lct.lct_id !== lct_id));
        } else {
            console.log("Failed to delete Land Cover Type with id: " + lct_id);
        }
    };

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Manage Land Cover Types</h1>
                <div className="list-container">
                    {landCoverTypes.map((lct) => (
                        <div className="list-entry" key={lct.lct_id}>
                            <div className="region-name">   {/* reused class for consistency */}
                                Type: {lct.type_name}
                            </div>
                            <div>
                                Category: {lct.category}
                            </div>
                            <div className="region-details">
                                {lct.description || "No description provided."}
                            </div>
                            <button onClick={() => handleDelete(lct.lct_id)}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}