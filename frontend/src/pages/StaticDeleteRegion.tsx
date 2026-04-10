import { useEffect, useState } from "react";
import { getAllRegions, requestDeleteRegion } from "../services";
import type { Region } from "../types";
import "./common.css"

export default function StaticDeleteRegionPage() {
    const [regions, setRegions] = useState<Region[]>([]);

    /* 
     * Calculate the number of child regions related to a region.
     * Relies on use effect region list.
     */
    function calculateRegionChildTotal(target_region_id: number): number {
        var total: number = 0;
        for (var region of regions) {
            if (region.parent_region_id == target_region_id) {
                total++;
            }
        }
        return total;
    }

    /* 
     * Retrieve Region.region_name for target region.
     * Relies on use effect region list.
     */
    function getRegionName(target_region_id: number): string {
        const target_region = regions.find(region => region.region_id === target_region_id);
        if (target_region) {
            return target_region.region_name
        } else {
            return "Unknown region."
        }
    }

    useEffect(() => {
        getAllRegions()
            .then((result) => setRegions(result));
    }, []);

    const handleDelete = async (id: number) => {
        const success = await requestDeleteRegion(id);

        if (success) {
            setRegions((prev) => prev.filter((region) => region.region_id !== id));
        } else {
            console.log("Failed to delete region with id: " + id);
        }
    };

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Manage Regions</h1>
                <div className="list-container">
                {regions.map((region) => {
                    const numChildren = calculateRegionChildTotal(region.region_id);
                    var plural = "s";
                    if (numChildren == 1) {
                        plural = ""
                    }
                    return (
                        <div className="list-entry" key={region.region_id}>
                            <div className="region-name">
                                Region: {region.region_name}
                            </div>
                            <div>
                                Parent Region: {getRegionName(region.parent_region_id)}
                            </div>
                            <div className="region-details">
                                Contains {numChildren} child region{plural}.
                            </div>
                            <button onClick={() => handleDelete(region.region_id)}>
                                Delete
                            </button>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}