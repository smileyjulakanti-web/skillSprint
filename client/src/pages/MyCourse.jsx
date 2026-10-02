import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api"; // generic api for the new enrollment route

function MyCourse() {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchCurrentCourse();
  }, []);

  const fetchCurrentCourse = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/enrollments/current");
      setEnrollment(response.data.enrollment);
    } catch (err) {
      if (err.response?.status === 404) {
        // No active course
        setEnrollment(null);
      } else {
        console.error("Failed to fetch active course:", err);
        setErrorMsg("Unable to load your current course.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropCourse = async () => {
    if (!window.confirm("Are you sure you want to drop this course? You will lose your active status.")) return;
    
    try {
      await api.patch(`/api/enrollments/${enrollment._id}/drop`);
      setEnrollment(null);
    } catch (err) {
      alert("Failed to drop course.");
    }
  };

  if (isLoading) {
    return (
      <div className="my-course-page container" style={{ padding: '2rem' }}>
        <div className="state-box glass-panel">
          <div className="spinner large" />
          <p>Loading your active course...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="my-course-page container" style={{ padding: '2rem' }}>
        <div className="state-box glass-panel error">
          <span>⚠️</span>
          <h2>{errorMsg}</h2>
          <button onClick={fetchCurrentCourse} className="btn btn-primary btn-sm">Retry</button>
        </div>
      </div>
    );
  }

  if (!enrollment || !enrollment.courseId) {
    return (
      <div className="my-course-page container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>No Active Course</h2>
          <p style={{ margin: '1rem 0' }}>You are not enrolled in a course yet. Choose a course and start learning.</p>
          <Link to="/courses" className="btn btn-primary">
            Explore Courses ⚡
          </Link>
        </div>
      </div>
    );
  }

  const c = enrollment.courseId;
  const completedCount = enrollment.completedLessons?.length || 0;
  const totalCount = c.totalLessons || c.lessons?.length || 10;
  const remainingCount = totalCount - completedCount;

  return (
    <div className="my-course-page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Active Course</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', border: '2px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <span className="badge badge-emerald">Active</span>
              <span className="badge badge-cyan">{c.category}</span>
            </div>
            <h2>{c.title}</h2>
            <p style={{ maxWidth: '600px', marginTop: '0.5rem' }}>{c.description}</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <button onClick={handleDropCourse} className="btn btn-secondary btn-sm">
              Drop Course
            </button>
          </div>
        </div>

        <div className="learning-progress-wrap" style={{ marginTop: '2rem', background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div className="progress-info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Course Progress</span>
            <span className="pct-val" style={{ fontWeight: 600, color: 'var(--primary)' }}>{enrollment.progress}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '12px', background: 'var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${enrollment.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-light))' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Completed:</span> <strong>{completedCount} lessons</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Remaining:</span> <strong>{remainingCount} lessons</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Current Lesson:</span> <strong>#{enrollment.lastAccessedLesson}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <Link to={`/courses/${c._id}/learn`} className="btn btn-primary btn-lg" style={{ padding: '12px 30px' }}>
            Continue Learning &rarr;
          </Link>
          
          {enrollment.progress >= 100 && !enrollment.completed && (
            <Link to={`/courses/${c._id}/quiz`} className="btn btn-secondary btn-lg">
              Take Final Quiz
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyCourse;
