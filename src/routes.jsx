import { UploadCloud, User } from "lucide-react";
import AddExcercise from "./views/admin/addExcercise";
import ExerciseList from "./views/admin/ExerciseList";
import BulkQuestionUpload from "./views/admin/BulkQuestionUpload ";
import EditQuestionList from "./views/admin/EditQuestionList";
import StartExam from "./views/user/StartExam";
import ExamPage from "./views/user/ExamPage";
import TestReport from "./views/user/ExamReports";
import { ROLES } from "./constants/enum";
import PracticePage from "./views/user/PracticePage";
import PDFTextExtractor from "./views/admin/PDFTextExtractor";
import ChapterAssignmentForm from "./views/admin/ChapterAssignmentForm";

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
    name: "Assign Chapters",
    layout: "/admin",
    path: "assignments/:exerciseId/chapter-assignment",
    icon: User,
    component: <ChapterAssignmentForm />,
    sideBarVisible: false,
    notificationBarVisible: true,
  },
  {
    name: "PDF Extract",
    layout: "/admin",
    path: "extract",
    icon: User,
    component: <PDFTextExtractor />,
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
  {
    name: "Add Employee",
    layout: "/admin",
    path: "user/add",
    // icon: <img src={books} alt="books-icon"></img>,
    // component: <AddUser />,
    secondary: true,
    sideBarVisible: false,
    dynamicValue: 0,
    role: [ROLES.ADMIN],
  },
  {
    name: "Edit Employee",
    layout: "/admin",
    path: "user/edit/:id",
    // icon: <img src={books} alt="books-icon"></img>,
    // component: <AddUser />,
    secondary: true,
    sideBarVisible: false,
    dynamicValue: 0,
    role: [ROLES.ADMIN],
  },
  {
    name: "Practice Questions",
    layout: "/user",
    path: "practice/:exerciseId", // dynamic route
    icon: User,
    component: <PracticePage />,
    sideBarVisible: false,
    notificationBarVisible: true,
  },
];

export default routes;
