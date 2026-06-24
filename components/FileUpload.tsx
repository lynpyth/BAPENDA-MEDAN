"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X, FileText } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  endpoint: "newsImage" | "identityKtp" | "researchDocument";
  value?: string;
  onChange: (url?: string) => void;
}

export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && endpoint !== "researchDocument") {
    return (
      <div className="relative h-40 w-40">
        <Image fill src={value} alt="Upload" sizes="160px" className="rounded-2xl object-cover border-2 border-primary/20" />
        <button
          onClick={() => onChange("")}
          className="bg-red-500 text-white p-1.5 rounded-full absolute -top-2 -right-2 shadow-lg hover:scale-110 transition-transform"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && endpoint === "researchDocument") {
    return (
      <div className="relative flex items-center p-4 mt-2 rounded-2xl bg-primary/5 border border-primary/20">
        <FileText className="h-10 w-10 text-primary mr-3" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary truncate">{value}</p>
          <p className="text-xs text-muted-foreground uppercase">{fileType}</p>
        </div>
        <button
          onClick={() => onChange("")}
          className="bg-red-500 text-white p-1.5 rounded-full absolute -top-2 -right-2 shadow-lg hover:scale-110 transition-transform"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res: { url: string }[] | undefined) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        alert(error.message);
      }}
      appearance={{
        button: "bg-primary text-white font-bold rounded-xl",
        container: "border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5 p-8",
        label: "text-primary font-bold hover:text-primary/80",
      }}
      content={{
        label: ({ isUploading }: { isUploading: boolean }) =>
          isUploading ? "Mengunggah..." : "Seret file ke sini atau klik untuk pilih",
      }}
    />
  );
};
