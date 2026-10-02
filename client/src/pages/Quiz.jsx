import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Quiz() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/courses/${id}`);
      setCourse(data.course);
      
      const enrollRes = await api.get("/api/enrollments/current");
      if (enrollRes.data.enrollment?.courseId?._id === id || enrollRes.data.enrollment?.courseId === id) {
        setEnrollment(enrollRes.data.enrollment);
      } else {
        setErrorMsg("You are not actively enrolled in this course.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load quiz data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm("Are you ready to submit your final quiz?")) return;
    
    setIsSubmitting(true);
    try {
      await api.patch(`/api/enrollments/${enrollment._id}/complete`);
      alert("Congratulations! You have successfully completed the course!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div className="state-box glass-panel"><div className="spinner large" /><p>Loading Quiz...</p></div>
      </div>
    );
  }

  if (errorMsg || !course || !enrollment) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div className="state-box glass-panel error">
          <span>⚠️</span><h2>{errorMsg || "Unable to load quiz."}</h2>
          <Link to="/my-course" className="btn btn-primary btn-sm">Back to My Course</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Final Quiz: {course.title}</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Complete this final assessment to earn your certificate and unlock your next course.
      </p>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>1. What is the primary objective of this course?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
          <label><input type="radio" name="q1" onChange={() => setAnswers({...answers, q1: 'a'})} /> To master the fundamentals of {course.category}.</label>
          <label><input type="radio" name="q1" onChange={() => setAnswers({...answers, q1: 'b'})} /> To learn advanced machine learning.</label>
          <label><input type="radio" name="q1" onChange={() => setAnswers({...answers, q1: 'c'})} /> Just to get a certificate.</label>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>2. Are you ready to apply these skills in production?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
          <label><input type="radio" name="q2" onChange={() => setAnswers({...answers, q2: 'a'})} /> Yes, absolutely!</label>
          <label><input type="radio" name="q2" onChange={() => setAnswers({...answers, q2: 'b'})} /> I need more practice.</label>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSubmitQuiz} 
          disabled={isSubmitting || !answers.q1 || !answers.q2}
        >
          {isSubmitting ? "Submitting..." : "Submit & Complete Course 🎉"}
        </button>
      </div>
    </div>
  );
}

export default Quiz;
