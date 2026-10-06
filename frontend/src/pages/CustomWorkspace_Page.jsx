import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  Heart,
  MapPin,
  User,
  Bell,
  Headphones,
  LogOut,
  ArrowLeft,
  Check,
  Send,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function CustomWorkspace_Page() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  // --------------------------------------------------
  // USER
  // --------------------------------------------------

  const [savedUser, setSavedUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("weftin_user"));
      setSavedUser(user);
      if (user?.email) {
        loadUnreadCount(user.email);
      }
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      setSavedUser(null);
    }
  }, []);

  const userEmail = savedUser?.email || "";
  const userName =
    savedUser?.name ||
    savedUser?.full_name ||
    savedUser?.username ||
    "WEFTIN Member";

  const loadUnreadCount = async (email) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(email)}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(Number(data?.count || 0));
    } catch (error) {
      console.error("Unread count error:", error);
    }
  };

  // --------------------------------------------------
  // CUSTOM DESIGN REQUEST & MEASUREMENTS
  // --------------------------------------------------

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [userMeasurements, setUserMeasurements] = useState([]);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState("");

  // --------------------------------------------------
  // TOAST
  // --------------------------------------------------

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // --------------------------------------------------
  // FETCH CUSTOM DESIGN & MEASUREMENTS WITH JWT TOKEN
  // --------------------------------------------------

  const loadRequestAndMeasurements = async () => {
    if (!id) {
      setErrorMessage("No custom design request ID was provided.");
      setLoading(false);
      return;
    }

    if (!userEmail) {
      setErrorMessage("Please sign in to view this custom design.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);
      setErrorMessage("");

      const [designsRes, measurementsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/custom-designs/${encodeURIComponent(userEmail)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }),
        fetch(`${API_BASE_URL}/api/measurements/${encodeURIComponent(userEmail)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        })
      ]);

      const data = await designsRes.json();

      if (!designsRes.ok) {
        throw new Error(
          data?.detail || "Failed to load custom design requests."
        );
      }

      const requestId = Number(id);

      const foundRequest = data.find(
        (request) => Number(request.id) === requestId
      );

      if (!foundRequest) {
        setRequestData(null);
        setErrorMessage(
          "This custom design request was not found or does not belong to your account."
        );
        return;
      }

      setRequestData(foundRequest);

      if (measurementsRes.ok) {
        const measurementsData = await measurementsRes.json();
        if (Array.isArray(measurementsData)) {
          setUserMeasurements(measurementsData);
          const defaultProf = measurementsData.find((m) => m.is_default);
          if (defaultProf) {
            setSelectedMeasurementId(String(defaultProf.id));
          } else if (measurementsData.length > 0) {
            setSelectedMeasurementId(String(measurementsData[0].id));
          }
        }
      }
    } catch (error) {
      console.error("Error loading custom workspace:", error);

      setRequestData(null);

      setErrorMessage(
        error.message || "Unable to load this custom design."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      loadRequestAndMeasurements();
    }
  }, [id, userEmail]);

  // --------------------------------------------------
  // PIPELINE
  // --------------------------------------------------

  const pipelineStages = [
    "Submitted",
    "Review",
    "Quotation",
    "Approved",
    "Production",
    "Delivered"
  ];

  const getInitialStepIndex = (status) => {
    const s = String(status || "").toLowerCase();

    if (s.includes("deliver")) return 5;
    if (
      s.includes("production") ||
      s.includes("product") ||
      s.includes("embroidery")
    ) {
      return 4;
    }

    if (
      s.includes("approv") ||
      s.includes("paid")
    ) {
      return 3;
    }

    if (
      s.includes("quotation") ||
      s.includes("quote")
    ) {
      return 2;
    }

    if (
      s.includes("review") ||
      s.includes("drafting") ||
      s.includes("blueprint")
    ) {
      return 1;
    }

    return 0;
  };

  const currentStep = requestData
    ? getInitialStepIndex(requestData.status)
    : 0;

  const isPaid = currentStep >= 3;

  // --------------------------------------------------
  // REFERENCE PHOTOS
  // --------------------------------------------------

  const [referencePhotos, setReferencePhotos] = useState([]);

  useEffect(() => {
    if (!requestData) return;

    if (requestData.product_image) {
      setReferencePhotos([
        {
          id: "primary",
          url: requestData.product_image,
          label: "Primary Ref",
          isPrimary: true
        }
      ]);
    } else {
      setReferencePhotos([]);
    }
  }, [requestData]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    const newRef = {
      id: `local-${Date.now()}`,
      url: imageUrl,
      label: `Ref ${referencePhotos.length + 1}`,
      isPrimary: false
    };

    setReferencePhotos((previous) => [
      ...previous,
      newRef
    ]);

    showToast("Reference photo uploaded successfully!");

    e.target.value = "";
  };

  const removePhoto = (photoId) => {
    const photo = referencePhotos.find(
      (item) => item.id === photoId
    );

    if (photo?.isPrimary) {
      showToast("The primary product reference cannot be removed.");
      return;
    }

    setReferencePhotos((previous) =>
      previous.filter((item) => item.id !== photoId)
    );

    showToast("Reference photo removed.");
  };

  // --------------------------------------------------
  // CHAT
  // --------------------------------------------------

  const [chatMessage, setChatMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "Atelier Expert",
      time: "Initial Review",
      text:
        "Namaste. Our atelier has received your bespoke design request. Our master designer will review the specifications and references."
    },
    {
      sender: "Atelier Expert",
      time: "Atelier",
      text:
        "You can use this workspace to review your design progress, quotation, and select your fit measurements."
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!chatMessage.trim()) return;

    setMessages((previous) => [
      ...previous,
      {
        sender: userName,
        time: "Just now",
        text: chatMessage.trim()
      }
    ]);

    setChatMessage("");

    showToast("Message sent to Master Tailor");
  };

  // --------------------------------------------------
  // APPROVE / PAY
  // --------------------------------------------------

  const [isLocallyPaid, setIsLocallyPaid] = useState(false);

  const handleApproveAndPay = () => {
    setIsLocallyPaid(true);

    setMessages((previous) => [
      ...previous,
      {
        sender: "System",
        time: "Just now",
        text: `Quotation of ${formatPrice(
          requestData?.product_price
        )} marked as approved for this workspace.`
      }
    ]);

    showToast(
      "Quotation approved successfully."
    );
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Quotation Pending";
    }

    const numericPrice = Number(
      String(price).replace(/[₹,\s]/g, "")
    );

    if (!Number.isNaN(numericPrice)) {
      return `₹${numericPrice.toLocaleString("en-IN")}`;
    }

    const priceString = String(price);

    if (priceString.includes("₹")) {
      return priceString;
    }

    return `₹${priceString}`;
  };

  const getStatusLabel = (status) => {
    if (!status) return "Submitted";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusDescription = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized.includes("deliver")) {
      return "Your bespoke piece has completed production and is ready for delivery.";
    }

    if (
      normalized.includes("production") ||
      normalized.includes("product")
    ) {
      return "Your design has entered the atelier production stage.";
    }

    if (
      normalized.includes("approv") ||
      normalized.includes("paid")
    ) {
      return "Your quotation has been approved and the atelier can proceed with production preparation.";
    }

    if (
      normalized.includes("quotation") ||
      normalized.includes("quote")
    ) {
      return "Your atelier quotation is ready for review.";
    }

    if (
      normalized.includes("review") ||
      normalized.includes("drafting") ||
      normalized.includes("blueprint")
    ) {
      return "Our atelier team is reviewing your design specifications and references.";
    }

    return "Your bespoke request has been received by the WEFTIN atelier.";
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full border-2 border-gray-200 border-t-amber-700 animate-spin"></div>

          <p className="font-serif text-lg text-gray-900">
            Opening Atelier Workspace
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Retrieving your bespoke design...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR SCREEN
  // --------------------------------------------------

  if (errorMessage || !requestData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h1 className="font-serif text-2xl text-gray-900">
            Workspace Unavailable
          </h1>

          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {errorMessage ||
              "We could not find this custom design request."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <button
              onClick={loadRequestAndMeasurements}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-gray-800 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={() => navigate("/custom-designs")}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold hover:border-black cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Custom Designs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">

      {/* --------------------------------------------------
          TOAST
      -------------------------------------------------- */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* --------------------------------------------------
          LEFT SIDEBAR
      -------------------------------------------------- */}

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">

        <div>

          {/* BRAND */}

          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">
                W
              </div>

              <div>
                <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                  WEFTIN
                </h1>

                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 block">
                  ATELIER TAILORS
                </span>
              </div>
            </Link>
          </div>

          {/* USER CARD */}

          <div className="m-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">
                {userName}
              </h4>

              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-800">
                ATELIER MEMBER
              </span>
            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-600">

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>

            <Link
              to="/custom-designs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
            >
              <Scissors className="w-4 h-4" />
              Custom Designs
            </Link>

            <Link
              to="/measurements"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Ruler className="w-4 h-4" />
              Measurements
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>

            <Link
              to="/addresses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <MapPin className="w-4 h-4" />
              Addresses
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            <Link
              to="/notifications"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 justify-between"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/support"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Headphones className="w-4 h-4" />
              Support
            </Link>

          </nav>
        </div>

        {/* LOGOUT */}

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem("weftin_user");
              localStorage.removeItem("weftin_token");
            }}
            className="flex items-center gap-3 px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Link>
        </div>

      </aside>

      {/* --------------------------------------------------
          MAIN CONTENT
      -------------------------------------------------- */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}

        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">

          <div className="text-xs text-gray-400">

            Portfolio

            <span className="mx-2">
              &gt;
            </span>

            <Link
              to="/custom-designs"
              className="hover:underline"
            >
              CUSTOM DESIGNS
            </Link>

            <span className="mx-2">
              &gt;
            </span>

            <span className="text-gray-900 font-semibold font-mono">
              CD-{String(requestData.id).padStart(4, "0")}
            </span>

          </div>

          <div className="flex items-center gap-4">

            <Link
              to="/notifications"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">

              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border">
                {userName.charAt(0).toUpperCase()}
              </div>

              <span className="text-xs font-semibold text-gray-800">
                {userName}
              </span>

            </div>

          </div>

        </header>

        {/* --------------------------------------------------
            PAGE BODY
        -------------------------------------------------- */}

        <main className="p-8 lg:p-12 max-w-7xl w-full grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

          {/* ==================================================
              LEFT 2 COLUMNS
          ================================================== */}

          <div className="xl:col-span-2 space-y-6">

            <Link
              to="/custom-designs"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-semibold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Custom List
            </Link>

            {/* DESIGN CARD */}

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">

              {/* TITLE */}

              <div className="flex justify-between items-start mb-2 gap-4">

                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  DESIGN SPECIFICATION • CD-
                  {String(requestData.id).padStart(4, "0")}
                </span>

                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-[10px] uppercase font-bold tracking-wider rounded-full border border-amber-300 whitespace-nowrap">
                  {getStatusLabel(requestData.status)}
                </span>

              </div>

              <h2 className="text-3xl font-serif font-light text-gray-900 mb-2">
                {requestData.product_name}
              </h2>

              <p className="text-xs text-gray-500">
                Submitted:{" "}
                <strong className="text-gray-800">
                  {formatDate(requestData.created_at)}
                </strong>

                {requestData.product_category && (
                  <>
                    {" "}
                    • Category:{" "}
                    <strong className="text-gray-800">
                      {requestData.product_category}
                    </strong>
                  </>
                )}
              </p>

              {/* STATUS DESCRIPTION */}

              <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex gap-3">

                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-900">
                      Atelier Status
                    </p>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {getStatusDescription(requestData.status)}
                    </p>
                  </div>

                </div>
              </div>

              {/* ==================================================
                  SAVED MEASUREMENTS MAPPING / SELECTOR
              ================================================== */}

              <div className="mt-8 pt-6 border-t border-gray-100">

                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-700" /> Linked Fit Measurements
                  </span>

                  <Link
                    to="/measurements"
                    className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold hover:underline"
                  >
                    Manage Profiles +
                  </Link>
                </div>

                {userMeasurements.length === 0 ? (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg flex items-center justify-between text-xs">
                    <p className="text-amber-900">No measurement profiles saved yet. Add your fit specs for the tailor.</p>
                    <button
                      onClick={() => navigate("/measurements")}
                      className="bg-black text-white px-4 py-2 rounded text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Add Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={selectedMeasurementId}
                      onChange={(e) => {
                        setSelectedMeasurementId(e.target.value);
                        showToast("Measurement profile linked to this workspace!");
                      }}
                      className="w-full bg-gray-50 border border-gray-300 text-xs px-4 py-3 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-black cursor-pointer"
                    >
                      {userMeasurements.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name} ({prof.usage || "Standard Fit"}) {prof.is_default ? " — [Default Profile]" : ""}
                        </option>
                      ))}
                    </select>

                    {/* Preview details of the currently selected profile */}
                    {selectedMeasurementId && (() => {
                      const activeProf = userMeasurements.find((m) => String(m.id) === String(selectedMeasurementId));
                      if (!activeProf) return null;
                      return (
                        <div className="p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-lg text-[11px] text-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div><span className="text-gray-400 block text-[9px]">HEIGHT</span>{activeProf.height || "—"}</div>
                          <div><span className="text-gray-400 block text-[9px]">BUST / CHEST</span>{activeProf.bust || "—"}</div>
                          <div><span className="text-gray-400 block text-[9px]">WAIST</span>{activeProf.waist || "—"}</div>
                          <div><span className="text-gray-400 block text-[9px]">SHOULDER</span>{activeProf.shoulder || "—"}</div>
                        </div>
                      );
                    })()}
                  </div>
                )}

              </div>

              {/* ==================================================
                  CRAFTING PIPELINE
              ================================================== */}

              <div className="mt-8 pt-6 border-t border-gray-100">

                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 block mb-4">
                  INTERACTIVE CRAFTING PIPELINE
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">

                  {pipelineStages.map((stage, idx) => {

                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={stage}
                        title={
                          isCurrent
                            ? "Current atelier stage"
                            : isCompleted
                            ? "Completed stage"
                            : "Upcoming stage"
                        }
                        className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${
                          isCompleted
                            ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold shadow-sm"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >

                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span>—</span>
                        )}

                        <span className="text-[10px] uppercase">
                          {stage}
                        </span>

                      </div>
                    );
                  })}

                </div>

                <p className="text-[10px] text-gray-400 mt-3">
                  Pipeline status is managed by the WEFTIN atelier team.
                </p>

              </div>

              {/* ==================================================
                  REFERENCE PHOTOS
              ================================================== */}

              <div className="mt-8 pt-6 border-t border-gray-100">

                <div className="flex justify-between items-center mb-4">

                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900">
                    LINKED SKETCHES & REFERENCE PHOTOS
                  </span>

                  <span className="text-[10px] text-gray-500">
                    ({referencePhotos.length} Attached)
                  </span>

                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                  {referencePhotos.map((photo) => (

                    <div
                      key={photo.id}
                      className="relative h-44 rounded-lg bg-gray-100 border p-2 flex flex-col justify-between group"
                    >

                      <span className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded">
                        {photo.label}
                      </span>

                      {!photo.isPrimary && (
                        <button
                          onClick={() =>
                            removePhoto(photo.id)
                          }
                          className="absolute top-3 right-3 z-10 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <img
                        src={photo.url}
                        alt="Custom design reference"
                        className="w-full h-full object-cover rounded"
                      />

                    </div>

                  ))}

                  {/* FILE INPUT */}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* UPLOAD */}

                  <div
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="h-44 rounded-lg border-2 border-dashed border-gray-300 hover:border-black flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 text-gray-500 transition-all"
                  >

                    <Upload className="w-5 h-5 text-amber-700" />

                    <span className="text-[10px] uppercase tracking-wider font-semibold text-center px-4">
                      Upload Reference Photo
                    </span>

                  </div>

                </div>

                <p className="text-[10px] text-gray-400 mt-3">
                  Uploaded reference images are currently attached to this
                  workspace session. Permanent cloud storage can be connected
                  next.
                </p>

              </div>

              {/* ==================================================
                  TAILOR NOTES
              ================================================== */}

              <div className="mt-8 pt-6 border-t border-gray-100">

                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 block mb-2">
                  TAILOR INSTRUCTION NOTES
                </span>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 italic">

                  {requestData.message ? (
                    `"${requestData.message}"`
                  ) : (
                    `"Your bespoke request has been received by the atelier. Our master tailor will review the design specifications."`
                  )}

                </div>

              </div>

              {/* ==================================================
                  QUOTATION
              ================================================== */}

              <div className="mt-8 p-6 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-4">

                <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base">
                  <span>✨</span>
                  {requestData.product_price
                    ? "Bespoke Quotation"
                    : "Quotation Under Review"}
                </div>

                <p className="text-xs text-gray-600">
                  The quotation displayed here is linked to this custom design
                  request.
                </p>

                <div className="space-y-2 text-xs pt-2 border-t border-amber-200/60">

                  <div className="flex justify-between text-gray-700">
                    <span>
                      Original Product
                    </span>

                    <span className="font-semibold">
                      {requestData.product_name}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>
                      Custom Atelier Line
                    </span>

                    <span className="font-semibold">
                      {requestData.line || "BESPOKE CUSTOM LINE"}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>
                      Design Status
                    </span>

                    <span className="font-semibold">
                      {getStatusLabel(requestData.status)}
                    </span>
                  </div>

                </div>

                <div className="pt-4 border-t border-amber-200 flex justify-between items-baseline">

                  <span className="font-serif font-bold text-sm">
                    Total Invoice Estimation
                  </span>

                  <span className="text-2xl font-serif font-bold text-gray-950">
                    {formatPrice(requestData.product_price)}
                  </span>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                  <button
                    onClick={handleApproveAndPay}
                    disabled={
                      isPaid || isLocallyPaid
                    }
                    className={`py-3.5 rounded-lg text-xs uppercase tracking-[0.15em] font-bold shadow-sm text-center transition-all cursor-pointer ${
                      isPaid || isLocallyPaid
                        ? "bg-emerald-700 text-white cursor-default"
                        : "bg-[#D4AF37] hover:bg-[#c29f30] text-black"
                    }`}
                  >
                    {isPaid || isLocallyPaid
                      ? "✓ Quotation Approved"
                      : `Approve & Pay (${formatPrice(
                          requestData.product_price
                        )})`}
                  </button>

                  <button
                    onClick={() =>
                      showToast(
                        "Cost correction request submitted to concierge"
                      )
                    }
                    className="bg-white border border-gray-300 hover:border-black text-gray-800 py-3.5 rounded-lg text-xs uppercase tracking-[0.15em] font-semibold text-center cursor-pointer"
                  >
                    Request Cost Correction
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              RIGHT COLUMN - CHAT
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-[750px] sticky top-24">

            {/* CHAT HEADER */}

            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">

              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center font-serif text-sm">
                W
              </div>

              <div>

                <h4 className="font-serif font-bold text-sm text-gray-900">
                  Atelier Lead Master
                </h4>

                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>

                  Active Online

                </span>

              </div>

            </div>

            {/* CHAT MESSAGES */}

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`flex flex-col ${
                    message.sender === userName
                      ? "items-end"
                      : "items-start"
                  }`}
                >

                  <span className="text-[9px] text-gray-400 mb-1">
                    {message.sender} • {message.time}
                  </span>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      message.sender === userName
                        ? "bg-[#1C1816] text-white rounded-br-none"
                        : message.sender === "System"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium w-full text-center"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {message.text}
                  </div>

                </div>

              ))}

            </div>

            {/* CHAT INPUT */}

            <form
              onSubmit={handleSendMessage}
              className="pt-4 border-t border-gray-100 mt-4 flex gap-2"
            >

              <input
                type="text"
                placeholder="Type message to designer..."
                value={chatMessage}
                onChange={(e) =>
                  setChatMessage(e.target.value)
                }
                className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-black"
              />

              <button
                type="submit"
                className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>

          </div>

        </main>

      </div>

    </div>
  );
}
