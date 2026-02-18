import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProjectListPage } from "./ProjectListPage";
import { ProjectPage } from "./ProjectPage";

export const router = createBrowserRouter([
  { path: "/", element: <ProjectListPage /> },
  { path: "/project/:projectId", element: <ProjectPage /> },
  { path: "*", element: <Navigate to="/" replace /> }
]);
