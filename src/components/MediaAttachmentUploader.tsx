import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  Upload,
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  AlertCircle,
  Film,
  Image as ImageIcon,
  Sparkles,
  StopCircle,
} from "lucide-react";

export interface AttachedMedia {
  type: "image" | "video";
  file?: File;
  dataUrl: string;
  name: string;
  sizeMb: number;
  durationSec?: number;
}

interface MediaAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaAttached: (media: AttachedMedia) => void;
  existingMedia: AttachedMedia | null;
  onRemoveMedia: () => void;
}

export const MediaAttachmentModal: React.FC<MediaAttachmentModalProps> = ({
  isOpen,
  onClose,
  onMediaAttached,
  existingMedia,
  onRemoveMedia,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<AttachedMedia | null>(existingMedia);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync preview when opening
  useEffect(() => {
    if (isOpen) {
      setPreviewMedia(existingMedia);
      setErrorMessage(null);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, existingMedia]);

  // Stop camera when closing
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecordingVideo(false);
    setVideoDuration(0);
  };

  // Start Camera for photo/video
  const startCamera = async (mode: "photo" | "video") => {
    stopCamera();
    setCameraError(null);
    setCameraMode(mode);

    try {
      const constraints: MediaStreamConstraints = {
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
        audio: mode === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError("Camera access was not permitted. You can upload an image or video file directly instead.");
    }
  };

  useEffect(() => {
    if (activeTab === "camera" && isOpen) {
      startCamera(cameraMode);
    } else {
      stopCamera();
    }
  }, [activeTab]);

  // Handle Capture Photo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const media: AttachedMedia = {
      type: "image",
      dataUrl,
      name: `Photo_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.jpg`,
      sizeMb: Number((dataUrl.length / (1024 * 1024)).toFixed(2)),
    };

    setPreviewMedia(media);
    stopCamera();
    setActiveTab("upload");
  };

  // Handle Record Short Video (Max 60 seconds)
  const startVideoRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    setVideoDuration(0);

    try {
      const recorder = new MediaRecorder(cameraStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : undefined,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const media: AttachedMedia = {
          type: "video",
          dataUrl: url,
          name: `Video_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.webm`,
          sizeMb: Number((blob.size / (1024 * 1024)).toFixed(2)),
          durationSec: videoDuration || 1,
        };
        setPreviewMedia(media);
        stopCamera();
        setActiveTab("upload");
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);

      // 60-second limit timer
      recordTimerRef.current = setInterval(() => {
        setVideoDuration((prev) => {
          if (prev >= 59) {
            stopVideoRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setCameraError("Video recording failed: " + (err?.message || "Format unsupported"));
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecordingVideo(false);
  };

  // Handle File Input Selection
  const processUploadedFile = (file: File) => {
    setErrorMessage(null);
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setErrorMessage("Please upload an image (JPG, PNG, WEBP) or a short video (MP4, WEBM, MOV).");
      return;
    }

    // Size limit check (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File is too large. Please select a photo or video under 50MB.");
      return;
    }

    if (isVideo) {
      // Check video duration (max 1 minute = 60s)
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration > 65) {
          setErrorMessage(
            `Video duration is ${Math.round(tempVideo.duration)}s. Please upload a short video under 1 minute (60 seconds).`
          );
        } else {
          const media: AttachedMedia = {
            type: "video",
            file,
            dataUrl: url,
            name: file.name,
            sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
            durationSec: Math.round(tempVideo.duration),
          };
          setPreviewMedia(media);
        }
      };
      tempVideo.onerror = () => {
        // Allow fallback if metadata cannot be parsed
        const media: AttachedMedia = {
          type: "video",
          file,
          dataUrl: url,
          name: file.name,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
          durationSec: 30,
        };
        setPreviewMedia(media);
      };
    } else {
      // Image reader
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const media: AttachedMedia = {
          type: "image",
          file,
          dataUrl,
          name: file.name,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
        };
        setPreviewMedia(media);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmMedia = () => {
    if (previewMedia) {
      onMediaAttached(previewMedia);
      onClose();
    }
  };

  const handleClearPreview = () => {
    setPreviewMedia(null);
    onRemoveMedia();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Add Photo or 1-Min Video</h3>
              <p className="text-xs text-slate-400">
                Show Scouts and Wholesalers exactly what item or machinery you need.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Upload File vs Take Photo/Video */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-4 text-xs sm:text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "upload"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File from Device</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              startCamera(cameraMode);
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "camera"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera / Video (1 min)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Error Message */}
          {(errorMessage || cameraError) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{errorMessage || cameraError}</p>
              </div>
            </div>
          )}

          {/* TAB 1: Upload File & Drag/Drop */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              {!previewMedia ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:border-emerald-500 hover:bg-slate-100/50 dark:hover:bg-slate-900"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Click to select photo or video
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Drag and drop your file here. Accepts photos (JPG, PNG) or short clips up to 1 minute (MP4, WEBM).
                  </p>

                  <div className="flex items-center gap-3 mt-4 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Photo
                    </span>
                    <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      <Film className="w-3.5 h-3.5 text-blue-500" /> Max 1-Min Video
                    </span>
                  </div>
                </div>
              ) : (
                /* Media Preview Card */
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {previewMedia.type === "video" ? "Video Selected (Max 1 min)" : "Photo Selected"}
                    </span>

                    <button
                      type="button"
                      onClick={handleClearPreview}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Change File</span>
                    </button>
                  </div>

                  {/* Media View */}
                  <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-64">
                    {previewMedia.type === "image" ? (
                      <img
                        src={previewMedia.dataUrl}
                        alt="Selected Item"
                        referrerPolicy="no-referrer"
                        className="w-full max-h-64 object-contain"
                      />
                    ) : (
                      <video
                        src={previewMedia.dataUrl}
                        controls
                        className="w-full max-h-64 object-contain"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span className="font-semibold truncate max-w-[200px]">{previewMedia.name}</span>
                    <span>
                      {previewMedia.sizeMb} MB
                      {previewMedia.durationSec ? ` • ${previewMedia.durationSec}s` : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Camera & 1-Min Video Recorder */}
          {activeTab === "camera" && (
            <div className="space-y-4">
              {/* Photo vs Video Mode Switcher */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => startCamera("photo")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    cameraMode === "photo"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Snap Photo
                </button>
                <button
                  type="button"
                  onClick={() => startCamera("video")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    cameraMode === "video"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Record 1-Min Video
                </button>
              </div>

              {/* Camera Stream Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Video Recording Status Badge */}
                {isRecordingVideo && (
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold font-mono flex items-center gap-2 animate-pulse shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span>REC {videoDuration}s / 60s</span>
                    </div>

                    <span className="text-[11px] font-bold bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                      Max 1 Minute
                    </span>
                  </div>
                )}
              </div>

              {/* Camera Trigger Buttons */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {cameraMode === "photo" ? (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>
                ) : !isRecordingVideo ? (
                  <button
                    type="button"
                    onClick={startVideoRecording}
                    className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Recording (Max 1 min)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopVideoRecording}
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-white/20"
                  >
                    <StopCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>Finish & Save Video ({videoDuration}s)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!previewMedia}
            onClick={handleConfirmMedia}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>Attach to Wholesale Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
