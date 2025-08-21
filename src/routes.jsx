import { UploadCloud, User, User2, User2Icon } from "lucide-react";
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
import Users from "./views/admin/users";
import AddUser from "./views/admin/users/pages/AddUser";
import LanguageTutor from "./views/user/LearnLang";
import ImageMerger from "./views/admin/ImageMerger";
import { AdminPanel } from "./views/admin/AdminPanel";
import StudentPanel from "./views/user/StudentPanel";

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
    role: [ROLES.ADMIN],
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
    role: [ROLES.ADMIN],
  },
  {
    name: "Exercise List",
    layout: "/admin",
    path: "exercises",
    icon: User,
    component: <ExerciseList />,
    sideBarVisible: true,
    notificationBarVisible: true,
    role: [ROLES.ADMIN],
  },
  {
    name: "Exam",
    layout: "/user",
    path: "exam",
    icon: User,
    component: <StartExam />,
    sideBarVisible: true,
    notificationBarVisible: true,
    role: [ROLES.USER],
  },
  {
    name: "Assign Chapters",
    layout: "/admin",
    path: "assignments/:exerciseId/chapter-assignment",
    icon: User,
    component: <ChapterAssignmentForm />,
    sideBarVisible: false,
    notificationBarVisible: true,
    role: [ROLES.ADMIN],
  },
  // {
  //   name: "PDF Extract",
  //   layout: "/admin",
  //   path: "extract",
  //   icon: User,
  //   component: <PDFTextExtractor />,
  //   sideBarVisible: true,
  //   notificationBarVisible: true,
  //   role: [ROLES.ADMIN],
  // },
  {
    name: "Test",
    layout: "/user",
    path: "test/:exerciseId",
    icon: User,
    component: <ExamPage />,
    sideBarVisible: false,
    notificationBarVisible: false,
    noLayout: true,
    role: [ROLES.USER],
  },
  {
    name: "Submission Report",
    layout: "/user",
    path: "report/:submissionId",
    icon: User,
    component: <TestReport />,
    sideBarVisible: false,
    notificationBarVisible: false,
    role: [ROLES.USER],
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
    role: [ROLES.ADMIN],
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
    role: [ROLES.ADMIN],
  },
  {
    name: "Add User",
    layout: "/admin",
    path: "user/add",
    icon: User2Icon,
    component: <AddUser />,
    secondary: true,
    sideBarVisible: false,
    dynamicValue: 0,
    notificationBarVisible: false,
    role: [ROLES.ADMIN],
  },
  {
    name: "Edit User",
    layout: "/admin",
    path: "user/edit/:id",
    icon: User2Icon,
    component: <AddUser />,
    secondary: true,
    sideBarVisible: false,
    dynamicValue: 0,
    notificationBarVisible: false,
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
    noLayout: true,
    role: [ROLES.USER],
  },
  {
    name: "Users",
    layout: "/admin",
    path: "users",
    icon: User2,
    activeIcon: User2,
    component: <Users />,
    sideBarVisible: true,
    dynamicValue: 0,
    role: [ROLES.ADMIN],
  },
  // {
  //   name: "Learning Language",
  //   layout: "/user",
  //   path: "learn",
  //   icon: User,
  //   component: <LanguageTutor />,
  //   sideBarVisible: true,
  //   notificationBarVisible: false,
  //   role: [ROLES.USER],
  // },
  {
    name: "Image Merger",
    layout: "/admin",
    path: "img-merge",
    icon: User2,
    activeIcon: User2,
    component: <ImageMerger />,
    sideBarVisible: true,
    dynamicValue: 0,
    role: [ROLES.ADMIN],
  },
  // {
  //   name: "Admin View",
  //   layout: "/admin",
  //   path: "admin-task-view",
  //   icon: User2,
  //   activeIcon: User2,
  //   component: <AdminPanel />,
  //   sideBarVisible: true,
  //   notificationBarVisible: true,
  //   dynamicValue: 0,
  //   role: [ROLES.ADMIN],
  // },
  {
    name: "My Tasks",
    layout: "/user",
    path: "my-task",
    icon: User2,
    activeIcon: User2,
    component: <StudentPanel />,
    notificationBarVisible: true,
    sideBarVisible: true,
    dynamicValue: 0,
    role: [ROLES.USER],
  },
];

export default routes;
