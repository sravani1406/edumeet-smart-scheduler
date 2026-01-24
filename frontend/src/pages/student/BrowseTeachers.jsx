import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  GraduationCap,
  Search,
  Calendar,
  BookOpen,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [recommendedTeachers, setRecommendedTeachers] = useState([]);
  const [recommendationSource, setRecommendationSource] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH ALL TEACHERS =================
  useEffect(() => {
    fetchTeachers();
  }, []);

  // ================= FILTER TEACHERS =================
  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  // ================= FETCH RECOMMENDATIONS =================
  useEffect(() => {
    if (selectedSubject) {
      fetchRecommendedTeachers(selectedSubject);
    } else {
      setRecommendedTeachers([]);
      setRecommendationSource("");
    }
  }, [selectedSubject]);

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/student/teachers");
      setTeachers(response.data);
      setFilteredTeachers(response.data);
    } catch (error) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedTeachers = async (subject) => {
    try {
      const res = await api.get(
        `/student/recommend-teachers?subject=${subject}`
      );

      setRecommendedTeachers(res.data.recommendedTeachers || []);
      setRecommendationSource(res.data.source || "");
    } catch (error) {
      console.error("Recommendation error", error);
      setRecommendedTeachers([]);
      setRecommendationSource("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Browse Teachers
        </h2>
        <p className="text-gray-600 mt-1">
          Find and book appointments with available teachers
        </p>
      </div>

      {/* ================= SUBJECT SELECTION ================= */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Get Teacher Recommendations By Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input-field"
        >
          <option value="">Select Subject</option>
          <option value="DBMS">DBMS</option>
          <option value="Big Data Analytics">Big Data Analytics</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="Flutter">Flutter</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Java">Java</option>
          <option value="Compiler Design">Compiler Design</option>
          <option value="Data Visualization">Data Visualization</option>
          <option value="Computer Networks">Computer Networks</option>
          <option value="Cryptography">Cryptography</option>
          <option value="Block Chain">Block Chain</option>
          <option value="Data Structures">Data Structures</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="English">English</option>
          <option value="SoftSkills">SoftSkills</option>
          <option value="MPMC">MPMC</option>
          <option value="EDC">EDC</option>
          <option value="BEEE">BEEE</option>
        </select>
      </div>

      {/* ================= RECOMMENDED TEACHERS ================= */}
      {recommendedTeachers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-1">
            Recommended Teachers
          </h2>

          {/* ✅ Recommendation source indicator */}
          {recommendationSource && (
            <p className="text-sm text-gray-500 mb-4">
              Recommendation type:{" "}
              <strong className="capitalize">
                {recommendationSource}
              </strong>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-bold text-gray-900">
                  {teacher.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {teacher.subject || "Subject not specified"}
                </p>

                {teacher.confidence && (
                  <p className="text-sm text-green-600 mt-1">
                    Confidence: {teacher.confidence.toFixed(1)}%
                  </p>
                )}

                <Link
                  to={`/student/book/${teacher._id}`}
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  Book Appointment →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      <div className="card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, subject or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* ================= ALL TEACHERS ================= */}
      {filteredTeachers.length === 0 ? (
        <div className="card text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No teachers found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search keywords
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {teacher.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                  <strong>Subject:</strong>&nbsp;
                  {teacher.subject || "Not specified"}
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <Layers className="h-4 w-4 mr-2 text-gray-500" />
                  <strong>Department:</strong>&nbsp;
                  {teacher.department || "Not specified"}
                </div>
              </div>

              <Link
                to={`/student/book/${teacher._id}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseTeachers;
