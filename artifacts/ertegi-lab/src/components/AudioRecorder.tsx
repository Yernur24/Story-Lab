import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, Save } from "lucide-react";
import { motion } from "framer-motion";

interface AudioRecorderProps {
  onSave: (base64Audio: string) => void;
  isSaving?: boolean;
}

export function AudioRecorder({ onSave, isSaving }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) window.clearInterval(timerInterval.current);
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setError(null);
      
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Convert to base64 for saving
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setBase64Data(reader.result as string);
        };
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Microphone access denied or failed", err);
      setError("Микрофонға рұқсат берілмеді (Mic access denied)");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) window.clearInterval(timerInterval.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setBase64Data(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-card border-4 border-primary/20 rounded-3xl p-6 shadow-xl w-full max-w-md mx-auto">
      <h3 className="font-display text-xl mb-4 text-center text-foreground flex items-center justify-center gap-2">
        <Mic className="text-primary w-6 h-6" /> Өз даусыңды жаз! (Record)
      </h3>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-center mb-4 font-semibold text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {/* Visualizer / Timer */}
        <div className="relative h-24 w-full flex items-center justify-center bg-muted/50 rounded-2xl overflow-hidden">
          {isRecording ? (
            <div className="flex items-center gap-1 h-12">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 bg-primary rounded-full"
                  animate={{ height: ['20%', '100%', '20%'] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          ) : audioUrl ? (
            <audio src={audioUrl} controls className="w-full px-4 h-12" />
          ) : (
            <div className="text-muted-foreground font-semibold">Дайын (Ready)</div>
          )}
          
          {isRecording && (
            <div className="absolute top-2 right-3 font-mono font-bold text-primary animate-pulse">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-full p-5 shadow-[0_6px_0_hsl(var(--destructive-foreground)/0.3)] hover:translate-y-1 hover:shadow-[0_2px_0_hsl(var(--destructive-foreground)/0.3)] transition-all active:translate-y-2 active:shadow-none"
            >
              <Mic className="w-8 h-8" />
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full p-5 shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:translate-y-1 hover:shadow-[0_2px_0_rgba(0,0,0,0.5)] transition-all active:translate-y-2 active:shadow-none"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
          )}

          {audioUrl && (
            <>
              <button
                onClick={resetRecording}
                className="bg-muted hover:bg-muted/80 text-foreground rounded-full p-4 shadow-[0_4px_0_hsl(var(--border))] transition-all active:translate-y-1 active:shadow-none"
                title="Қайта жазу (Retake)"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => base64Data && onSave(base64Data)}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full py-4 px-8 flex items-center gap-2 shadow-[0_6px_0_hsl(var(--primary-border))] hover:translate-y-1 hover:shadow-[0_2px_0_hsl(var(--primary-border))] transition-all active:translate-y-2 active:shadow-none disabled:opacity-50"
              >
                {isSaving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Save className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <>
                    <Save className="w-6 h-6" /> Сақтау (Save)
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
