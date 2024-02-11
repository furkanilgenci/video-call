import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Home from "./routes";
import Call from "./routes/call";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:callId",
    element: <Call />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
