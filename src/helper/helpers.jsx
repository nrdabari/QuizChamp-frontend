export const sourceOptions = [
  "Workbook",
  "Olympiad Guide",
  "Previous Years Paper",
  "Practice Set",
  "Textbook",
  "Power Math",
];

export const formatElapsedTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const words = [
  "Magic",
  "Super",
  "Cool",
  "Happy",
  "Smart",
  "Bright",
  "Quick",
  "Swift",
  "Power",
  "Wonder",
  "Great",
  "Amazing",
  "Awesome",
  "Epic",
  "Fast",
  "Strong",
  "Lucky",
  "Sunny",
  "Star",
  "Fire",
  "Ocean",
  "Sky",
  "Moon",
  "Thunder",
  "Phoenix",
  "Dragon",
  "Tiger",
  "Eagle",
  "Lion",
  "Wolf",
  "Bear",
  "Fox",
];

// Mock subjects data with class levels for grade 5
export const mockSubjects = [
  { id: 1, name: "Mathematics", classLevels: [1, 2, 3, 4, 5] },
  { id: 2, name: "Science", classLevels: [3, 4, 5] },
  { id: 3, name: "English", classLevels: [1, 2, 3, 4, 5] },
  { id: 4, name: "Social Studies", classLevels: [4, 5] },
  { id: 5, name: "Hindi", classLevels: [1, 2, 3, 4, 5] },
  { id: 6, name: "Physics", classLevels: [5] },
  { id: 7, name: "Chemistry", classLevels: [5] },
];
