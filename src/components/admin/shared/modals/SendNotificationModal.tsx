"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";

interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

interface NotificationResult {
  message: string;
  totalRecipients?: number;
  successCount?: number;
  failureCount?: number;
  scheduledFor?: string;
}

export default function SendNotificationModal({
  open,
  onClose,
  groupId,
}: SendNotificationModalProps) {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high",
    sendToAll: true,
    scheduleFor: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NotificationResult | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/admin/groups/${groupId}/notifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        router.refresh();

        // Reset form after successful send
        setTimeout(() => {
          setFormData({
            subject: "",
            message: "",
            priority: "normal",
            sendToAll: true,
            scheduleFor: "",
          });
          setResult(null);
          onClose();
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setResult({
        message: `Error: ${error instanceof Error ? error.message : "Failed to send notification"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Send Notification"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={e =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification subject..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            rows={6}
            required
            value={formData.message}
            onChange={e =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message..."
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={e =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "low" | "normal" | "high",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule For (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduleFor}
              onChange={e =>
                setFormData({ ...formData, scheduleFor: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sendToAll}
              onChange={e =>
                setFormData({ ...formData, sendToAll: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">
              Send to all group members
            </span>
          </label>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-md p-4 ${
              result.successCount !== undefined
                ? result.failureCount === undefined || result.failureCount === 0
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
                : result.scheduledFor
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                result.successCount !== undefined
                  ? result.failureCount === undefined ||
                    result.failureCount === 0
                    ? "text-green-800"
                    : "text-yellow-800"
                  : result.scheduledFor
                    ? "text-blue-800"
                    : "text-red-800"
              }`}
            >
              {result.message}
            </p>
            {result.totalRecipients !== undefined && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  📧 Sent to {result.successCount} of {result.totalRecipients}{" "}
                  recipients
                </p>
                {result.failureCount !== undefined &&
                  result.failureCount > 0 && (
                    <p className="text-red-600">
                      ⚠️ {result.failureCount} emails failed to send
                    </p>
                  )}
              </div>
            )}
            {result.scheduledFor && (
              <p className="mt-2 text-sm text-blue-600">
                ⏰ Scheduled for:{" "}
                {new Date(result.scheduledFor).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This notification will be sent via email to
            all selected group members.
            {formData.scheduleFor &&
              " The notification will be sent at the scheduled time."}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            {result ? "Close" : "Cancel"}
          </button>
          {!result && (
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              {isLoading
                ? "Sending..."
                : formData.scheduleFor
                  ? "Schedule Notification"
                  : "Send Now"}
            </button>
          )}
        </div>
      </form>
    </BaseModal>
  );
}
