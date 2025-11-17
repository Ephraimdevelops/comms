'use client'

import { formatDistanceToNow } from 'date-fns'
import { FileText, File, Video, Music, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

interface FileListProps {
  organizationId: string
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' }
  if (fileType.includes('word') || fileType.includes('document')) return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' }
  if (fileType.includes('video')) return { icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' }
  if (fileType.includes('audio')) return { icon: Music, color: 'text-green-500', bg: 'bg-green-50' }
  return { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' }
}

const getProcessingStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Processed', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 }
    case 'processing':
      return { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock }
    case 'failed':
      return { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50', icon: Trash2 }
    default:
      return { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock }
  }
}

export function FileList({ organizationId }: FileListProps) {
  const files = useQuery(
    api.files.getByOrganization,
    organizationId ? { organizationId: organizationId as any } : "skip"
  )

  if (!files) {
    return (
      <div className="card-elevated">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const totalChunks = files.reduce((sum, file) => sum + (file.knowledgeChunks?.length || 0), 0)
  const totalSize = files.reduce((sum, file) => sum + file.sizeBytes, 0)

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-title mb-1">Uploaded Files</h2>
          <p className="text-caption">
            {files.length} files • {totalChunks} chunks • {(totalSize / 1024 / 1024).toFixed(1)}MB
          </p>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <File className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-title mb-2">No files uploaded yet</h3>
          <p className="text-body text-muted-foreground">
            Upload documents to train your AI assistant
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => {
            const fileIcon = getFileIcon(file.fileType)
            const status = getProcessingStatus(file.processingStatus || 'pending')
            const StatusIcon = status.icon
            const FileIcon = fileIcon.icon

            return (
              <div
                key={file._id}
                className="group p-5 rounded-xl border bg-white hover:border-accent/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 ${fileIcon.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <FileIcon className={`w-6 h-6 ${fileIcon.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-body font-semibold text-foreground truncate">
                          {file.filename}
                        </p>
                        <div className={`px-2 py-0.5 ${status.bg} rounded-full flex items-center space-x-1`}>
                          <StatusIcon className={`w-3 h-3 ${status.color}`} />
                          <span className={`text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-caption">
                        <span>{(file.sizeBytes / 1024 / 1024).toFixed(1)}MB</span>
                        <span>•</span>
                        <span>{file.language || 'en'}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(file.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <div className="px-3 py-1.5 bg-gradient-to-br from-accent/10 to-blue-100 rounded-full border border-accent/20">
                      <div className="text-sm font-semibold text-accent">
                        {file.knowledgeChunks?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">chunks</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
