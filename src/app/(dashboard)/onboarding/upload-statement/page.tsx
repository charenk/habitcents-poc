'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadStatementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully processed ${data.transaction_count} transactions!`);
        router.push('/dashboard');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload statement');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue p-4">
      <div className="max-w-md mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 p-0 text-navy hover:text-navy/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Upload Statement
          </h1>
          <p className="text-muted-foreground">
            Upload your bank statement PDF for analysis
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-light-blue rounded-full">
                <FileText className="h-6 w-6 text-navy" />
              </div>
              <div>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
                <CardDescription>
                  PDF bank statements from any Canadian bank
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>PDF format only</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Maximum 10MB file size</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Any Canadian bank</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>AI-powered extraction</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-navy bg-navy/5'
                : file
                ? 'border-success bg-success/5'
                : 'border-muted-foreground/25 hover:border-navy/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {file ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-success mx-auto" />
                <p className="font-medium text-success">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium">
                    {dragActive ? 'Drop your PDF here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF files up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {file && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span>Important Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Make sure your statement contains transaction details</li>
                <li>• The AI will extract and categorize transactions automatically</li>
                <li>• You can review and correct any misclassified transactions</li>
                <li>• Processing may take a few moments</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full rounded-full bg-navy hover:bg-navy/90 text-white h-12 text-lg"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Upload & Process'
          )}
        </Button>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Your statement is processed securely and never stored permanently.
          </p>
        </div>
      </div>
    </div>
  );
}
