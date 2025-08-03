"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTracer } from "@/app/hooks/useTracers";
import { TracerRecord } from "@/app/types/tracer";
import TracerForm from "@/app/components/TracerForm";

// 🔍 STATUS LOGIC HELPERS
function wasSent(record: TracerRecord) {
  return record.first || record.second || record.third || record.final;
}

function isReceived(record: TracerRecord) {
  const remark = record.remarks?.toLowerCase() || "";
  return (
    remark.includes("complied") ||
    remark.includes("compliant") ||
    remark.includes("paid") ||
    (remark.includes("returned") && record.final)
  );
}

function isLackingReturn(record: TracerRecord) {
  const remark = record.remarks?.toLowerCase() || "";
  return (
    remark.includes("returned") &&
    !record.final &&
    (record.first || record.second || record.third)
  );
}

function getStatus(record: TracerRecord): string {
  if (!wasSent(record)) return "Not Sent";
  if (isReceived(record)) return "Received";
  if (isLackingReturn(record)) return "Received but Lacking";
  return "No Response";
}

export default function EditTracerPage() {
  const router = useRouter();
  const { id } = useParams();
  const tracerId = Number(id);
  const { record, isLoading, error } = useTracer(tracerId);

  const [saveError, setSaveError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const handleSubmit = async (data: Omit<TracerRecord, "id">) => {
    setSaving(true);
    setSaveError("");
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
        "http://192.168.1.236:8000";
      const url = `${base}/api/ocr/records/${tracerId}/`;

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed: ${res.status} ${text}`);
      }

      router.push("/tracers");
    } catch (e: any) {
      console.error("Update error:", e);
      setSaveError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {String(error)}</p>;
  if (!record) return <p>No record found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back to list
      </button>

      <div className="bg-white rounded-2xl shadow-md p-8 relative">
        <h1 className="text-2xl font-semibold mb-2">
          Edit Tracer for {record.owner}
        </h1>
        <p className="text-gray-500 mb-2">Update the details below and hit Save.</p>

        {/* ✅ Display dynamic status */}
        <div className="flex items-center mb-4 gap-2">
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span className="font-semibold text-black">
              {getStatus(record)}
            </span>
          </p>

          {/* ℹ️ Tooltip for "Palatandaan" */}
          <div className="relative group inline-block cursor-pointer">
            <span className="text-xs text-blue-600 underline">REMINDER!!</span>
            <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 p-3 text-sm text-gray-700 w-[260px] shadow-lg rounded-md top-6 left-0">
              <p><strong>Received:</strong> remarks should include <em>complied</em>, <em>paid</em>, or <em>returned</em> (only if <strong>Final</strong> letter sent)</p>
              <hr className="my-2" />
              <p><strong>Received but Lacking:</strong> remarks should include <em>returned</em> without final letter</p>
              <hr className="my-2" />
              <p><strong>No Response:</strong> just leave remarks blank or unrelated</p>
              <hr className="my-2" />
              <p><strong>Not Sent:</strong> no tracer letter fields filled</p>
            </div>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-100 text-red-700 rounded p-3 mb-4">
            {saveError}
          </div>
        )}

        <TracerForm
          initial={record}
          onSubmit={handleSubmit}
          disabled={saving}
        />

        {saving && (
          <p className="text-gray-500 mt-4 italic">Saving… please wait</p>
        )}
      </div>
    </div>
  );
}
