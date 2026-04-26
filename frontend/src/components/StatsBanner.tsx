import { useEffect, useState } from 'react';
import { getViewerStats, getGuestStats, getResearcherStats, getAdminStats } from '../services';
import type { DashboardStats } from '../types';

interface Props {
  userId: number;
  role: 'Viewer' | 'Admin' | 'Researcher' | 'Guest';
}

export default function StatsBanner({ userId, role }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'Viewer') {
      getViewerStats(userId).then(data => {
        setStats(data);
        setLoading(false);
      });
    } else if (role === 'Guest') {
      getGuestStats().then(data => {
        setStats(data);
        setLoading(false);
      });
    } else if (role === 'Researcher') {
      getResearcherStats(userId).then(data => {
        setStats(data);
        setLoading(false);
      });
    } else if (role === 'Admin') {
      getAdminStats().then(data => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [userId, role]);

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Recalculating database aggregates...</div>;
  if (!stats) return null;

  const statItems = role === 'Guest' ? [
    { label: "Active Monitors", value: stats.count, unit: "regions", desc: "COUNT of unique regions in DB" },
    { label: "Global Footprint", value: stats.sum.toLocaleString(), unit: "km²", desc: "SUM of all global observations" },
    { label: "Historical Peak", value: stats.max.toLocaleString(), unit: "km²/yr", desc: "MAX single value ever recorded" },
    { label: "Stability Index", value: stats.min.toLocaleString(), unit: "km²/yr", desc: "MIN loss rate found globally" },
    { label: "System Average", value: stats.avg.toLocaleString(), unit: "km²", desc: "AVG across all system data" },
  ] : role === 'Researcher' ? [
    { label: "Total Submissions", value: stats.count, unit: "proposals", desc: "COUNT of your suggested updates" },
    { label: "Discovery Volume", value: stats.sum.toLocaleString(), unit: "km²", desc: "SUM of all proposed metrics" },
    { label: "Peak Discovery", value: stats.max.toLocaleString(), unit: "km²/yr", desc: "MAX value you have documented" },
    { label: "Granular Precision", value: stats.min.toLocaleString(), unit: "km²/yr", desc: "MIN loss rate you reported" },
    { label: "Proposal Mean", value: stats.avg.toLocaleString(), unit: "km²", desc: "AVG impact per submission" },
  ] : role === 'Admin' ? [
    { label: "User Population", value: stats.count, unit: "users", desc: "COUNT of registered accounts" },
    { label: "Managed Volume", value: stats.sum.toLocaleString(), unit: "km²", desc: "SUM of all platform observations" },
    { label: "Critical Review", value: stats.max.toLocaleString(), unit: "km²/yr", desc: "MAX value in the pending queue" },
    { label: "Precision Floor", value: stats.min.toLocaleString(), unit: "km²/yr", desc: "MIN managed observation value" },
    { label: "Proposal Index", value: stats.avg.toLocaleString(), unit: "km²/yr", desc: "AVG value of reviews in queue" },
  ] : [
    { label: "Tracked Assets", value: stats.count, unit: "regions", desc: "COUNT of active subscriptions" },
    { label: "Total Impact", value: stats.sum.toLocaleString(), unit: "km²", desc: "SUM of all forest loss recorded" },
    { label: "Highest Risk", value: stats.max.toLocaleString(), unit: "km²/yr", desc: "MAX peak loss value detected" },
    { label: "Most Stable", value: stats.min.toLocaleString(), unit: "km²/yr", desc: "MIN loss rate in your areas" },
    { label: "Average Flux", value: stats.avg.toLocaleString(), unit: "km²", desc: "AVG rate across all periods" },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '1rem', 
      marginBottom: '2rem',
      width: '100%'
    }}>
      {statItems.map((item, index) => (
        <div key={index} style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          padding: "1.25rem",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          border: "1px solid rgba(255,255,255,0.7)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#2D6A4F', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label.split(' ')[0]}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1b4332' }}>
            {item.value} <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>{item.unit}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#1b4332', fontWeight: '600' }}>{item.label}</div>
          <div style={{ fontSize: '0.7rem', color: '#888', fontStyle: 'italic' }}>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
