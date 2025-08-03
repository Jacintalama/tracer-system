// app/page.tsx
import Link from "next/link";
import { DocumentTextIcon, TableCellsIcon } from "@heroicons/react/24/solid";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
    <NavBar />
    <main className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* OCR Panel */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-8 space-y-4">
          <DocumentTextIcon className="h-12 w-12 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Upload for OCR</h2>
          <p className="text-gray-500 text-center">
            Scan your tracer sheets and extract all fields automatically.
          </p>
          <Link
            href="/ocr"
            className="mt-4 px-6 py-2 font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Go to OCR
          </Link>
        </div>

        {/* Tracer Records Panel */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-8 space-y-4">
          <TableCellsIcon className="h-12 w-12 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">View Tracer Records</h2>
          <p className="text-gray-500 text-center">
            Browse, search, and manage all your scanned tracer entries.
          </p>
          <Link
            href="/tracers"
            className="mt-4 px-6 py-2 font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            View Records
          </Link>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
