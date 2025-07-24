
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css' 
import AddCorrectAnswerFromTxt from './updateAnswer/AddCorrectAnswerFromTxt'
// import ExamPage from './exam/ExamPage';
import Layout from './components/layout';
import routes from './routes';


function App() {


  return (
    <>
 <Router>
      <Routes>
            <Route path="/admin" element={<Layout />} >
        {routes
            .filter((r) => r.layout === "/admin")
            .map((r, key) => (
              <Route path={r.path} element={r.component} key={key} />
            ))}
            
      </Route>
       <Route path="/user" element={<Layout />}>
    {routes
      .filter((r) => r.layout === "/user")
      .map((r, key) => (
        <Route path={r.path} element={r.component} key={key} />
      ))}
  </Route>
            {/* <Route path="/" element={<AddJson />} /> */}
        <Route path="/add-correct-answer" element={<AddCorrectAnswerFromTxt />} />
        {/* <Route path="/exam-page" element={<ExamPage />} /> */}
      </Routes>
    </Router>

      
</>
  )
}

export default App
