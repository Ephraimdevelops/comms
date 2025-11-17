'use client'

import { useState } from 'react'
import { Upload, File, Loader2, CheckCircle2 } from 'lucide-react'

interface FileUploadProps {
  organizationId: string
}

export function FileUpload({ organizationId }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('language', 'en')

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadSuccess(true)
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          console.error('Upload failed')
        }
        setIsUploading(false)
      })

      xhr.addEventListener('error', () => {
        console.error('Upload error')
        setIsUploading(false)
      })

      xhr.open('POST', '/api/uploads')
      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  return (
    <div className="card-elevated">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-title">Upload Knowledge</h2>
      </div>
      
      {uploadSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">File uploaded successfully!</span>
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-accent bg-accent/5 scale-[1.02]'
            : 'border-border bg-muted/30 hover:border-accent/50 hover:bg-muted/50'
        } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 text-accent animate-spin" />
            </div>
            <div>
              <p className="text-body font-semibold text-foreground mb-2">Uploading...</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-caption mt-2">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto">
              <File className="w-10 h-10 text-accent" />
            </div>
            
            <div>
              <p className="text-subhead font-semibold text-foreground mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-body text-muted-foreground">
                PDF, DOCX, TXT, MP4, MP3 files up to 50MB
              </p>
            </div>
            
            <input
              type="file"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.txt,.mp4,.mp3"
              disabled={isUploading}
            />
            
            <label
              htmlFor="file-upload"
              className="btn-primary inline-flex cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
