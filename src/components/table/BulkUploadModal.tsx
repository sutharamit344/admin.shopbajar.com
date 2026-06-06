// src/components/table/BulkUploadModal.tsx
import React, { useState, useRef, useEffect } from "react";
import { DocumentArrowUpIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import {
  TbFileUpload,
} from "react-icons/tb";
import * as XLSX from "xlsx";
import { Button } from "../common/Button";
import toast from "react-hot-toast";
import { NameDialog } from "../dialog/Dialog";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeDialog } from "../../store/dialogSlice";

interface BulkUploadModalProps {
  dialogName: string;
  onUpload: (data: any[]) => Promise<void>;
  template?: {
    key: string;
    header?: string;
    required?: boolean;
    example?: string;
    description?: string;
  }[];
  mapping?: Record<string, string>;
  validateRow?: (
    row: any,
    index: number,
  ) => { valid: boolean; errors?: string[] };
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  fileName?: string;
  onSuccess?: (count: number) => void;
  onClose?: () => void;
  allowJson?: boolean;
  allowCsv?: boolean;
  allowExcel?: boolean;
  allowPaste?: boolean;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  dialogName,
  onUpload,
  template,
  mapping,
  validateRow,
  maxFileSize = 10,
  allowedFileTypes: propAllowedFileTypes,
  fileName = "data",
  onSuccess,
  onClose,
  allowJson = true,
  allowCsv = true,
  allowExcel = true,
}) => {
  const dispatch = useAppDispatch();
  const dialog = useAppSelector((state) => state.dialog.dialog);
  const isOpen = dialog[dialogName] && dialog[dialogName].length > 0;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "mapping" | "paste">("upload");
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    mapping || {},
  );
  const [pasteData, setPasteData] = useState("");
  const [pasteFormat] = useState<"csv" | "json">("csv");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAllowedFileTypes = (): string[] => {
    const types: string[] = [];
    if (allowExcel) types.push(".xlsx", ".xls");
    if (allowCsv) types.push(".csv");
    if (allowJson) types.push(".json");
    return types;
  };

  const allowedFileTypes = propAllowedFileTypes || getAllowedFileTypes();


  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview([]);
      setErrors([]);
      setStep("upload");
      setPasteData("");
      setColumnMapping(mapping || {});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, mapping]);

  const handlePasteData = async () => {
    if (!pasteData.trim()) {
      toast.error("Please paste some data");
      return;
    }

    try {
      let data: any[] = [];
      if (pasteFormat === "json") {
        data = await parseJsonData(pasteData);
      } else {
        data = await parseCsvData(pasteData);
      }

      if (data.length === 0) {
        toast.error("No data rows found");
        return;
      }

      setPreview(data.slice(0, 5));

      if (template && data.length > 0) {
        const headers = Object.keys(data[0]);
        const autoMapping: Record<string, string> = {};

        template.forEach((col) => {
          let matchedHeader = headers.find((h) => h === col.key);
          if (!matchedHeader && col.header) {
            matchedHeader = headers.find((h) => h === col.header);
          }
          if (!matchedHeader) {
            matchedHeader = headers.find(
              (h) =>
                h.toLowerCase() === col.key.toLowerCase() ||
                (col.header && h.toLowerCase() === col.header.toLowerCase()),
            );
          }
          if (matchedHeader) {
            autoMapping[col.key] = matchedHeader;
          }
        });
        setColumnMapping(autoMapping);
      }

      setStep("preview");
    } catch (error: any) {
      toast.error(error.message || "Failed to parse pasted data");
    }
  };

  const parseJsonData = (jsonString: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      try {
        const jsonData = JSON.parse(jsonString);
        let data = Array.isArray(jsonData) ? jsonData : [jsonData];
        resolve(data);
      } catch (error) {
        reject(new Error("Invalid JSON format"));
      }
    });
  };

  const parseCsvData = (csvString: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      try {
        const lines = csvString.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          resolve([]);
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });
          return obj;
        });
        resolve(rows);
      } catch (error) {
        reject(new Error("Invalid CSV format"));
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxFileSize * 1024 * 1024) {
      toast.error(`File size should be less than ${maxFileSize}MB`);
      return;
    }

    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (!allowedFileTypes.includes(fileExt)) {
      toast.error(`Allowed file types: ${allowedFileTypes.join(", ")}`);
      return;
    }

    setFile(selectedFile);
    try {
      let data: any[] = [];
      if (fileExt === ".json") {
        data = await readJsonFile(selectedFile);
      } else if (fileExt === ".csv") {
        data = await readCsvFile(selectedFile);
      } else {
        data = await readExcelFile(selectedFile);
      }

      if (data.length === 0) {
        toast.error("No data rows found in file");
        return;
      }

      setPreview(data.slice(0, 5));
      if (template && data.length > 0) {
        const headers = Object.keys(data[0]);
        const autoMapping: Record<string, string> = {};
        template.forEach((col) => {
          let matchedHeader = headers.find((h) => h === col.key);
          if (!matchedHeader && col.header) matchedHeader = headers.find((h) => h === col.header);
          if (matchedHeader) autoMapping[col.key] = matchedHeader;
        });
        setColumnMapping(autoMapping);
      }
      setStep("preview");
    } catch (error) {
      toast.error("Failed to read file");
    }
  };

  const readJsonFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          resolve(Array.isArray(jsonData) ? jsonData : [jsonData]);
        } catch (error) {
          reject(new Error("Invalid JSON format"));
        }
      };
      reader.readAsText(file);
    });
  };

  const readCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split("\n").filter((line) => line.trim());
          if (lines.length < 2) { resolve([]); return; }
          const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
          const rows = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => { obj[header] = values[index] || ""; });
            return obj;
          });
          resolve(rows);
        } catch (error) { reject(new Error("Invalid CSV format")); }
      };
      reader.readAsText(file);
    });
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", blankrows: false });
          if (!jsonData || jsonData.length < 2) { resolve([]); return; }
          const headers = (jsonData[0] as any[]).map((h) => h?.toString().trim() || "").filter((h) => h !== "");
          const rows = jsonData.slice(1).map((row: any) => {
            const obj: Record<string, any> = {};
            headers.forEach((header, colIndex) => { obj[header] = row[colIndex]?.toString().trim() || ""; });
            return obj;
          });
          resolve(rows);
        } catch (error) { reject(error); }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const validateData = (data: any[]): { valid: boolean; errors: string[] } => {
    const allErrors: string[] = [];
    data.forEach((row, index) => {
      const rowNumber = index + 2;
      if (template) {
        template.forEach((col) => {
          if (col.required) {
            const mappedHeader = columnMapping[col.key];
            const value = row[mappedHeader];
            if (value === undefined || value === null || value.toString().trim() === "") {
              allErrors.push(`Row ${rowNumber}: ${col.header || col.key} is required`);
            }
          }
        });
      }
      if (validateRow) {
        const mappedRow: Record<string, any> = {};
        Object.entries(columnMapping).forEach(([key, mappedHeader]) => {
          mappedRow[key] = row[mappedHeader];
        });
        const result = validateRow(mappedRow, index);
        if (!result.valid && result.errors) allErrors.push(...result.errors);
      }
    });
    return { valid: allErrors.length === 0, errors: allErrors };
  };

  const handleUpload = async () => {
    if (!file && !pasteData) return;
    setUploading(true);
    try {
      let data: any[] = [];
      if (pasteData) {
        data = pasteFormat === "json" ? await parseJsonData(pasteData) : await parseCsvData(pasteData);
      } else {
        const fileExt = file!.name.substring(file!.name.lastIndexOf(".")).toLowerCase();
        data = fileExt === ".json" ? await readJsonFile(file!) : fileExt === ".csv" ? await readCsvFile(file!) : await readExcelFile(file!);
      }

      const { valid, errors: validationErrors } = validateData(data);
      if (!valid) {
        setErrors(validationErrors);
        return;
      }

      const mappedData = data.map((row) => {
        const mappedRow: Record<string, any> = {};
        Object.entries(columnMapping).forEach(([key, mappedHeader]) => {
          mappedRow[key] = row[mappedHeader];
        });
        return mappedRow;
      });

      await onUpload(mappedData);
      onSuccess?.(mappedData.length);
      handleClose();
    } catch (error: any) {
      setErrors([error.message]);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    dispatch(closeDialog(dialogName));
    if (onClose) onClose();
  };

  const downloadTemplate = () => {
    if (!template) return;
    const headers = template.map((col) => col.header || col.key);
    const exampleRow = template.map((col) => col.example || "");
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${fileName}_template.xlsx`);
  };

  return (
    <NameDialog
      dialogName={dialogName}
      title={`Bulk Upload ${fileName}`}
      size="xl"
      onClose={handleClose}
      showCancel={false}
    >
      <div className="flex border-b border-gray-200 mb-4">
        <button onClick={() => setStep("upload")} className={`px-4 py-2 text-sm font-medium ${step === "upload" ? "border-b-2 border-primary-500 text-primary-600" : "text-gray-500"}`}>Upload File</button>
        <button onClick={() => setStep("paste")} className={`px-4 py-2 text-sm font-medium ${step === "paste" ? "border-b-2 border-primary-500 text-primary-600" : "text-gray-500"}`}>Paste Data</button>
      </div>

      {step === "upload" && (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
          <input ref={fileInputRef} type="file" accept={allowedFileTypes.join(",")} onChange={handleFileChange} className="hidden" />
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={() => fileInputRef.current?.click()} leftIcon={<TbFileUpload />}>Select File</Button>
            {template && <Button variant="outline" size="sm" onClick={downloadTemplate}>Download Template</Button>}
          </div>
        </div>
      )}

      {step === "paste" && (
        <div>
          <textarea rows={8} value={pasteData} onChange={(e) => setPasteData(e.target.value)} placeholder="Paste data here..." className="w-full px-4 py-3 border rounded-md font-mono text-sm" />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPasteData("")}>Clear</Button>
            <Button onClick={handlePasteData} leftIcon={<ClipboardDocumentIcon />}>Process Data</Button>
          </div>
        </div>
      )}

      {step === "preview" && preview.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Preview (First 5 rows)</h4>
          <div className="overflow-x-auto max-h-64 border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>{Object.keys(preview[0]).map((h) => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="bg-white divide-y">
                {preview.map((row, idx) => <tr key={idx}>{Object.values(row).map((val: any, vIdx) => <td key={vIdx} className="px-3 py-2 text-sm text-gray-500">{val?.toString() || "-"}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          {errors.length > 0 && <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs">{errors.map((e, i) => <div key={i}>{e}</div>)}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
            <Button onClick={handleUpload} isLoading={uploading}>Upload</Button>
          </div>
        </div>
      )}
    </NameDialog>
  );
};
