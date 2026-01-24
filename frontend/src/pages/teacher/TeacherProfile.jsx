
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import toast from "react-hot-toast"

export default function TeacherProfile() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile")
        setProfile(res.data.teacher || res.data.data || res.data)
      } catch (error) {
        console.error("Fetch profile error:", error)
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("profileImage", file)

    try {
      setUploading(true)
      const res = await api.post("/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Profile photo updated!")
      setProfile((prev) => ({
        ...prev,
        profileImage: res.data.profileImage,
      }))

      
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (!oldPassword || !newPassword) {
      toast.error("All fields are required")
      return
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    try {
      setChangingPassword(true)
      await api.put("/profile/change-password", {
        oldPassword,
        newPassword,
      })

      toast.success("Password updated successfully!")
      setOldPassword("")
      setNewPassword("")
    } catch (error) {
      console.error("Password change error:", error)
      toast.error(error.response?.data?.message || "Password update failed")
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load profile data</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Profile Photo
        </h2>
        <div className="flex items-center space-x-6">
          <img
            src={
              profile.profileImage
                ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${profile.profileImage}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-100 object-cover"
          />
          <div>
            <label className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition duration-200 inline-block">
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG or GIF (Max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Profile Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profile.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profile.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone Number
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profile.phone || "Not provided"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Department
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profile.department || "Not provided"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Subject
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profile.subject || "Not provided"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Role
            </label>
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Teacher
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-6 italic">
          * Profile details are fixed and cannot be edited
        </p>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Change Password
        </h2>
        <form
          onSubmit={handlePasswordChange}
          className="space-y-6 max-w-md"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password (min 6 characters)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}


