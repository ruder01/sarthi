import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState([]);
  const [showRecommendationsIndex, setShowRecommendationsIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const response = await axios.get("/api/v1/user/roadmap");
      console.log("Roadmap response:", response.data);
      
      if (response.data && response.data.roadmap) {
        setRoadmapData(response.data.roadmap);
      } else {
        console.log("No roadmap data available");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching roadmap:", err);
      setLoading(false);
    }
  };

  const completedTasksCount = roadmapData.filter(
    (item) => item.isCompleted
  ).length;
  const totalTasksCount = roadmapData.length;
  const progress =
    totalTasksCount === 0
      ? 0
      : Math.round((completedTasksCount / totalTasksCount) * 100);

  const handleTaskClick = (index) => {
    const updatedRoadmapData = [...roadmapData];
    updatedRoadmapData[index].isCompleted = !updatedRoadmapData[index].isCompleted;
    setRoadmapData(updatedRoadmapData);
  };

  const handleDropdownClick = (index, e) => {
    e.stopPropagation();
    setShowRecommendationsIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await axios.put("/api/v1/chat/roadmap", { roadmap: roadmapData });
      setSaveStatus("success");
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving roadmap:", err);
      setSaveStatus("error");
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const requestNewRoadmap = async () => {
    setLoading(true);
    try {
      // This just makes a request to generate a new roadmap
      const response = await axios.post("/api/v1/chat/roadmap");
      console.log("Generated roadmap:", response.data);
      
      // Try to parse the response if it's a string
      let parsedRoadmap;
      if (typeof response.data === 'string') {
        try {
          parsedRoadmap = JSON.parse(response.data);
          setRoadmapData(parsedRoadmap);
        } catch (parseErr) {
          console.error("Error parsing roadmap data:", parseErr);
        }
      } else if (Array.isArray(response.data)) {
        // If the response is already an array
        setRoadmapData(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error requesting roadmap:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-xl">Loading your roadmap...</div>
      </div>
    );
  }

  if (roadmapData.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center text-white p-4">
        <div className="text-xl mt-8">No roadmap available</div>
        <div className="mt-4 text-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={requestNewRoadmap}
          >
            Generate Roadmap
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={() => navigate(-1)}
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 fixed top-0 left-0 z-10">
        <div
          className="bg-green-500 text-xs leading-none py-1 text-center text-white"
          style={{
            width: `${progress}%`,
            transition: "width 0.5s ease-in-out",
          }}
        >
          {progress}%
        </div>
      </div>

      {/* Page title */}
      <h1 className="text-white text-2xl font-bold mt-12 mb-6">Your Personal Roadmap</h1>

      {/* Container for tasks */}
      <div className="w-full max-w-4xl mt-4">
        {/* Roadmap tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmapData.map((item, index) => (
            <div
              key={index}
              className={`text-white p-4 rounded-lg cursor-pointer transition-colors duration-300 ${
                item.isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={() => handleTaskClick(index)}
            >
              <h2 className="font-semibold text-lg mb-2">{item.Goal}</h2>
              {item.Description && (
                <p className="text-sm opacity-90 mb-3">{item.Description}</p>
              )}
              {item.timeline && (
                <p className="text-xs bg-black bg-opacity-30 inline-block px-2 py-1 rounded mb-3">
                  {item.timeline}
                </p>
              )}
              
              <button
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-1 px-3 rounded mt-2 w-full"
                onClick={(e) => handleDropdownClick(index, e)}
              >
                {showRecommendationsIndex === index
                  ? "Hide Recommendations"
                  : "Show Recommendations"}
              </button>
              
              {showRecommendationsIndex === index && (
                <div className="mt-3 text-white">
                  {item.recommendations && item.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {item.recommendations.map((recommendation, i) => (
                        <li
                          key={i}
                          className="border border-white p-2 bg-blue-900 text-white rounded"
                        >
                          <a
                            href={recommendation.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-blue-300"
                          >
                            <FaExternalLinkAlt size={12} />
                            <span>{recommendation.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm italic">
                      No recommendations available. Try searching online for resources.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        className={`w-full max-w-lg rounded-lg text-white font-bold py-3 px-4 mt-8 transition-colors duration-300 ${
          saveStatus === "saving" 
            ? "bg-yellow-500 cursor-wait"
            : saveStatus === "success"
            ? "bg-green-500"
            : saveStatus === "error"
            ? "bg-red-500"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={handleSave}
        disabled={saveStatus === "saving"}
      >
        {saveStatus === "saving" 
          ? "Saving..." 
          : saveStatus === "success" 
          ? "Saved Successfully!" 
          : saveStatus === "error" 
          ? "Failed to Save" 
          : "Save Progress"}
      </button>
    </div>
  );
};

export default Roadmap;