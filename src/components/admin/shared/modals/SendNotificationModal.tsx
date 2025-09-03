"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import { Field } from "./components/Field";
import { Input, Textarea, Select, Checkbox } from "./components/Inputs";
import { Panel, ActionRow, Button, Badge } from "./components/Primitives";

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

export default function SendNotificationModal({ open, onClose, groupId }: SendNotificationModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high",
    sendToAll: true,
    scheduleFor: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NotificationResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

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

  const statusColor = (): "green" | "yellow" | "blue" | "red" => {
    if (result?.successCount !== undefined) {
      if (!result.failureCount || result.failureCount === 0) return "green";
      return "yellow";
    }
    if (result?.scheduledFor) return "blue";
    return "red";
  };

  return (
    <BaseModal open={open} onClose={handleClose} title="Send Notification" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Subject *">
          <Input
            type="text"
            required
            value={formData.subject}
            onChange={e => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter notification subject..."
            disabled={isLoading}
          />
        </Field>

        <Field label="Message *">
          <Textarea
            required
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            className="min-h-[140px]"
            placeholder="Enter your message..."
            disabled={isLoading}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Priority">
            <Select
              value={formData.priority}
              onChange={e =>
                setFormData({ ...formData, priority: e.target.value as "low" | "normal" | "high" })
              }
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </Select>
          </Field>

          <Field label="Schedule For (Optional)">
            <Input
              type="datetime-local"
              value={formData.scheduleFor}
              onChange={e => setFormData({ ...formData, scheduleFor: e.target.value })}
              disabled={isLoading}
            />
          </Field>
        </div>

        <Field label="Delivery Options">
          <label className="flex items-center">
            <Checkbox
              checked={formData.sendToAll}
              onChange={e => setFormData({ ...formData, sendToAll: e.currentTarget.checked })}
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Send to all group members</span>
          </label>
        </Field>

        {result && (
          <Panel className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Delivery Result</h4>
              <Badge color={statusColor()}>{statusColor().toUpperCase()}</Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{result.message}</div>
            {result.totalRecipients !== undefined && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Sent to {result.successCount} of {result.totalRecipients} recipients
                </p>
                {result.failureCount !== undefined && result.failureCount > 0 && (
                  <p className="text-red-600 dark:text-red-300">{result.failureCount} emails failed to send</p>
                )}
              </div>
            )}
            {result.scheduledFor && (
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Scheduled for: {new Date(result.scheduledFor).toLocaleString()}
              </p>
            )}
          </Panel>
        )}

        <Panel className="p-3 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Note: This notification will be sent via email to all selected group members.
            {formData.scheduleFor && " The notification will be sent at the scheduled time."}
          </p>
        </Panel>

        <ActionRow>
          <Button type="button" variant="neutral" onClick={handleClose} disabled={isLoading}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button type="submit" disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700">
              {isLoading ? "Sending..." : formData.scheduleFor ? "Schedule Notification" : "Send Now"}
            </Button>
          )}
        </ActionRow>
      </form>
    </BaseModal>
  );
}
