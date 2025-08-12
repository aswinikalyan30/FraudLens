import React from "react";
import {
  X,
  User,
  Send,
  FileAudio,
  MessageCircle,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Eye,
  Clock,
  Mail,
  FileText,
  Globe,
  Sparkles,
  BadgeInfo,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Application } from "../contexts/ApplicationContext";
import ChatAgent from "./ChatAgent";
import DecisionDocumentationModal, {
  DecisionData,
} from "./DecisionDocumentationModal";
import DocumentRequestWizard from "./DocumentRequestWizard";
import "./CaseReviewStyles.css";
import type { ApplicationDetail } from "../api/applications";
import { update_application } from "../api/applications";

type FafsaDoc = {
  sai?: number;
  fafsaId?: string;
  spouseInfo?: { income?: number } | null;
  applicantInfo?: { income?: number } | null;
  incomeDetails?: {
    studentTotalIncome?: number;
    parentTotalIncome?: number;
    otherUntaxedIncome?: number;
  } | null;
} | null;

interface CaseReviewProps {
  case: Application;
  onClose: () => void;
  mode?: "modal" | "fullscreen" | "drawer";
  detail?: ApplicationDetail; // API-backed full details
}

const CaseReview: React.FC<CaseReviewProps> = ({
  case: fraudCase,
  onClose,
  mode = "drawer",
  detail,
}) => {
  const { isDark } = useTheme();

  // UI state
  const [showDocumentWizard, setShowDocumentWizard] = React.useState(false);
  const [showChatWindow, setShowChatWindow] = React.useState(false);
  const [showDecisionModal, setShowDecisionModal] = React.useState(false);
  const [decisionType, setDecisionType] = React.useState<
    "approve" | "reject" | "hold" | null
  >(null);
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  console.log("CaseReview rendered with fraudCase:", fraudCase);
  // auto-dismiss toast
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Flags from API detail only
  const apiFlags: string[] = React.useMemo(() => {
    const fd = detail?.fraud_details as unknown as
      | Record<string, unknown>
      | undefined;
    if (!fd) return [];
    const out: string[] = [];
    Object.values(fd).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((v) => {
          if (typeof v === "string") out.push(v);
        });
      }
    });
    return out;
  }, [detail]);

  const normalizeStage = (t?: string): Application["stage"] => {
    const v = (t || "").toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
    if (v === "financial-aid" || v === "financialaid" || v === "finaid")
      return "financial-aid";
    return "admissions";
  };

  // Derived application view model using API detail only
  const application = React.useMemo(() => {
    const fullName = [detail?.first_name, detail?.last_name]
      .filter(Boolean)
      .join(" ");
    const stageFromDetail: Application["stage"] | undefined = normalizeStage(
      detail?.application_type
    );

    const riskFraction =
      detail?.fraud_score != null
        ? typeof detail.fraud_score === "string"
          ? parseFloat(detail.fraud_score)
          : detail.fraud_score
        : undefined;
    const riskScore =
      typeof riskFraction === "number" && !Number.isNaN(riskFraction)
        ? Math.round(riskFraction * 100)
        : 0;

    return {
      name: fullName || "—",
      email: detail?.email || "—",
      studentId: detail?.application_id ?? fraudCase.studentId,
      program: detail?.program_name || "—",
      riskScore,
      stage: stageFromDetail || "admission",
      flags: apiFlags.map((rule) => ({ rule })),
      status:
        (detail?.application_status as Application["status"]) || "submitted",
      institution: detail?.institution,
      phone: detail?.phone,
      dob: detail?.dob,
      nationality: detail?.nationality,
      address: Array.isArray(detail?.address) ? detail.address : undefined,
      applicationDetails: detail?.application_details,
      academicHistory: detail?.academic_history,
    } as const;
  }, [detail, apiFlags, fraudCase.studentId]);

  // Helper for status label
  const statusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "escalated":
      case "high_suspicious":
        return "Escalated";
      case "submitted":
        return "Submitted";
      case "processing":
        return "Processing";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Add a local type for academic records for safe access
  type AcademicRecord = {
    institution?: string;
    degree?: string;
    major?: string;
    gpa?: string | number;
    gpaScale?: string | number;
    attendance?: {
      attendedClasses?: number;
      totalClasses?: number;
    };
    courseSummary?: { advancedCourses?: string[] };
  };

  const handleSendDocumentRequest = (requestData: {
    documents: string[];
    message: string;
    urgency: number;
    dueDate: string;
    tone: "formal" | "friendly" | "urgent";
    language: string;
    template?: string;
  }) => {
    console.log("Document request sent:", requestData);
    setToast({ type: "success", message: "Document request sent." });
  };

  const handleAcceptApplication = async () => {
    setIsUpdating(true);
    try {
      const applicationId = detail?.application_id || fraudCase.studentId;
      const result = await update_application(applicationId, {
        application_status: "approved",
      });

      if (result) {
        setToast({
          type: "success",
          message: "Application approved successfully.",
        });
        // Close the review after a short delay to show the success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setToast({ type: "error", message: "Failed to approve application." });
      }
    } catch (error) {
      console.error("Error approving application:", error);
      setToast({ type: "error", message: "Failed to approve application." });
    } finally {
      setIsUpdating(false);
    }
  };

  const containerClass =
    mode === "modal"
      ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 lg:p-4"
      : mode === "drawer"
      ? "fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out"
      : `min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`;

  const contentClass =
    mode === "modal"
      ? `border rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow-xl"
        } lg:rounded-xl rounded-none h-full lg:h-auto`
      : mode === "drawer"
      ? "h-full flex flex-col overflow-hidden"
      : "min-h-screen flex flex-col";

  const handleDecisionSubmit = (decision: DecisionData) => {
    console.log("Decision submitted:", { type: decisionType, ...decision });
    setShowDecisionModal(false);
    setDecisionType(null);
    onClose();
  };

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <header
          className={`border-b px-6 py-4 flex-shrink-0 ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left: Back button and Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1
                  className={`text-lg sm:text-xl font-semibold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {application.name}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      application.status === "approved"
                        ? isDark
                          ? "bg-green-700/20 border-green-500/30 text-green-300"
                          : "bg-green-50 border-green-200 text-green-700"
                        : application.status === "rejected"
                        ? isDark
                          ? "bg-red-700/20 border-red-500/30 text-red-300"
                          : "bg-red-50 border-red-200 text-red-700"
                        : application.status === "escalated"
                        ? isDark
                          ? "bg-yellow-700/20 border-yellow-500/30 text-yellow-200"
                          : "bg-yellow-50 border-yellow-200 text-yellow-700"
                        : isDark
                        ? "bg-gray-700/20 border-gray-500/30 text-gray-300"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    {statusLabel(application.status)}
                  </span>
                </h1>
                {/* Only show risk score if not submitted */}
                {application.status !== "submitted" && (
                  <p
                    className={`text-xs sm:text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Risk Score:{" "}
                    <span className="text-red-500 font-semibold">
                      {application.riskScore}
                    </span>{" "}
                    • {application.stage}
                  </p>
                )}
              </div>
            </div>
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* If rejected, show only admin override */}
              {application.status === "rejected" ? (
                <button
                  title="Override"
                  onClick={() => setShowDecisionModal(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                    isDark
                      ? "border-blue-500 text-blue-300 hover:bg-blue-900/20 hover:border-blue-400"
                      : "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  }`}
                >
                  Override
                </button>
              ) : (
                // Only show actions if not submitted
                application.status !== "submitted" && (
                  <>
                    {
                      application.status !== "approved" &&  application.status === "lowRisk" && (<button
                      title="Accept application"
                      onClick={handleAcceptApplication}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isUpdating
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : isDark
                          ? "bg-green-600 text-white hover:bg-green-700 border border-green-600 hover:border-green-700"
                          : "bg-green-600 text-white hover:bg-green-700 border border-green-600 hover:border-green-700"
                      }`}
                    >
                      {isUpdating ? "Approving..." : "Accept"}
                    </button>)
                    }
                    <button
                      title="Place application on hold"
                      onClick={() => {
                        setDecisionType("hold");
                        setShowDecisionModal(true);
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                        isDark
                          ? "border-gray-500 text-gray-300 hover:bg-gray-700 hover:border-gray-400"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      Hold
                    </button>
                    { <button
                      title="Reject application"
                      onClick={() => {
                        setDecisionType("reject");
                        setShowDecisionModal(true);
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                        isDark
                          ? "border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500"
                          : "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      }`}
                    >
                      Reject
                    </button>}
                  </>
                )
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div
          className={`flex flex-1 ${
            mode === "drawer"
              ? "overflow-hidden min-h-0"
              : mode === "modal"
              ? "overflow-y-auto max-h-[calc(90vh-140px)]"
              : "min-h-0"
          }`}
        >
          <div
            className={`grid gap-6 w-full p-4 ${
              application.status === "submitted"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-12"
            }`}
          >
            {/* Left Column: Student Info + Details */}
            <div
              className={`space-y-6 ${
                application.status === "submitted"
                  ? "lg:col-span-1"
                  : "col-span-12 lg:col-span-5"
              }`}
            >
              {/* Student Info */}
              <div
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isDark
                    ? "bg-gray-800 divide-gray-700"
                    : "bg-white divide-gray-200"
                } h-[22rem] overflow-auto shadow-sm`}
              >
                <h3
                  className={`text-base font-semibold mb-3 flex items-center space-x-2`}
                >
                  <User className="w-4 h-4" />
                  <span>Student Information</span>
                </h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-base ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {application.name}
                    </h4>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {application.email}
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {application.program}
                      {detail?.program_id ? ` (${detail.program_id})` : ""}
                      {application.institution
                        ? ` • ${application.institution}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="mb-3 space-y-1 text-xs">
                  {application.phone && (
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">Phone:</span>{" "}
                      {application.phone}
                    </div>
                  )}
                  {application.dob && (
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">DOB:</span>{" "}
                      {new Date(application.dob).toLocaleDateString()}
                    </div>
                  )}
                  {application.nationality && (
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">Nationality:</span>{" "}
                      {application.nationality}
                    </div>
                  )}
                  {application.address && application.address.length > 0 && (
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">Address:</span>{" "}
                      {`${application.address[0].street}, ${application.address[0].city}, ${application.address[0].state} ${application.address[0].postalCode}`}
                    </div>
                  )}
                  {detail?.sat_scores && (
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">SAT Score:</span>{" "}
                      {detail.sat_scores}
                    </div>
                  )}
                </div>

                {/* Application Information */}
                <div
                  className={`mt-3 pt-3 border-t space-y-2 transition-all duration-300 ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <h4
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Application Information
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">Student ID:</span>{" "}
                      {application.studentId}
                    </div>
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">Stage:</span>{" "}
                      {application.stage === "financial-aid"
                        ? "Financial Aid"
                        : "Admissions"}
                    </div>
                    <div
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">Status:</span>{" "}
                      {statusLabel(application.status)}
                    </div>
                    {detail?.created_at && (
                      <div
                        className={`${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <span className="opacity-70">Applied:</span>{" "}
                        {new Date(detail.created_at).toLocaleDateString()}
                      </div>
                    )}
                    {detail?.updated_at && (
                      <div
                        className={`${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <span className="opacity-70">Last Updated:</span>{" "}
                        {new Date(detail.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {application.applicationDetails && (
                  <div
                    className={`mt-3 pt-3 border-t space-y-2 transition-all duration-300 ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(
                        application.applicationDetails as Record<
                          string,
                          unknown
                        >
                      ).map(([k, v]) => (
                        <div
                          key={k}
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <span className="opacity-70 capitalize">{k}:</span>{" "}
                          {String(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Academic History + Documents */}
              <div
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`text-base font-semibold mb-3 flex items-center space-x-2`}
                >
                  <FileAudio className="w-4 h-4" />
                  <span>Academic History</span>
                </h3>
                {application.academicHistory &&
                application.academicHistory.length > 0 ? (
                  <div className="space-y-3 text-sm">
                    {(application.academicHistory as AcademicRecord[]).map(
                      (a, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded border ${
                            isDark
                              ? "bg-gray-700/30 border-gray-600"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="font-medium">
                            {a.institution} • {a.degree}
                          </div>
                          <div className="text-xs opacity-80">
                            {a.major} • GPA {a.gpa}/{a.gpaScale}
                          </div>
                          {a.attendance &&
                            a.attendance.attendedClasses &&
                            a.attendance.totalClasses && (
                              <div className="text-xs opacity-70 mt-1">
                                Attendance: {a.attendance.attendedClasses}/
                                {a.attendance.totalClasses} (
                                {Math.round(
                                  (a.attendance.attendedClasses /
                                    a.attendance.totalClasses) *
                                    100
                                )}
                                %)
                              </div>
                            )}
                          {a.courseSummary?.advancedCourses &&
                            a.courseSummary.advancedCourses.length > 0 && (
                              <div className="text-xs mt-1">
                                <span className="opacity-70">Advanced:</span>{" "}
                                {a.courseSummary.advancedCourses.join(", ")}
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    No academic history available.
                  </div>
                )}

                {/* Documents Section */}
                <div
                  className={`border-t pt-4 mt-4 ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <h4
                    className={`text-sm font-semibold mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Documents
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* SOP Chip */}
                    {detail?.supporting_documents?.sop && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                          isDark
                            ? "bg-green-500/10 text-green-300 border-green-500/30"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        SOP
                      </span>
                    )}

                    {/* LOR Chip */}
                    {detail?.supporting_documents?.references &&
                      detail.supporting_documents.references.length > 0 && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                            isDark
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          LOR ({detail.supporting_documents.references.length})
                        </span>
                      )}

                    {/* FAFSA Chip */}
                    {(() => {
                      const fafsa = (
                        detail?.supporting_documents as
                          | { fafsa?: FafsaDoc }
                          | undefined
                      )?.fafsa;
                      return fafsa ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                            isDark
                              ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                              : "bg-teal-50 text-teal-700 border-teal-200"
                          }`}
                        >
                          FAFSA
                        </span>
                      ) : null;
                    })()}

                    {/* Person ID (placeholder for now) */}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                        isDark
                          ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      Person ID
                    </span>

                    {/* Income Details (present if FAFSA has income fields) */}
                    {(() => {
                      const fafsa =
                        (
                          detail?.supporting_documents as
                            | { fafsa?: FafsaDoc }
                            | undefined
                        )?.fafsa ?? null;
                      const hasIncome = !!(
                        fafsa?.incomeDetails ||
                        fafsa?.spouseInfo?.income ||
                        fafsa?.applicantInfo?.income
                      );
                      return hasIncome ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                            isDark
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          Income Details
                        </span>
                      ) : null;
                    })()}
                  </div>

                  {/* FAFSA Summary */}
                  {(() => {
                    const fafsa =
                      (
                        detail?.supporting_documents as
                          | { fafsa?: FafsaDoc }
                          | undefined
                      )?.fafsa ?? null;
                    if (!fafsa) return null;
                    return (
                      <div
                        className={`p-3 rounded border mb-3 ${
                          isDark
                            ? "bg-gray-700/30 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">
                          FAFSA Summary
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <span className="opacity-70">SAI:</span>{" "}
                          {fafsa.sai ?? "—"}
                          {fafsa.fafsaId ? (
                            <span className="ml-3 opacity-70">FAFSA ID:</span>
                          ) : null}
                          {fafsa.fafsaId ? <span> {fafsa.fafsaId}</span> : null}
                        </div>
                      </div>
                    );
                  })()}

                  {/* SOP Excerpt */}
                  {detail?.supporting_documents?.sop && (
                    <div
                      className={`p-3 rounded border mb-3 ${
                        isDark
                          ? "bg-gray-700/30 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        Statement of Purpose (Excerpt):
                      </div>
                      <div className="text-xs opacity-80 line-clamp-3">
                        {detail.supporting_documents.sop.length > 200
                          ? detail.supporting_documents.sop.substring(0, 200) +
                            "..."
                          : detail.supporting_documents.sop}
                      </div>
                    </div>
                  )}

                  <h4
                    className={`text-sm font-semibold mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Request Additional Documents
                  </h4>
                  <p
                    className={`text-xs mb-3 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Request additional documents from the applicant to verify
                    their application.
                  </p>
                  <button
                    onClick={() => setShowDocumentWizard(true)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Request Documents
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column for submitted applications */}
            {application.status === "submitted" && (
              <div className="space-y-6 lg:col-span-1">
                {/* Application Timeline or Status */}
                <div
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <h3
                    className={`text-base font-semibold mb-3 flex items-center space-x-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Application Status</span>
                  </h3>
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded border ${
                        isDark
                          ? "bg-gray-700/30 border-gray-600"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium ${
                          isDark ? "text-blue-300" : "text-blue-800"
                        }`}
                      >
                        Application Submitted
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isDark ? "text-gray-400" : "text-blue-600"
                        }`}
                      >
                        {detail?.created_at
                          ? new Date(detail.created_at).toLocaleDateString()
                          : "Recently submitted"}
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded border border-dashed ${
                        isDark
                          ? "border-gray-600 bg-gray-800/50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Pending Review
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Waiting for processing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right Column: AI Analysis Summary + Admin Notes */}
            {application.status !== "submitted" && (
              <div className="space-y-6 flex flex-col h-full col-span-12 lg:col-span-7">
                <div
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <div className="flex items-center mb-3">
                    <Sparkles className={`w-5 h-5 text-blue-500`} />
                    <h3
                      className={`pl-2 font-semibold ${
                        isDark ? "text-white" : "text-blue-900"
                      }`}
                    >
                      AI Assisted Insights{" "}
                    </h3>
                    <div className="relative group ml-1">
                      <BadgeInfo
                        className={`w-4 h-4 text-blue-500 cursor-help`}
                      />
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                          isDark
                            ? "bg-gray-700 text-white border border-gray-600"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        AI insights are intended to assist — final decisions
                        remain the responsibility of authorized personnel.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Risk Factors Section */}
                    <div className="space-y-3">
                      <h4
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Risk Factors
                      </h4>
                      {(() => {
                        const fraudDetails = detail?.fraud_details as
                          | Record<string, string[]>
                          | undefined;
                        if (!fraudDetails)
                          return (
                            <div
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              No risk factors identified.
                            </div>
                          );

                        // Helper function to get icon for risk factor category
                        const getRiskIcon = (bucket: string) => {
                          switch (bucket.toLowerCase()) {
                            case "application_behaviour":
                            case "application_behavior":
                              return <Eye className="w-3 h-3" />;
                            case "address":
                              return <Globe className="w-3 h-3" />;
                            case "academic_record":
                              return <FileText className="w-3 h-3" />;
                            case "email":
                              return <Mail className="w-3 h-3" />;
                            case "documents":
                            case "supporting_documents":
                              return <FileText className="w-3 h-3" />;
                            case "identity":
                              return <Shield className="w-3 h-3" />;
                            case "time":
                            case "timing":
                              return <Clock className="w-3 h-3" />;
                            default:
                              return <AlertTriangle className="w-3 h-3" />;
                          }
                        };

                        return Object.entries(fraudDetails).map(
                          ([bucket, items]) => (
                            <div
                              key={bucket}
                              className={`p-3 rounded border ${
                                isDark
                                  ? "bg-gray-700/30 border-gray-600"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`font-medium text-xs mb-2 capitalize flex items-center gap-2 ${
                                  isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {getRiskIcon(bucket)}
                                {bucket.replace(/_/g, " ")}
                              </div>
                              <ul className="space-y-1">
                                {items.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className={`text-xs flex items-start gap-1 ${
                                      isDark ? "text-gray-300" : "text-gray-700"
                                    }`}
                                  >
                                    <span className="w-1 h-1 rounded-full bg-current mt-1.5 flex-shrink-0"></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        );
                      })()}
                    </div>

                    {/* Suggested Actions Section */}
                    <div className="space-y-3">
                      <h4
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Suggested Actions
                      </h4>
                      <div
                        className={`p-3 rounded border ${
                          isDark
                            ? "bg-gray-700/30 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <ul className="space-y-2">
                          {(detail?.agent_recommendations &&
                          detail.agent_recommendations.length > 0
                            ? detail.agent_recommendations
                            : [
                                "Request handwritten essay sample for verification",
                                "Initiate email domain ownership verification",
                                "Schedule short video interview to confirm identity",
                              ]
                          ).map((recommendation, i) => (
                            <li
                              key={i}
                              className={`text-xs flex items-start gap-2 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              <span className="w-1 h-1 rounded-full bg-current mt-1.5 flex-shrink-0"></span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <h3
                    className={`text-base font-semibold mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Admin Notes
                  </h3>
                  <NotesList isDark={isDark} onToast={(t) => setToast(t)} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Chat Bubble */}
        {mode === "fullscreen" && !showChatWindow && (
          <button
            onClick={() => setShowChatWindow(true)}
            className={`chat-bubble fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 z-40 ${
              isDark
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="Open AI Assistant"
          >
            <MessageCircle className="w-6 h-6 mx-auto" />
          </button>
        )}

        {/* Floating Chat Window */}
        {mode === "fullscreen" && showChatWindow && (
          <div
            className={`chat-window fixed bottom-6 right-6 w-96 h-[500px] rounded-lg shadow-2xl border z-50 flex flex-col ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Chat Header */}
            <div
              className={`border-b px-4 py-3 rounded-t-lg ${
                isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-sm font-semibold flex items-center gap-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => setShowChatWindow(false)}
                  className={`p-1 rounded-md transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Chat Content */}
            <div className="flex-1 overflow-hidden rounded-b-lg">
              <ChatAgent 
                applicationId={application.studentId} 
                userName={application.name?.split(' ')[0] || 'User'}
                onOpenCaseFullScreen={(id) => {
                  // Close current case view and open the new one
                  onClose();
                  setTimeout(() => {
                    // Find the application in the context and navigate to it
                    // This timeout is to ensure the current case is closed first
                    window.dispatchEvent(new CustomEvent('openCaseFullScreen', { detail: { id } }));
                  }, 100);
                }}
              />
            </div>
          </div>
        )}

        {/* Document Request Wizard */}
        <DocumentRequestWizard
          isOpen={showDocumentWizard}
          onClose={() => setShowDocumentWizard(false)}
          applicantName={application.name}
          studentId={application.studentId}
          program={application.program}
          riskScore={application.riskScore}
          onSend={handleSendDocumentRequest}
        />

        {/* Decision Modal */}
        {showDecisionModal && (
          <DecisionDocumentationModal
            decisionType={decisionType}
            case={{
              id: detail?.application_id || fraudCase.id || "",
              studentId: application.studentId,
              name: application.name,
              riskScore: application.riskScore,
            }}
            onClose={() => {
              setShowDecisionModal(false);
              setDecisionType(null);
            }}
            onSubmit={(decision) => {
              setShowDecisionModal(false);
              handleDecisionSubmit(decision);
              setDecisionType(null);
              onClose();
            }}
          />
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg border text-sm z-[60] ${
              toast.type === "success"
                ? isDark
                  ? "bg-green-700 text-white border-green-600"
                  : "bg-green-50 text-green-800 border-green-200"
                : isDark
                ? "bg-red-700 text-white border-red-600"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Notes component
const NotesList: React.FC<{
  isDark: boolean;
  onToast?: (t: { type: "success" | "error"; message: string }) => void;
}> = ({ isDark, onToast }) => {
  const [notes, setNotes] = React.useState<
    Array<{ id: string; author: string; timestamp: string; content: string }>
  >([
    {
      id: "n1",
      author: "Admin",
      timestamp: new Date(Date.now() - 3600_000).toISOString(),
      content: "Initial review completed. Awaiting additional documents.",
    },
  ]);
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!text.trim()) {
      if (onToast)
        onToast({ type: "error", message: "Cannot save an empty note." });
      return;
    }
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      setNotes((prev) => [
        {
          id: Date.now().toString(),
          author: "Admin",
          timestamp: new Date().toISOString(),
          content: text.trim(),
        },
        ...prev,
      ]);
      setText("");
      if (onToast)
        onToast({ type: "success", message: "Note saved successfully." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-40 overflow-auto pr-1">
        {notes.map((n) => (
          <div
            key={n.id}
            className={`p-2 rounded border ${
              isDark
                ? "bg-gray-700/40 border-gray-600 text-gray-200"
                : "bg-gray-50 border-gray-200 text-gray-800"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] opacity-80 mb-1">
              <span>{n.author}</span>
              <span>{new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{n.content}</div>
          </div>
        ))}
        {notes.length === 0 && (
          <div
            className={`text-xs italic ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No notes yet.
          </div>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note..."
        className={`w-full min-h-[90px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
          isDark
            ? "bg-gray-800 border-gray-600 text-gray-200 focus:ring-blue-500"
            : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500"
        }`}
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            saving || !text.trim()
              ? isDark
                ? "bg-gray-700 text-gray-400"
                : "bg-gray-100 text-gray-400"
              : isDark
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saving ? "Saving…" : "Save Notes"}
        </button>
      </div>
    </div>
  );
};

export default CaseReview;
