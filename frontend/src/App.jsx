
import Calendar from "./components/Calendar";
import { ToastContainer } from "react-toastify";

function App() {
  return (
      <div className="min-h-screen bg-gray-100">
        <ToastContainer/>
        <Calendar />
      </div>    
  );
}

export default App;
