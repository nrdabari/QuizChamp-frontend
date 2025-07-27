import { UploadCloud, User } from "lucide-react";
import AddExcercise from "./views/admin/addExcercise";
import ExerciseList from "./views/admin/ExerciseList";
import BulkQuestionUpload from "./views/admin/BulkQuestionUpload ";
import EditQuestionList from "./views/admin/EditQuestionList";
import StartExam from "./views/user/StartExam";
import ExamPage from "./views/user/ExamPage";
import TestReport from "./views/user/ExamReports";

const routes = [
  {
    name: "Add Excercise",
    layout: "/admin",
    path: "activities",
    icon: User,
    component: <AddExcercise />,
    sideBarVisible: false,
    dynamicValue: 0,
    notificationBarVisible: true,
  },
  {
    name: "Edit Excercise",
    layout: "/admin",
    path: "edit-exercise/:id",
    icon: User,
    component: <AddExcercise />,
    sideBarVisible: false,
    dynamicValue: 0,
    notificationBarVisible: true,
  },
  {
    name: "Exercise List",
    layout: "/admin",
    path: "exercises",
    icon: User,
    component: <ExerciseList />,
    sideBarVisible: true,
    notificationBarVisible: true,
  },
  {
    name: "Exam",
    layout: "/user",
    path: "exam",
    icon: User,
    component: <StartExam />,
    sideBarVisible: true,
    notificationBarVisible: true,
  },
  {
    name: "Test",
    layout: "/user",
    path: "test/:exerciseId",
    icon: User,
    component: <ExamPage />,
    sideBarVisible: false,
    notificationBarVisible: false,
  },
  {
    name: "Submission Report",
    layout: "/user",
    path: "report/:submissionId",
    icon: User,
    component: <TestReport />,
    sideBarVisible: false,
    notificationBarVisible: false,
  },

  {
    name: "Bulk Upload",
    layout: "/admin",
    path: "bulk-upload/:exerciseId", // dynamic route
    icon: <UploadCloud size={18} />,
    component: <BulkQuestionUpload />,
    sideBarVisible: false, // not shown in sidebar
    dynamicValue: 1, // optional if you use it in your logic
    secondary: true, // optional, use if needed
    notificationBarVisible: true,
  },
  {
    name: "Edit Questions",
    layout: "/admin",
    path: "edit-questions/:exerciseId", // dynamic route
    icon: <UploadCloud size={18} />,
    component: <EditQuestionList />,
    sideBarVisible: false, // not shown in sidebar
    dynamicValue: 1, // optional if you use it in your logic
    secondary: true, // optional, use if needed
    notificationBarVisible: true,
  },
];

export default routes;
