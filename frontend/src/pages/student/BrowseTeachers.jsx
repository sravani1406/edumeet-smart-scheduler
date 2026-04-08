import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  GraduationCap,
  Search,
  Calendar,
  BookOpen,
  Layers,
  Star,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [recommendedTeachers, setRecommendedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredTeacher, setHoveredTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await api.get("/teacher/recommended");
        setRecommendedTeachers(res.data || []);
      } catch (error) {
        console.error("Error fetching recommended teachers", error);
        setRecommendedTeachers([]);
      }
    };

    fetchRecommended();
  }, []);

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

  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            rounded >= i
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Browse Teachers
        </h2>
        <p className="text-gray-600 mt-2">
          Find and book appointments with available teachers
        </p>
      </div>

      {/* ================= RECOMMENDED TEACHERS ================= */}
      {recommendedTeachers.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-blue-600 fill-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended For You
            </h2>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl -z-10 opacity-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-blue-50 via-white to-white rounded-2xl border border-blue-100">
              {recommendedTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                  onMouseEnter={() => setHoveredTeacher(teacher._id)}
                  onMouseLeave={() => setHoveredTeacher(null)}
                >
                  <div className="absolute inset-0 bg-white border-2 border-blue-200 group-hover:border-blue-400 group-hover:shadow-2xl transition-all duration-300 rounded-xl" />

                  <div className="relative p-6 space-y-5">
                    <div className="flex justify-between items-start">
                      <div />
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 group-hover:bg-blue-700 transition-colors">
                        <Star className="h-3 w-3 fill-white" />
                        Recommended
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 flex-shrink-0 group-hover:shadow-lg transition-shadow duration-300">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {teacher.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {teacher.subject || "Subject not specified"}
                          </p>
                        </div>
                      </div>

                      {teacher.totalRatings > 0 ? (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            {renderStars(teacher.averageRating)}
                            <span className="text-sm font-semibold text-gray-800">
                              {teacher.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({teacher.totalRatings})
                            </span>
                          </div>

                          <div className="text-xs text-gray-600 space-y-1">
                            <div>⭐⭐⭐⭐⭐ {teacher.ratingBreakdown?.five || 0}</div>
                            <div>⭐⭐⭐⭐ {teacher.ratingBreakdown?.four || 0}</div>
                            <div>⭐⭐⭐ {teacher.ratingBreakdown?.three || 0}</div>
                            <div>⭐⭐ {teacher.ratingBreakdown?.two || 0}</div>
                            <div>⭐ {teacher.ratingBreakdown?.one || 0}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">
                          No ratings yet
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 py-3 border-y border-gray-100">
                      <div className="flex items-center text-sm">
                        <BookOpen className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="text-gray-700">
                          <strong className="text-gray-900">Subject:</strong>{" "}
                          {teacher.subject || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Layers className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="text-gray-700">
                          <strong className="text-gray-900">Dept:</strong>{" "}
                          {teacher.department || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/student/book/${teacher._id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg active:scale-95"
                    >
                      Book Now
                      <ArrowRight
                        className={`h-4 w-4 transition-transform duration-300 ${
                          hoveredTeacher === teacher._id
                            ? "translate-x-1"
                            : ""
                        }`}
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      <div className="sticky top-0 z-20 bg-white py-4 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, subject or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-md transition-all duration-300 text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      {/* ================= ALL TEACHERS ================= */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white border-2 border-gray-100 rounded-lg text-center py-16">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No teachers found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search keywords
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Teachers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center mb-5">
                  <div className="bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors duration-300">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {teacher.email}
                    </p>

                    {/* ⭐ ADDED RATING DISPLAY */}
                    {teacher.totalRatings > 0 ? (
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(teacher.averageRating)}
                        <span className="text-sm font-semibold text-gray-800">
                          {teacher.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({teacher.totalRatings})
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        No ratings yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center text-sm text-gray-700">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <strong className="text-gray-900">Subject:</strong>
                    <span className="ml-2 text-gray-600 truncate">
                      {teacher.subject || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <Layers className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <strong className="text-gray-900">Department:</strong>
                    <span className="ml-2 text-gray-600 truncate">
                      {teacher.department || "Not specified"}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/student/book/${teacher._id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-md active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseTeachers;