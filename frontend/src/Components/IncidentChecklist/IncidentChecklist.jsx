import React, { useState } from "react";
import "./IncidentChecklist.css";

const steps = [
    {
        id: 1,
        title: "Identify the Incident",
        description:
            "Start by looking for unusual activities or problems in your system. This could include unexpected errors, files you don’t recognize, or your system running slower than usual. Check any warning messages, alerts, or notifications from your security tools. Think of this step as identifying the 'what happened' in the situation.",
    },
    {
        id: 2,
        title: "Contain the Incident",
        description:
            "Once you’ve identified a problem, act quickly to stop it from causing more damage. For example, disconnect infected computers from the internet, block harmful programs, or temporarily disable user accounts that seem suspicious. Containment ensures the issue doesn’t spread to other devices or users.",
    },
    {
        id: 3,
        title: "Eradicate the Threat",
        description:
            "After you’ve contained the problem, focus on removing the root cause. This might involve deleting harmful files, uninstalling malicious software, or closing security gaps that allowed the problem to occur. Think of this step as cleaning up the mess and ensuring the same problem won’t happen again.",
    },
    {
        id: 4,
        title: "Recover Systems",
        description:
            "Once the threat is removed, you need to get things back to normal. Restore any files or systems from safe backups, update software to the latest versions, and double-check that everything is working properly. This step ensures your business can continue operating smoothly.",
    },
    {
        id: 5,
        title: "Review and Learn",
        description:
            "Finally, take some time to review what happened and how it was handled. Write down what you’ve learned from the incident and identify ways to improve your response next time. This might include updating your security policies, training your team, or investing in better tools. Learning from each incident will make your systems stronger in the future.",
    },
];



const IncidentChecklist = () => {
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showDetails, setShowDetails] = useState(null);

    const handleToggle = (id) => {
        setCompletedSteps((prev) =>
            prev.includes(id) ? prev.filter((step) => step !== id) : [...prev, id]
        );
    };

    const handleDetails = (id) => {
        setShowDetails((prev) => (prev === id ? null : id));
    };

    const exportChecklist = () => {
        const completedStepsData = steps.map((step) => {
            return `${step.title} - ${completedSteps.includes(step.id) ? "Completed" : "Pending"
                }\nDetails: ${step.description}`;
        });

        const checklistContent = `
Incident Response Checklist
===========================
Completion Progress: ${Math.round((completedSteps.length / steps.length) * 100)}%

${completedStepsData.join("\n\n")}

Thank you for using our Incident Response Checklist!
`;

        const blob = new Blob([checklistContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Incident_Response_Checklist.txt";
        link.click();
    };

    const progress = Math.round((completedSteps.length / steps.length) * 100);

    return (
        <div className="incident-page">
            <header className="incident-header">
                <h1>What to Do When Things Go Wrong Online</h1>
                <p>
                    Responding to a cybersecurity incident can feel overwhelming. This
                    simple checklist guides you step by step to ensure you handle the
                    situation effectively. Follow these steps to secure your systems and
                    reduce potential damage.
                </p>
            </header>
            <div className="checklist-container">
                <h2 className="checklist-title">Your Checklist</h2>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    <p>{progress}% Completed</p>
                </div>
                <ul className="checklist-steps">
                    {steps.map((step) => (
                        <li key={step.id} className="checklist-step">
                            <div className="step-header">
                                <input
                                    type="checkbox"
                                    checked={completedSteps.includes(step.id)}
                                    onChange={() => handleToggle(step.id)}
                                />
                                <span>{step.title}</span>
                                <button
                                    className="details-button"
                                    onClick={() => handleDetails(step.id)}
                                >
                                    {showDetails === step.id ? "Hide Details" : "Show Details"}
                                </button>
                            </div>
                            {showDetails === step.id && (
                                <div className="step-details">{step.description}</div>
                            )}
                        </li>
                    ))}
                </ul>
                <button className="export-button" onClick={exportChecklist}>
                    Export Checklist
                </button>
            </div>
        </div>
    );
};

export default IncidentChecklist;
