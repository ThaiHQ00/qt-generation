import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Places from "./pages/places";
import Love from "./pages/love"; // Ensure correct file import
import Hate from "./pages/hate"; // Ensure correct file import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Places />} />
        <Route path="/love" element={<Love />} />
        <Route path="/hate" element={<Hate />} />
      </Routes>
    </Router>
  );
}

export default App;