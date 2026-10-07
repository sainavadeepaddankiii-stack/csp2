import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RadarDashboard from './components/RadarDashboard';
import AnalyzerSuite from './components/AnalyzerSuite';
import ReportScamForm from './components/ReportScamForm';
import SocialFeedDashboard from './components/SocialFeedDashboard';
import ModelCalibration from './components/ModelCalibration';
import BenchmarkRunner from './components/BenchmarkRunner';
import { initialRecentReports } from './mockData';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/benchmark' || window.location.hash === '#benchmark')) {
      return 'benchmark';
    }
    return 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#benchmark' || window.location.pathname === '/benchmark') {
        setActiveTab('benchmark');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [reports, setReports] = useState(initialRecentReports);
  const [prefilledContent, setPrefilledContent] = useState('');
  const [prefilledTab, setPrefilledTab] = useState('url');

  // Callback to add a new scam report
  const handleSubmitReport = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  // Callback to upvote/verify community threats
  const handleVerifyReport = (reportId) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, verifiedVotes: report.verifiedVotes + 1 }
          : report
      )
    );
  };

  // Switch to scan center with prefilled content and target subtab
  const triggerQuickScan = (content = '', subTab = 'url') => {
    setPrefilledContent(content);
    setPrefilledTab(subTab);
    setActiveTab('analyzers');
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamically calculate threat index based on report count and critical threats
  const totalReportsCount = reports.length;
  const criticalCount = reports.filter((r) => r.threatLevel === 'Critical').length;
  const threatIndex = Math.min(65 + Math.floor(totalReportsCount * 0.8) + (criticalCount * 2), 98);

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main dashboard panels container */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header totalReportsCount={totalReportsCount} threatIndex={threatIndex} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="content-body">
          {activeTab === 'dashboard' && (
            <RadarDashboard reports={reports} onQuickScan={() => triggerQuickScan('', 'url')} />
          )}

          {activeTab === 'analyzers' && (
            <AnalyzerSuite 
              prefilledContent={prefilledContent} 
              prefilledTab={prefilledTab} 
              clearPrefilled={() => { setPrefilledContent(''); setPrefilledTab('url'); }} 
            />
          )}

          {activeTab === 'report' && (
            <ReportScamForm onSubmitReport={handleSubmitReport} />
          )}

          {activeTab === 'feed' && (
            <SocialFeedDashboard 
              reports={reports} 
              onVerifyReport={handleVerifyReport} 
              onAnalyzeReport={(text) => triggerQuickScan(text, 'social')} 
            />
          )}

          {activeTab === 'calibration' && (
            <ModelCalibration />
          )}

          {activeTab === 'benchmark' && (
            <BenchmarkRunner />
          )}
        </main>
      </div>
    </div>
  );
}
