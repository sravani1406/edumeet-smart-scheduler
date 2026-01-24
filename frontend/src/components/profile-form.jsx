import { useEffect, useMemo, useState } from "react";
import ImageUploader from "./image-uploader";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileForm({ role, token }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    subject: "",
    phoneNumber: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const isTeacher = role === "teacher";

  // Prefill from backend
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!token) return;
      try {
        // Use the auth profile endpoint which returns { success: true, user }
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn('Profile fetch returned non-ok status', res.status);
          return;
        }
        const data = await res.json();
        if (ignore) return;

        const user = data.user || {};

        setForm((f) => ({
          ...f,
          fullName: user.name || "",
          email: user.email || "",
          department: user.department || "",
          subject: user.subject || "",
          phoneNumber: user.phone || "",
          bio: user.bio || "",
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [token]);

  const passwordHint = useMemo(() => {
    if (!form.password) return "";
    return form.password.length >= 6 ? "Strong enough" : "Minimum 6 characters";
  }, [form.password]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: "" }));
    }
  }

  function validate() {
    const e = {};
    if (!form.fullName?.trim()) e.fullName = "Full name is required.";
    if (!EMAIL_REGEX.test(form.email || "")) e.email = "Valid email is required.";
    if (form.password && form.password.length < 6)
      e.password = "Password must be at least 6 characters.";

    if ((form.password || form.confirmPassword) && form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }

    if (isTeacher) {
      if (!form.department?.trim()) e.department = "Department is required.";
      if (!form.subject?.trim()) e.subject = "Subject is required.";
    }

    if (form.phoneNumber && !/^[0-9]{10}$/.test(form.phoneNumber)) {
      e.phoneNumber = "Phone number must be 10 digits.";
    }

    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // First, update profile fields via auth endpoint (JSON)
      const payload = {
        name: form.fullName,
        email: form.email,
        phone: form.phoneNumber || "",
      };

      if (isTeacher) {
        payload.department = form.department;
        payload.subject = form.subject;
        payload.bio = form.bio || "";
      }

      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save profile");
      }

      const data = await res.json();

      // If there's an avatar selected, upload it separately to the profile upload endpoint
      if (avatarFile) {
        const fd = new FormData();
        // backend expects field name 'profileImage'
        fd.append("profileImage", avatarFile);

        const imgRes = await fetch("http://localhost:5000/api/profile/upload-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        if (!imgRes.ok) {
          const idata = await imgRes.json().catch(() => ({}));
          throw new Error(idata.message || "Failed to upload image");
        }
      }

      setMessage({ type: "success", text: "Profile saved successfully!" });

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      // update stored user with returned data (PUT returns updated fields)
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...(data.user || {}) }));

      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="pf-card" onSubmit={onSubmit} noValidate>
      <header className="pf-header">
        <h1 className="pf-title">{isTeacher ? "Teacher Profile" : "Student Profile"}</h1>
        <p className="pf-subtitle">Manage your profile information</p>
      </header>

      {message.text && (
        <div className={`pf-message pf-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="pf-grid">
        <div className="pf-field">
          <label className="pf-label">Full Name *</label>
          <input
            className={`pf-input ${errors.fullName ? "pf-input-error" : ""}`}
            type="text"
            value={form.fullName}
            placeholder="Enter your full name"
            onChange={(e) => setField("fullName", e.target.value)}
          />
          {errors.fullName && <p className="pf-error">{errors.fullName}</p>}
        </div>

        <div className="pf-field">
          <label className="pf-label">Email Address *</label>
          <input
            className={`pf-input ${errors.email ? "pf-input-error" : ""}`}
            type="email"
            disabled
            value={form.email}
          />
        </div>

        <div className="pf-field">
          <label className="pf-label">New Password</label>
          <input
            className={`pf-input ${errors.password ? "pf-input-error" : ""}`}
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
          />
          {passwordHint && <div className="pf-hint">{passwordHint}</div>}
          {errors.password && <p className="pf-error">{errors.password}</p>}
        </div>

        <div className="pf-field">
          <label className="pf-label">Confirm Password</label>
          <input
            className={`pf-input ${errors.confirmPassword ? "pf-input-error" : ""}`}
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
          />
          {errors.confirmPassword && <p className="pf-error">{errors.confirmPassword}</p>}
        </div>

        {isTeacher && (
          <>
            <div className="pf-field">
              <label className="pf-label">Department *</label>
              <input
                className={`pf-input ${errors.department ? "pf-input-error" : ""}`}
                type="text"
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
              />
              {errors.department && <p className="pf-error">{errors.department}</p>}
            </div>

            <div className="pf-field">
              <label className="pf-label">Subject *</label>
              <input
                className={`pf-input ${errors.subject ? "pf-input-error" : ""}`}
                type="text"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
              />
              {errors.subject && <p className="pf-error">{errors.subject}</p>}
            </div>

            <div className="pf-field pf-field-full">
              <label className="pf-label">Bio</label>
              <textarea
                className="pf-input pf-textarea"
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                rows="4"
              />
            </div>
          </>
        )}

        <ImageUploader value="" onChange={setAvatarFile} />
      </div>

      <footer className="pf-actions">
        <button type="submit" className="pf-button" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </footer>
    </form>
  );
}
