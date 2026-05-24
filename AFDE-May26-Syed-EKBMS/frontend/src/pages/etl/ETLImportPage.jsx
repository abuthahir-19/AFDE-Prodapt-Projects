import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Upload, FileText, CheckCircle, XCircle, Clock, ChevronDown,
  ChevronUp, Download, AlertCircle, Database,
} from 'lucide-react'
import toast from 'react-hot-toast'
import etlService from '../../services/etlService.js'

const STATUS_CONFIG = {
  completed: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle },
  failed: { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
  processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock },
  pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function JobRow({ job }) {
  const [expanded, setExpanded] = useState(false)
  const errors = (() => {
    try { return job.error_details ? JSON.parse(job.error_details) : [] } catch { return [] }
  })()

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-3 bg-white hover:bg-gray-50">
        <FileText size={16} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{job.filename}</p>
          <p className="text-xs text-gray-500">{new Date(job.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={job.status} />
        <div className="text-right text-xs text-gray-500 min-w-[120px]">
          <span className="text-green-600 font-medium">{job.imported_records} imported</span>
          {job.failed_records > 0 && (
            <span className="text-red-500 font-medium ml-2">{job.failed_records} failed</span>
          )}
          <span className="text-gray-400 ml-2">/ {job.total_records} total</span>
        </div>
        {errors.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {expanded && errors.length > 0 && (
        <div className="bg-red-50 border-t border-red-100 px-5 py-3">
          <p className="text-xs font-medium text-red-700 mb-2">Import Errors</p>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-600 flex gap-2">
                <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ETLImportPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['etl-jobs'],
    queryFn: etlService.getJobs,
  })

  const importMutation = useMutation({
    mutationFn: (file) => etlService.importFile(file),
    onSuccess: (result) => {
      setLastResult(result)
      queryClient.invalidateQueries({ queryKey: ['etl-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      if (result.failed_records === 0) {
        toast.success(`Imported ${result.imported_records} articles successfully!`)
      } else {
        toast(`Imported ${result.imported_records} articles. ${result.failed_records} rows failed.`, {
          icon: '⚠️',
        })
      }
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Import failed')
    },
  })

  const handleFile = (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'json'].includes(ext)) {
      toast.error('Only .csv and .json files are supported')
      return
    }
    setLastResult(null)
    importMutation.mutate(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database size={24} className="text-blue-600" />
          ETL Article Import
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bulk import articles from CSV or JSON files. Categories and tags are created automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Drop zone */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !importMutation.isPending && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : importMutation.isPending
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
                disabled={importMutation.isPending}
              />
              {importMutation.isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-600 font-medium">Processing import...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                    <Upload size={28} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Drop your file here or click to browse</p>
                    <p className="text-sm text-gray-400 mt-1">Supports .csv and .json files</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result summary */}
          {lastResult && (
            <div className={`rounded-xl border p-5 ${
              lastResult.failed_records === 0
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {lastResult.failed_records === 0
                  ? <CheckCircle size={18} className="text-green-600" />
                  : <AlertCircle size={18} className="text-yellow-600" />}
                <p className="font-semibold text-gray-800">Import Complete — {lastResult.filename}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{lastResult.total_records}</p>
                  <p className="text-xs text-gray-500">Total Records</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{lastResult.imported_records}</p>
                  <p className="text-xs text-gray-500">Imported</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{lastResult.failed_records}</p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
              </div>
              {lastResult.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {lastResult.errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-xs text-red-600 flex gap-1.5">
                      <AlertCircle size={12} className="flex-shrink-0 mt-0.5" /> {err}
                    </p>
                  ))}
                  {lastResult.errors.length > 5 && (
                    <p className="text-xs text-gray-500">…and {lastResult.errors.length - 5} more errors</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Format guide */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">CSV Format</h3>
            <p className="text-xs text-gray-500 mb-2">Required columns:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li><span className="font-mono bg-gray-100 px-1 rounded">title</span> — Article title</li>
              <li><span className="font-mono bg-gray-100 px-1 rounded">content</span> — Full body text</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3 mb-2">Optional columns:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li><span className="font-mono bg-gray-100 px-1 rounded">description</span></li>
              <li><span className="font-mono bg-gray-100 px-1 rounded">category</span></li>
              <li><span className="font-mono bg-gray-100 px-1 rounded">tags</span> — comma-separated</li>
              <li><span className="font-mono bg-gray-100 px-1 rounded">status</span> — published/draft</li>
              <li><span className="font-mono bg-gray-100 px-1 rounded">views</span> — integer</li>
            </ul>
            <a
              href={etlService.getSampleUrl()}
              download
              className="mt-4 flex items-center gap-2 text-xs text-blue-600 hover:underline font-medium"
            >
              <Download size={13} /> Download sample CSV
            </a>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">JSON Format</h3>
            <pre className="text-xs bg-gray-50 rounded p-3 overflow-auto text-gray-600">{`[
  {
    "title": "...",
    "content": "...",
    "description": "...",
    "category": "HR",
    "tags": "hr,policy",
    "status": "published",
    "views": 100
  }
]`}</pre>
          </div>
        </div>
      </div>

      {/* Job History */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import History</h2>
        {jobsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Database size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No imports yet. Upload a file to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => <JobRow key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  )
}
