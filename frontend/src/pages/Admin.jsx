import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '../components/adminPage/AdminHeader';
import PipelineGrid from '../components/adminPage/PipelineGrid';
import SystemLogs from '../components/adminPage/SystemLogs';

const Admin = () => {
    const [groupId, setGroupId] = useState('1942419502675158');
    const [maxScrolls, setMaxScrolls] = useState(5);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Scraping, 2: Extraction, 3: Upload
    const [stats, setStats] = useState({
        postsFound: 0,
        jobsExtracted: 0,
        jobsUploaded: 0
    });

    // Mock progress for visualization purposes
    const [progress, setProgress] = useState({
        scrape: 0,
        structure: 0,
        upload: 0
    });

    const logsEndRef = useRef(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const handleRunPipeline = async () => {
        setIsRunning(true);
        setLogs([]);
        setActiveStep(1);
        setStats({ postsFound: 0, jobsExtracted: 0, jobsUploaded: 0 });
        setProgress({ scrape: 0, structure: 0, upload: 0 });

        try {
            const response = await fetch('http://localhost:8000/api/run-pipeline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ groupID: groupId, maxScrolls: parseInt(maxScrolls) }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n');

                lines.forEach(line => {
                    if (line) {
                        setLogs(prev => [...prev, line]);
                        parseLogLine(line);
                    }
                });
            }

        } catch (error) {
            setLogs(prev => [...prev, `[ERROR] Failed to run pipeline: ${error.message}`]);
        } finally {
            setIsRunning(false);
            setActiveStep(4); // Done
            setProgress({ scrape: 100, structure: 100, upload: 100 });
        }
    };

    const parseLogLine = (line) => {
        // Step transitions and progress simulation
        if (line.includes("Step 1: Scraping")) {
            setActiveStep(1);
            setProgress(p => ({ ...p, scrape: 10 }));
        }
        if (line.includes("Step 2: Extracting")) {
            setActiveStep(2);
            setProgress(p => ({ ...p, scrape: 100, structure: 10 }));
        }
        if (line.includes("Step 3: Uploading")) {
            setActiveStep(3);
            setProgress(p => ({ ...p, structure: 100, upload: 10 }));
        }

        // Stats extraction
        const postsMatch = line.match(/Saved (\d+) new posts/);
        if (postsMatch) {
            setStats(prev => ({ ...prev, postsFound: parseInt(postsMatch[1]) }));
            setProgress(p => ({ ...p, scrape: 80 }));
        }

        const jobMatch = line.match(/Processing job (\d+)\//);
        if (jobMatch) {
            setStats(prev => ({ ...prev, jobsExtracted: parseInt(jobMatch[1]) }));
            setProgress(p => ({ ...p, structure: Math.min(90, p.structure + 5) }));
        }

        const uploadMatch = line.match(/Uploading (\d+) jobs/);
        if (uploadMatch) {
            setStats(prev => ({ ...prev, jobsUploaded: parseInt(uploadMatch[1]) }));
            setProgress(p => ({ ...p, upload: Math.min(90, p.upload + 10) }));
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 font-sans text-[#0f172a]">
            <div className="max-w-7xl mx-auto">
                <AdminHeader
                    groupId={groupId}
                    setGroupId={setGroupId}
                    maxScrolls={maxScrolls}
                    setMaxScrolls={setMaxScrolls}
                    handleRunPipeline={handleRunPipeline}
                    isRunning={isRunning}
                />

                <PipelineGrid
                    stats={stats}
                    progress={progress}
                    activeStep={activeStep}
                />

                <SystemLogs
                    logs={logs}
                    logsEndRef={logsEndRef}
                    isRunning={isRunning}
                />
            </div>
        </div>
    );
};

export default Admin;
