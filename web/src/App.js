import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Home/Navbar";
import Home from "./Home/Home";
import Tg from "./TG/Tg";
import Table from "./Dealer/Table";
import DetailView from "./Dealer/DetailView";
import Udata from "./User/Udata";



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tollplaza" element={<Tg />} />
        <Route path="/User-data" element={<Udata />} />
        <Route path="/getdb" element={<Table />} />
        <Route path="/Udata" element={<Udata />} />
        <Route path="/detail/:registrationNumber" element={<DetailView />} />

      
      </Routes>
        
    </Router>
  );
}

export default App;

