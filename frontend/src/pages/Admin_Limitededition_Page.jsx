import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, KeyRound, Loader2, ShieldCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

const sectionNames = {
  hero: "Hero Section",
  quote: "Quote Section",
  featured: "Featured Premier Drop",
  secondary_vaults: "Secondary Private Vaults",
  guarantees: "Atelier Showroom Guarantees"
};

export default function Admin_Limitededition_Page() {
  const navigate = useNavigate();

  // Admin Login Prompt States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    is_active: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  // ---------------------------------------------------------
  // ADMIN AUTHENTICATION GUARD (ID 10 Check)
  // ---------------------------------------------------------
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("weftin_admin_auth");
    const storedUser = JSON.parse(localStorage.getItem("weftin_user") || "null");

    if (sessionAuth === "true" && storedUser?.id === 10) {
      setIsAdminAuthenticated(true);
      loadData();
    } else {
      setCheckingAuth(false);
      setLoading(false);
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      showToast("Please enter both admin email and password.");
      return;
    }

    setAuthenticating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmailInput.trim().toLowerCase(),
          password: adminPasswordInput
        })
      });

      const data = await response.json();

      if (response.ok && data?.user) {
        const userId = Number(data.user.id || data.user.user_id);
        const userEmail = String(data.user.email || "").trim().toLowerCase();

        if (userId === 10 && userEmail === "weftin.admin891@gmail.com") {
          sessionStorage.setItem("weftin_admin_auth", "true");
          if (data.access_token) {
            localStorage.setItem("weftin_token", data.access_token);
          }
          localStorage.setItem("weftin_user", JSON.stringify(data.user));
          setIsAdminAuthenticated(true);
          showToast("Admin session unlocked successfully (ID: 10).");
          loadData();
        } else {
          showToast("Access denied. Account does not match authorized admin ID (10).");
        }
      } else {
        showToast(data.detail || "Invalid admin credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      showToast("Backend connection error during authentication.");
    } finally {
      setAuthenticating(false);
    }
  };

  // =========================================================
  // LOAD
  // =========================================================
  const loadData = async () => {
    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to load"
        );
      }

      setSections(data.sections || []);
      setSettings(
        data.settings || {
          days: 0,
          hours: 0,
          minutes: 0,
          is_active: true
        }
      );

    } catch (error) {
      console.error(error);
      showToast("Failed to load Limited Edition");
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  // =========================================================
  // CHANGE SECTION
  // =========================================================
  const changeSection = (sectionKey, field, value) => {
    setSections(
      previous =>
        previous.map(
          section =>
            section.section_key === sectionKey
              ? {
                  ...section,
                  [field]: value
                }
              : section
        )
    );
  };

  // =========================================================
  // CHANGE ITEM
  // =========================================================
  const changeItem = (sectionKey, itemId, field, value) => {
    setSections(
      previous =>
        previous.map(
          section => {
            if (section.section_key !== sectionKey) {
              return section;
            }

            return {
              ...section,
              items: section.items.map(
                item =>
                  item.id === itemId
                    ? {
                        ...item,
                        [field]: value
                      }
                    : item
              )
            };
          }
        )
    );
  };

  // =========================================================
  // SAVE SECTION
  // =========================================================
  const saveSection = async (section) => {
    const token = localStorage.getItem("weftin_token");

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/section/${section.section_key}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(section)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save");
      }

      showToast("Section saved successfully");

    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SAVE ITEM
  // =========================================================
  const saveItem = async (item) => {
    const token = localStorage.getItem("weftin_token");

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/item/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(item)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save item");
      }

      showToast("Item saved successfully");

    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ADD ITEM
  // =========================================================
  const addItem = async (sectionKey) => {
    const token = localStorage.getItem("weftin_token");

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            section_key: sectionKey,
            title: "New Limited Edition Item",
            description: "",
            price: "",
            image_url: "",
            button_text: "Request Access",
            button_link: "#",
            product_id: null,
            icon_name: "ShieldCheck",
            is_active: true,
            display_order: 99
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add item");
      }

      showToast("New item added");
      await loadData();

    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE ITEM
  // =========================================================
  const deleteItem = async (id) => {
    if (!window.confirm("Delete this Limited Edition item?")) {
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/item/${id}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete");
      }

      showToast("Item deleted");
      await loadData();

    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SAVE COUNTDOWN
  // =========================================================
  const saveSettings = async () => {
    const token = localStorage.getItem("weftin_token");

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(settings)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save countdown");
      }

      showToast("Countdown saved successfully");

    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-amber-700 animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest text-gray-500">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ADMIN CREDENTIAL GATE MODAL (IF NOT AUTHENTICATED)
  // ---------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex items-center justify-center p-6 relative">
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {toast}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 max-w-md w-full">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-2xl font-light text-center text-gray-900 mb-1">Limited Edition Security</h2>
          <p className="text-xs text-gray-500 text-center mb-8 leading-relaxed">
            Please enter admin credentials (ID: 10) to access Limited Edition Management.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-5 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">ADMIN EMAIL *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="weftin.admin891@gmail.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-200 pl-10 pr-4 py-3 rounded text-gray-800 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">ADMIN PASSWORD *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-200 pl-10 pr-4 py-3 rounded text-gray-800 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              {authenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Admin (ID 10)...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Unlock Vault Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Return to Member Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN ADMIN INTERFACE
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10 relative">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-black text-white px-5 py-3 rounded-lg shadow-xl text-sm">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <Link
              to="/shop"
              className="text-xs uppercase tracking-wider text-gray-600 flex items-center gap-1 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop / Admin Hub
            </Link>

            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold">
                Limited Edition Management (Admin ID: 10)
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage the complete Limited Edition Vault page.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem("weftin_admin_auth");
              setIsAdminAuthenticated(false);
              showToast("Logged out of admin session.");
            }}
            className="text-xs text-rose-700 font-semibold uppercase tracking-wider border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2 rounded-lg cursor-pointer"
          >
            Lock Admin Session
          </button>
        </div>

        {/* COUNTDOWN */}
        <div className="bg-[#1C1816] text-white rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h2 className="font-serif text-xl">
                Vault Countdown
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Control the countdown displayed on the customer page.
              </p>
            </div>

            <button
              disabled={saving}
              onClick={saveSettings}
              className="bg-amber-600 hover:bg-amber-500 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest cursor-pointer"
            >
              Save Countdown
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
            <DarkField
              label="Days"
              type="number"
              value={settings.days}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  days: Number(value)
                })
              }
            />

            <DarkField
              label="Hours"
              type="number"
              value={settings.hours}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  hours: Number(value)
                })
              }
            />

            <DarkField
              label="Minutes"
              type="number"
              value={settings.minutes}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  minutes: Number(value)
                })
              }
            />
          </div>
        </div>

        {/* SECTIONS */}
        <div className="space-y-8">
          {sections.map(
            section => (
              <div
                key={section.section_key}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* SECTION HEADER */}
                <div className="bg-[#F3EDE2] px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl">
                      {
                        sectionNames[
                          section.section_key
                        ] ||
                        section.section_key
                      }
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {section.section_key}
                    </p>
                  </div>

                  <button
                    disabled={saving}
                    onClick={() =>
                      saveSection(
                        section
                      )
                    }
                    className="bg-black text-white px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Save Section
                  </button>
                </div>

                {/* SECTION FIELDS */}
                <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Field
                    label="Eyebrow"
                    value={
                      section.eyebrow ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "eyebrow",
                        value
                      )
                    }
                  />

                  <Field
                    label="Title"
                    value={
                      section.title ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "title",
                        value
                      )
                    }
                  />

                  <Field
                    label="Image URL"
                    value={
                      section.image_url ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "image_url",
                        value
                      )
                    }
                  />

                  <Field
                    label="Button Text"
                    value={
                      section.button_text ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "button_text",
                        value
                      )
                    }
                  />

                  <Field
                    label="Button Link"
                    value={
                      section.button_link ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "button_link",
                        value
                      )
                    }
                  />

                  <Field
                    label="Display Order"
                    type="number"
                    value={
                      section.display_order ||
                      0
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "display_order",
                        Number(value)
                      )
                    }
                  />

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={
                        section.description ||
                        ""
                      }
                      onChange={e =>
                        changeSection(
                          section.section_key,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        section.is_active
                      }
                      onChange={e =>
                        changeSection(
                          section.section_key,
                          "is_active",
                          e.target.checked
                        )
                      }
                    />
                    Section Active
                  </label>
                </div>

                {/* ITEMS */}
                {section.section_key !==
                  "hero" &&
                  section.section_key !==
                    "quote" && (

                  <div className="border-t border-gray-200 p-5 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Content Items
                        </h3>
                        <p className="text-xs text-gray-500">
                          Manage everything displayed inside this section.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          addItem(
                            section.section_key
                          )
                        }
                        className="px-4 py-2 bg-amber-700 text-white rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(section.items || []).map(
                        (item, index) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-xl p-5 bg-gray-50"
                          >
                            <div className="flex justify-between items-center mb-5">
                              <h4 className="font-semibold">
                                Item #{index + 1}
                              </h4>

                              <button
                                onClick={() =>
                                  deleteItem(
                                    item.id
                                  )
                                }
                                className="text-red-600 text-xs cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                              <Field
                                label="Title / Name"
                                value={
                                  item.title ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "title",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Price"
                                value={
                                  item.price ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "price",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Image URL"
                                value={
                                  item.image_url ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "image_url",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Button Text"
                                value={
                                  item.button_text ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "button_text",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Button Link"
                                value={
                                  item.button_link ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "button_link",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Product ID"
                                type="number"
                                value={
                                  item.product_id ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "product_id",
                                    value
                                      ? Number(value)
                                      : null
                                  )
                                }
                              />

                              <Field
                                label="Display Order"
                                type="number"
                                value={
                                  item.display_order ||
                                  0
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "display_order",
                                    Number(value)
                                  )
                                }
                              />

                              {section.section_key ===
                                "guarantees" && (
                                <Field
                                  label="Icon Name"
                                  value={
                                    item.icon_name ||
                                    "ShieldCheck"
                                  }
                                  onChange={value =>
                                    changeItem(
                                      section.section_key,
                                      item.id,
                                      "icon_name",
                                      value
                                    )
                                  }
                                />
                              )}

                              <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                                  Description
                                </label>
                                <textarea
                                  rows={3}
                                  value={
                                    item.description ||
                                    ""
                                  }
                                  onChange={e =>
                                    changeItem(
                                      section.section_key,
                                      item.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white outline-none focus:border-black"
                                />
                              </div>

                              <label className="flex items-center gap-3 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    item.is_active
                                  }
                                  onChange={e =>
                                    changeItem(
                                      section.section_key,
                                      item.id,
                                      "is_active",
                                      e.target.checked
                                    )
                                  }
                                />
                                Item Active
                              </label>
                            </div>

                            {/* IMAGE PREVIEW */}
                            {item.image_url && (
                              <div className="mt-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                  Image Preview
                                </p>
                                <img
                                  src={
                                    item.image_url
                                  }
                                  alt=""
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}

                            <div className="mt-5 flex justify-end">
                              <button
                                disabled={saving}
                                onClick={() =>
                                  saveItem(
                                    item
                                  )
                                }
                                className="bg-black text-white px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                              >
                                Save Item
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>

      </div>

    </div>
  );
}

// =========================================================
// FIELD
// =========================================================
function Field({
  label,
  value,
  onChange,
  type = "text"
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white outline-none focus:border-black"
      />
    </div>
  );
}

// =========================================================
// DARK FIELD
// =========================================================
function DarkField({
  label,
  value,
  onChange,
  type = "text"
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-500"
      />
    </div>
  );
}
