"use client";

import React, { useState, useEffect, FormEvent } from "react";
import type { TracerRecord } from "../types/tracer";

interface Props {
  initial?: Partial<TracerRecord>;
  onSubmit: (data: Omit<TracerRecord, "id">) => void;
  disabled?: boolean;
}

const VISIT_FIELDS = ["first", "second", "third", "final"] as const;
type VisitField = (typeof VISIT_FIELDS)[number];

// 1) Define a type whose keys exactly match your form fields (all strings)
type FormData = {
  [K in keyof Omit<TracerRecord, "id">]: string;
};

export default function TracerForm({
  initial = {},
  onSubmit,
  disabled = false,
}: Props) {
  // 2) Default empty form
  const defaultForm: FormData = {
    no: "",
    establishment: "",
    owner: "",
    address: "",
    business: "",
    date: "",
    date2: "",
    date3: "",
    first: "",
    second: "",
    third: "",
    datefinal: "",
    final: "",
    remarks: "",
  };

  // Strip out `id` and coerce to Partial<FormData>
  const { id: _ignore, ...initialNoId } = initial as any;

  // 3) State uses FormData
  const [form, setForm] = useState<FormData>({
    ...defaultForm,
    ...initialNoId,
  });

  // Reset when `initial` changes
  const initialJSON = JSON.stringify(initialNoId);
  useEffect(() => {
    setForm({ ...defaultForm, ...initialNoId });
  }, [initialJSON]);

  type FormKey = keyof FormData;
  const keys = Object.keys(form) as FormKey[];

  // Text/textarea handler
  const handleTextChange =
    (k: FormKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  // Toggle checkmark box
  const handleBoxToggle = (k: VisitField) => () => {
    if (disabled) return;
    setForm((f) => ({ ...f, [k]: f[k] === "✓" ? "" : "✓" }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic Info */}
      <fieldset disabled={disabled} className="space-y-4">
        <legend className="text-lg font-medium">Basic Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["no", "establishment", "owner"].map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
              <input
                type="text"
                value={form[k as FormKey]}
                onChange={handleTextChange(k as FormKey)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Address & Business */}
      <fieldset disabled={disabled} className="space-y-4">
        <legend className="text-lg font-medium">Location & Business</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={handleTextChange("address")}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Business</label>
            <input
              type="text"
              value={form.business}
              onChange={handleTextChange("business")}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            />
          </div>
        </div>
      </fieldset>

      {/* Dates */}
      <fieldset disabled={disabled} className="space-y-4">
        <legend className="text-lg font-medium">Dates</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Initial Visit</label>
            <input
              type="text"
              value={form.date}
              onChange={handleTextChange("date")}
              placeholder="YYYY-MM-DD or whatever"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Second Visit</label>
            <input
              type="text"
              value={form.date2}
              onChange={handleTextChange("date2")}
              placeholder="YYYY-MM-DD"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Third Visit</label>
            <input
              type="text"
              value={form.date3}
              onChange={handleTextChange("date3")}
              placeholder="YYYY-MM-DD"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            />
          </div>
        </div>
      </fieldset>

      {/* Visit Checkboxes */}
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="text-lg font-medium">Visit Completed</legend>
        <div className="flex flex-wrap gap-6">
          {VISIT_FIELDS.map((vk) => (
            <label key={vk} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form[vk] === "✓"}
                onChange={handleBoxToggle(vk)}
                className="h-5 w-5 rounded border-gray-300 focus:ring"
              />
              <span className="capitalize">{vk}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium mb-1">Remarks</label>
        <textarea
          rows={4}
          value={form.remarks}
          onChange={handleTextChange("remarks")}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          disabled={disabled}
        />
        {/* Show ℹ️ icon if remarks is empty but any visit is checked */}
        {!form.remarks.trim() &&
          (form.first === "✓" ||
            form.second === "✓" ||
            form.third === "✓" ||
            form.final === "✓") && (
            <div className="text-blue-600 text-sm mt-1">
              ℹ️ Acceptable if returned, paid, complied, etc.
            </div>
          )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {disabled ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
