import React, { useState } from "react";
import { Upload, FileText, Download, AlertCircle, Eye } from "lucide-react";

const PDFTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [useOCR, setUseOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");

  const loadTesseract = () => {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js";
      script.onload = () => {
        // Wait longer for Tesseract to fully initialize
        setTimeout(() => {
          if (window.Tesseract && window.Tesseract.recognize) {
            resolve();
          } else {
            reject(new Error("Tesseract failed to load properly"));
          }
        }, 500);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadPDFJS = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setTimeout(resolve, 100);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setExtractedText("");
    setLoading(true);

    try {
      await loadPDFJS();
      await loadPDFInfo(uploadedFile);
    } catch (err) {
      setError("Error loading PDF library or file");
    } finally {
      setLoading(false);
    }
  };

  const loadPDFInfo = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
      setEndPage(pdf.numPages);
    } catch (err) {
      console.error("PDF loading error:", err);
      setError("Error loading PDF file. Please try a different file.");
    }
  };

  const extractTextWithOCR = async (page, pageNum) => {
    try {
      setOcrProgress(`Rendering page ${pageNum} for OCR...`);

      // Render page to canvas with higher quality
      const viewport = page.getViewport({ scale: 3.0 }); // Higher scale for better OCR
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      setOcrProgress(`Running OCR on page ${pageNum}...`);

      // Convert canvas to blob for better quality
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0)
      );

      // Create worker for this specific recognition
      const worker = await window.Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(
              `OCR Progress: ${Math.round(m.progress * 100)}% (Page ${pageNum})`
            );
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(blob, {
        tessedit_pageseg_mode: window.Tesseract.PSM.AUTO,
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:()[]{}\"-'",
      });

      await worker.terminate();

      return text.trim() || `[No text detected on page ${pageNum}]`;
    } catch (error) {
      console.error(`OCR error on page ${pageNum}:`, error);
      setOcrProgress(`OCR failed on page ${pageNum}: ${error.message}`);

      // Fallback: try with canvas data URL
      try {
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport })
          .promise;
        const imageData = canvas.toDataURL("image/png");

        const result = await window.Tesseract.recognize(imageData, "eng");
        return (
          result.data.text.trim() || `[No text detected on page ${pageNum}]`
        );
      } catch (fallbackError) {
        console.error(
          `Fallback OCR also failed on page ${pageNum}:`,
          fallbackError
        );
        return `[OCR completely failed on page ${pageNum}]`;
      }
    }
  };

  const extractText = async () => {
    if (!file || !window.pdfjsLib) {
      setError("PDF library not loaded. Please try uploading the file again.");
      return;
    }

    setLoading(true);
    setError("");
    setOcrProgress("");

    try {
      if (useOCR) {
        setOcrProgress("Loading OCR engine...");
        await loadTesseract();
        setOcrProgress("OCR engine loaded successfully");
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;

      const start = Math.max(1, parseInt(startPage) || 1);
      const end = Math.min(pdf.numPages, parseInt(endPage) || pdf.numPages);

      if (start > end) {
        setError("Start page cannot be greater than end page");
        setLoading(false);
        return;
      }

      if (start > pdf.numPages || end < 1) {
        setError("Invalid page range");
        setLoading(false);
        return;
      }

      let fullText = "";

      for (let pageNum = start; pageNum <= end; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          let pageText = "";

          if (!useOCR) {
            const textContent = await page.getTextContent();

            if (textContent.items.length > 0) {
              const sortedItems = textContent.items.sort((a, b) => {
                if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
                  return b.transform[5] - a.transform[5];
                }
                return a.transform[4] - b.transform[4];
              });

              let lastY = null;
              sortedItems.forEach((item) => {
                const currentY = item.transform[5];

                if (lastY !== null && Math.abs(lastY - currentY) > 5) {
                  pageText += "\n";
                }

                if (
                  item.str.trim() &&
                  pageText &&
                  !pageText.endsWith("\n") &&
                  !pageText.endsWith(" ")
                ) {
                  pageText += " ";
                }

                pageText += item.str;
                lastY = currentY;
              });
            }

            if (!pageText.trim()) {
              setOcrProgress(
                `No text found on page ${pageNum}, loading OCR...`
              );
              try {
                await loadTesseract();
                setOcrProgress("OCR loaded, processing page...");
                pageText = await extractTextWithOCR(page, pageNum);
              } catch (ocrError) {
                console.error("OCR loading failed:", ocrError);
                pageText = `[OCR unavailable for page ${pageNum}]`;
              }
            }
          } else {
            pageText = await extractTextWithOCR(page, pageNum);
          }

          if (pageText.trim()) {
            fullText += `--- Page ${pageNum} ---\n${pageText.trim()}\n\n`;
          } else {
            fullText += `--- Page ${pageNum} ---\n[No readable text found on this page]\n\n`;
          }
        } catch (pageError) {
          console.error(`Error extracting page ${pageNum}:`, pageError);
          fullText += `--- Page ${pageNum} ---\n[Error reading this page]\n\n`;
        }
      }

      if (fullText.trim()) {
        setExtractedText(fullText);
      } else {
        setError("No text could be extracted from the selected pages.");
      }
    } catch (err) {
      console.error("Text extraction error:", err);
      setError("Error extracting text from PDF. Please try a different file.");
    } finally {
      setLoading(false);
      setOcrProgress("");
    }
  };

  const downloadText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-text-pages-${startPage}-${endPage}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PDF Text Extractor
          </h1>
          <p className="text-gray-600">
            Upload a PDF and extract text from specific pages
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select PDF File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  {file ? file.name : "Click to upload PDF file"}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF files up to 50MB
                </p>
              </label>
            </div>
          </div>

          {file && totalPages > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select Page Range (Total: {totalPages} pages)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {file && totalPages > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="use-ocr"
                  checked={useOCR}
                  onChange={(e) => setUseOCR(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="use-ocr"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Use OCR for scanned documents (slower but works with
                  image-based PDFs)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Enable this option if your PDF contains scanned images or if
                regular extraction shows "[No readable text found]"
              </p>
            </div>
          )}

          {file && (
            <div className="mb-6">
              <button
                onClick={extractText}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                {loading
                  ? useOCR
                    ? "Processing with OCR..."
                    : "Extracting Text..."
                  : "Extract Text"}
              </button>
              {ocrProgress && (
                <p className="text-sm text-blue-600 mt-2 text-center">
                  {ocrProgress}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {extractedText && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Extracted Text (Pages {startPage}-{endPage})
                </h3>
                <button
                  onClick={downloadText}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download TXT
                </button>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How to Use
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>
              1. Click the upload area to select a PDF file from your device
            </p>
            <p>
              2. Once uploaded, specify the page range you want to extract text
              from
            </p>
            <p>
              3. Enable OCR if your PDF contains scanned images or shows "No
              readable text found"
            </p>
            <p>4. Click "Extract Text" to process the selected pages</p>
            <p>5. Review the extracted text and download it as a TXT file</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>OCR Feature:</strong> If your PDF shows "[No readable
                text found]", enable the OCR option. This uses optical character
                recognition to read text from scanned images, but takes longer
                to process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTextExtractor;
