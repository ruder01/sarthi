import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const LOCAL_STORAGE_KEY_DATA_SCIENCE = "dataScienceRoadmapProgress";
const LOCAL_STORAGE_KEY_FINANCIAL = "financialRoadmapProgress";
const LOCAL_STORAGE_KEY_DATA_SCIENCE_BADGES = "dataScienceRoadmapBadges";

// Simple component to render a badge
const Badge = ({ name }) => (
  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-indigo-800 text-sm font-medium mr-2">
    {name}
  </span>
);

const RoadmapDisplay = () => {
  const [showDataScience, setShowDataScience] = useState(true);

  const initialDataScienceRoadmap = [
    {
      Goal: "Solidify Python for Data Science",
      Description: "Focus on NumPy, Pandas, Matplotlib.",
      isCompleted: false,
      badge: "Python Ace",
      recommendations: [{ title: "NumPy Docs", link: "..." }, { title: "Pandas Docs", link: "..." }, { title: "Matplotlib Docs", link: "..." }],
    },
    {
      Goal: "Learn Data Visualization Techniques",
      Description: "Explore Seaborn and Plotly.",
      isCompleted: false,
      badge: "Viz Whiz",
      recommendations: [{ title: "Seaborn Tut", link: "..." }, { title: "Plotly Docs", link: "..." }],
    },
    {
      Goal: "Master Statistical Concepts",
      Description: "Hypothesis testing, regression.",
      isCompleted: false,
      badge: "Stats Guru",
      recommendations: [{ title: "Khan Stats", link: "..." }, { title: "StatQuest", link: "..." }],
    },
    {
      Goal: "Intro to Machine Learning",
      Description: "Linear/logistic regression, decision trees.",
      isCompleted: false,
      badge: "ML Beginner",
      recommendations: [{ title: "Scikit-learn", link: "..." }, { title: "Ng's ML", link: "..." }],
    },
    {
      Goal: "Explore Model Evaluation",
      Description: "Metrics for model performance.",
      isCompleted: false,
      badge: "Eval Expert",
      recommendations: [{ title: "Scikit-learn Eval", link: "..." }],
    },
    {
      Goal: "Work on Data Science Projects",
      Description: "Apply skills to real-world datasets.",
      isCompleted: false,
      badge: "Project Pro",
      recommendations: [{ title: "Kaggle", link: "..." }, { title: "UCI Repo", link: "..." }],
    },
    {
      Goal: "Learn SQL for Data Manipulation",
      Description: "Querying and managing databases.",
      isCompleted: false,
      badge: "SQL Sorcerer",
      recommendations: [{ title: "W3Schools SQL", link: "..." }],
    },
    {
      Goal: "Intro to Deep Learning (Optional)",
      Description: "TensorFlow/PyTorch.",
      isCompleted: false,
      badge: "Deep Diver",
      recommendations: [{ title: "TensorFlow Docs", link: "..." }, { title: "PyTorch Docs", link: "..." }],
    },
    {
      Goal: "Build a Data Science Portfolio",
      Description: "Showcase your projects.",
      isCompleted: false,
      badge: "Portfolio Pioneer",
      recommendations: [{ title: "DS Portfolio Guide", link: "..." }],
    },
    {
      Goal: "Network with Data Science Community",
      Description: "Connect, attend webinars.",
      isCompleted: false,
      badge: "Community Connector",
      recommendations: [{ title: "LinkedIn", link: "..." }, { title: "DS Subreddit", link: "..." }],
    },
  ];

  const initialFinancialCounselorRoadmap = [
    {
      Goal: "Understand Your Risk Tolerance and Goals",
      Description: "Self-assessment, define specific goals, SIP basics.",
      isCompleted: false,
      id: "financial-1",
      recommendations: [],
    },
    {
      Goal: "Research Low-Risk SIP Options",
      Description: "Debt funds, conservative hybrid funds, large-cap index funds.",
      isCompleted: false,
      id: "financial-2",
      recommendations: [],
    },
    {
      Goal: "Select and Start Your SIPs",
      Description: "Diversification, SIP amount/frequency, KYC, platform.",
      isCompleted: false,
      id: "financial-3",
      recommendations: [],
    },
    {
      Goal: "Review and Rebalance (Annually)",
      Description: "Performance review, adjust allocation if needed, stay informed.",
      isCompleted: false,
      id: "financial-4",
      recommendations: [],
    },
    {
      Goal: "Build an Emergency Fund",
      Description: "Liquid, low-risk fund for unexpected events.",
      isCompleted: false,
      id: "financial-5",
      recommendations: [],
    },
    {
      Goal: "Think Long-Term",
      Description: "Develop long-term financial perspective.",
      isCompleted: false,
      id: "financial-6",
      recommendations: [],
    },
    {
      Goal: "Consider Increasing SIP Amount",
      Description: "Increase investments as income grows.",
      isCompleted: false,
      id: "financial-7",
      recommendations: [],
    },
    {
      Goal: "Seek Professional Advice (Optional)",
      Description: "Consult a qualified financial advisor.",
      isCompleted: false,
      id: "financial-8",
      recommendations: [],
    },
  ];

  const [dataScienceRoadmap, setDataScienceRoadmap] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_DATA_SCIENCE);
    return stored ? JSON.parse(stored) : initialDataScienceRoadmap;
  });
  const [financialCounselorRoadmap, setFinancialCounselorRoadmap] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_FINANCIAL);
    return stored ? JSON.parse(stored) : initialFinancialCounselorRoadmap;
  });
  const [awardedDataScienceBadges, setAwardedDataScienceBadges] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_DATA_SCIENCE_BADGES);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DATA_SCIENCE, JSON.stringify(dataScienceRoadmap));
  }, [dataScienceRoadmap]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_FINANCIAL, JSON.stringify(financialCounselorRoadmap));
  }, [financialCounselorRoadmap]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DATA_SCIENCE_BADGES, JSON.stringify(awardedDataScienceBadges));
  }, [awardedDataScienceBadges]);

  useEffect(() => {
    if (showDataScience) {
      const newBadges = [];
      dataScienceRoadmap.forEach(item => {
        if (item.isCompleted && item.badge && !awardedDataScienceBadges.includes(item.badge)) {
          newBadges.push(item.badge);
        }
      });
      if (newBadges.length > 0) {
        setAwardedDataScienceBadges(prev => [...prev, ...newBadges]);
      }
    }
  }, [dataScienceRoadmap, showDataScience, awardedDataScienceBadges]);

  const handleTaskClick = (index) => {
    if (showDataScience) {
      const updatedRoadmap = [...dataScienceRoadmap];
      updatedRoadmap[index].isCompleted = !updatedRoadmap[index].isCompleted;
      setDataScienceRoadmap(updatedRoadmap);
    } else {
      const updatedRoadmap = [...financialCounselorRoadmap];
      updatedRoadmap[index].isCompleted = !updatedRoadmap[index].isCompleted;
      setFinancialCounselorRoadmap(updatedRoadmap);
    }
  };

  const currentRoadmap = showDataScience ? dataScienceRoadmap : financialCounselorRoadmap;
  const roadmapTitle = showDataScience ? "Data Scientist Roadmap" : "Financial Counselor Roadmap (SIP for DJ)";
  const currentBadges = showDataScience ? awardedDataScienceBadges : [];

  return (
    <div className="min-h-screen w-full bg-gray-600 flex flex-col items-center p-4">
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded-md ${showDataScience ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          onClick={() => setShowDataScience(true)}
        >
          Data Scientist
        </button>
        <button
          className={`px-4 py-2 rounded-md ${!showDataScience ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          onClick={() => setShowDataScience(false)}
        >
          Financial Counselor
        </button>
      </div>

      <h2 className="text-xl text-white font-semibold mb-4">{roadmapTitle}</h2>

      <div className="w-full max-w-2xl">
        {currentRoadmap.map((item, index) => (
          <div
            key={showDataScience ? index : item.id}
            className={`text-white p-4 m-2 rounded cursor-pointer ${item.isCompleted ? 'bg-green-500' : 'bg-gray-800'}`}
            onClick={() => handleTaskClick(index)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{item.Goal}</h3>
              {showDataScience && item.isCompleted && item.badge && <Badge name={item.badge} />}
            </div>
            <p className="text-gray-300">{item.Description}</p>
            {item.recommendations && item.recommendations.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold text-md mb-1">Recommendations:</h4>
                <ul>
                  {item.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center text-blue-300 hover:text-blue-500">
                      <FaExternalLinkAlt className="mr-2" />
                      <a href={rec.link} target="_blank" rel="noopener noreferrer">
                        {rec.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDataScience && awardedDataScienceBadges.length > 0 && (
        <div className="mt-6 text-white">
          <h3 className="font-semibold text-lg mb-2">Your Achievements:</h3>
          <div className="flex flex-wrap">
            {awardedDataScienceBadges.map((badge, index) => (
              <Badge key={index} name={badge} />
            ))}
          </div>
        </div>
      )}

      {showDataScience && dataScienceRoadmap.every(item => item.isCompleted) && (
        <div className="text-white mt-4">
          Congratulations! You have completed the Data Scientist roadmap and earned all badges! 🎉
        </div>
      )}
    </div>
  );
};

export default RoadmapDisplay;