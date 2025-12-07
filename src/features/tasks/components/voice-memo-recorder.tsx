import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Play, Pause, Trash2, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadTaskAttachment } from '@/hooks/useTasks'
import { VOICE_MEMO_TYPES } from '@/services/tasksService'

interface VoiceMemoRecorderProps {
  taskId: string
  onUploadSuccess?: () => void
}

export function VoiceMemoRecorder({ taskId, onUploadSuccess }: VoiceMemoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const uploadMutation = useUploadTaskAttachment()

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Try to use webm format, fallback to mp4 if not supported
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType.split(';')[0] })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('لا يمكن الوصول إلى الميكروفون')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const uploadVoiceMemo = useCallback(async () => {
    if (!chunksRef.current.length) return

    setUploadProgress(0)

    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'
    const blob = new Blob(chunksRef.current, { type: mimeType.split(';')[0] })
    const file = new File([blob], `voice-memo-${Date.now()}.${extension}`, {
      type: mimeType.split(';')[0]
    })

    uploadMutation.mutate(
      {
        id: taskId,
        file,
        onProgress: setUploadProgress
      },
      {
        onSuccess: () => {
          discardRecording()
          onUploadSuccess?.()
        }
      }
    )
  }, [taskId, uploadMutation, onUploadSuccess])

  const discardRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setAudioUrl(null)
    setIsPlaying(false)
    chunksRef.current = []
    setDuration(0)
    setUploadProgress(0)
  }, [audioUrl])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="voice-memo-recorder p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <Mic className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">تسجيل صوتي</span>
      </div>

      {/* Recording Controls */}
      {!audioUrl && (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Mic className="h-4 w-4 ms-2" />
              بدء التسجيل
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-red-600">
                <span className="animate-pulse">
                  <MicOff className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">جاري التسجيل</span>
              </div>
              <span className="text-sm font-mono text-slate-600">{formatTime(duration)}</span>
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="sm"
              >
                إيقاف
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview & Upload */}
      {audioUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-slate-600">{formatTime(duration)}</span>
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && uploadProgress > 0 && (
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={uploadVoiceMemo}
              disabled={uploadMutation.isPending}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
              ) : (
                <Upload className="h-4 w-4 ms-2" />
              )}
              رفع التسجيل
            </Button>
            <Button
              onClick={discardRecording}
              disabled={uploadMutation.isPending}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 ms-2" />
              حذف
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Voice memo player component for playback
interface VoiceMemoPlayerProps {
  audioUrl: string
  fileName: string
}

export function VoiceMemoPlayer({ audioUrl, fileName }: VoiceMemoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="voice-memo-player flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <Button
        onClick={togglePlay}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <Mic className="h-4 w-4 text-blue-500" />
      <span className="text-sm text-blue-800 truncate flex-1">{fileName}</span>
      <span className="text-xs text-blue-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={(e) => {
          if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value)
          }
        }}
        className="w-20 h-1 accent-blue-500"
      />
    </div>
  )
}

// Helper function to check if an attachment is a voice memo
export function isVoiceMemo(fileType: string): boolean {
  return VOICE_MEMO_TYPES.includes(fileType as any)
}
