import { useState } from "react";
import { useNavigate } from "react-router-dom";

const counselors = [
  {
    type: "Academic Counselor",
    image:
      "https://img.freepik.com/free-vector/hand-drawn-speech-therapy-illustration_23-2149211795.jpg",
  },
  {
    type: "Career Counselor",
    image:
      "https://cdn.vectorstock.com/i/1000x1000/75/62/psychotherapy-counseling-doctor-psychologist-vector-25617562.webp",
  },
  {
    type: "Personal Counselor",
    image:
      "https://img.freepik.com/free-vector/webinar-concept-illustration_114360-4874.jpg",
  },
  {
    type: "Financial Counselor",
    image:
      "https://img.freepik.com/free-vector/webinar-concept-illustration_114360-4764.jpg",
  },
  {
    type: "Health and Wellness Counselor",
    image:
      "https://img.freepik.com/free-vector/medical-worker-with-clipboard-waiting-patients_74855-7617.jpg",
  },
  {
    type: "Student Life Counselor",
    image:
      "https://img.freepik.com/free-vector/hand-drawn-visit-psychologist-concept_52683-69070.jpg",
  },
  {
    type: "Emotional Support Counselor",
    image:
      "https://img.freepik.com/free-vector/hand-drawn-visit-psychologist-concept_52683-69069.jpg",
  },
];

const Counselors = () => {
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (counselor) => {
    setSelectedCounselor(counselor);
  };

  const handleConfirmation = (confirmed) => {
    if (confirmed && selectedCounselor) {
      navigate(`/counselors/chat/${selectedCounselor.type.toLowerCase()}`);
    }
    setSelectedCounselor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-10 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        Kindly choose your designated{" "}
        <span className="text-green-500">counselor</span>.
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {counselors.map((counselor, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(counselor)}
            className="cursor-pointer bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden group"
          >
            <img
              src={counselor.image}
              alt={counselor.type}
              className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-4 text-center">
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {counselor.type}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {selectedCounselor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 text-center space-y-4">
            <p className="text-lg text-gray-800">
              Start session with{" "}
              <span className="font-bold text-blue-600">
                {selectedCounselor.type}
              </span>
              ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleConfirmation(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirmation(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counselors;
