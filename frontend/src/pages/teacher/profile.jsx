import { useState, useEffect } from "react";
import ProfileForm from "../../components/profile-form";
import "../../styles/profile.css";

export default function TeacherProfilePage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    // Safely access localStorage after component mounts
    const storedToken = localStorage.getItem('token');
    setToken(storedToken || "");
  }, []);

  if (!token) {
    return (
      <main className="pf-wrap" role="main">
        <div className="pf-card">
          <p>Please log in to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pf-wrap" role="main">
      <ProfileForm role="teacher" token={token} />
    </main>
  );
}