"use client";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import BgGradient from "@/components/ui/common/bg-gradient";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [keyTerms, setKeyTerms] = useState<Array<{ term: string; definition: string }>>([]);
  const [qna, setQna] = useState<Array<{ question: string; answer: string }>>([]);
  const [qnaText, setQnaText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { startUpload } = useUploadThing(
    "pdfUploader",
    {
      onClientUploadComplete: async (res) => {
        if (!res) {
          return;
        }
        setLoading(true);
        setSummary(null);
        setHighlights([]);
        setKeyTerms([]);
        setQna([]);
        setQnaText(null);
        const fileUrl = res[0].url;
        const fileName = res[0].name;

        try {
          // Extract text
          const extractResponse = await fetch('/api/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName }),
          });
          const extractData = await extractResponse.json();
          if (!extractResponse.ok) {
            throw new Error(extractData.error || 'Failed to extract text');
          }
          const text = extractData.text;

          // Summarize + Q&A (single call to reduce quota usage)
          const summarizeResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, action: 'analyze', fileName }),
          });
          const analyzeData = await summarizeResponse.json();
          if (!summarizeResponse.ok) {
            throw new Error(analyzeData.error || 'Failed to summarize');
          }

          const summaryValue = analyzeData.summary;
          if (typeof summaryValue === "string") {
            setSummary(summaryValue);
          } else if (summaryValue && typeof summaryValue === "object") {
            setSummary(summaryValue.summary ?? null);
            setHighlights(Array.isArray(summaryValue.highlights) ? summaryValue.highlights : []);
            setKeyTerms(Array.isArray(summaryValue.key_terms) ? summaryValue.key_terms : []);
          }

          if (Array.isArray(analyzeData.qna)) {
            setQna(analyzeData.qna);
          } else if (typeof analyzeData.qna === "string") {
            setQnaText(analyzeData.qna);
          }

        } catch (error) {
          console.error("Error processing PDF:", error);
          alert("Error processing PDF. Please try again.");
        } finally {
        setLoading(false);
      }
    },
    onUploadError: (error: Error) => {
      setLoading(false);
      alert(`ERROR! ${error.message}`);
    },
  },
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCustomInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    if (file) {
      setLoading(true);
      startUpload([file]);
    } else {
      alert("Please select a file first.");
    }
  };

  return (
    <section className="min-h-screen">
      <BgGradient />

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="relative p-[1px] overflow-hidden rounded-full bg-linear-to-r from-rose-200 via-rose-500 to-rose-800 animate-gradient-x group">
            <Badge
              variant="secondary"
              className="relative px-6 py-2 text-base font-medium bg-white rounded-full group-hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="h-6 w-6 mr-2 text-rose-600 animate-pulse" />
              <p className="text-base">AI-Powered Content Creation</p>
            </Badge>
          </div>

          <h1 className="font-bold text-4xl mb-5 mt-5">Start Uploading Your PDF's</h1>
          <p className=" text-2xl mb-5">
            Upload your PDF and let our AI do the magic! ✨
          </p>
          <div className="flex items-center justify-center w-full max-w-lg">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className="flex-grow h-12 px-4 text-lg text-gray-500 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-center cursor-pointer flex items-center justify-center"
              onClick={handleCustomInputClick}
            >
              {file?.name || "Select a PDF file"}
            </div>
            <Button
              onClick={handleUploadClick}
              disabled={loading || !file}
              className="h-12 px-8 bg-rose-600 text-white rounded-r-lg font-semibold text-lg shadow-lg shadow-rose-500/40 hover:bg-rose-700 hover:shadow-rose-500/60 transition"
            >
              Upload
            </Button>
          </div>

          {loading && (
            <div className="mt-8">
              <p className="text-lg">Generating content, please wait...</p>
            </div>
          )}

          {summary && (
            <div className="mt-8 text-left w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Summary</h2>
              <p className="text-lg leading-relaxed">{summary}</p>
            </div>
          )}

          {highlights.length > 0 && (
            <div className="mt-8 text-left w-full max-w-4xl">
              <h3 className="text-xl font-semibold mb-3">Highlights</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="rounded-xl border border-rose-200 bg-white/80 p-4 text-sm text-gray-700 shadow-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {keyTerms.length > 0 && (
            <div className="mt-8 text-left w-full max-w-4xl">
              <h3 className="text-xl font-semibold mb-3">Key Terms</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {keyTerms.map((term, idx) => (
                  <div key={`${term.term}-${idx}`} className="rounded-2xl border border-rose-200 bg-gradient-to-br from-white to-rose-50 p-4 shadow-sm">
                    <div className="text-sm font-semibold text-rose-700">{term.term}</div>
                    <div className="mt-2 text-sm text-gray-700">{term.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {qna.length > 0 && (
            <div className="mt-8 text-left w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Questions & Answers</h2>
              <div className="grid gap-4">
                {qna.map((item, idx) => (
                  <div key={`${item.question}-${idx}`} className="rounded-2xl border border-rose-200 bg-white/80 p-5 shadow-sm">
                    <div className="text-base font-semibold text-gray-900">{item.question}</div>
                    <div className="mt-2 text-sm text-gray-700">{item.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {qnaText && (
            <div className="mt-8 text-left w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Questions & Answers</h2>
              <div className="rounded-2xl border border-rose-200 bg-white/80 p-5 text-sm text-gray-700 whitespace-pre-line">
                {qnaText}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
