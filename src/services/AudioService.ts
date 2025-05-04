
import { toast } from 'sonner';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private visualizationData: number[] = [];
  private onVisualizationUpdate: ((data: number[]) => void) | null = null;
  
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.animationFrame = null;
    this.visualizationData = [];
    this.onVisualizationUpdate = null;
  }
  
  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop immediately, we just wanted to get permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }
  
  public async startRecording(onVisualizationUpdate?: (data: number[]) => void): Promise<boolean> {
    try {
      // Create audio context
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Get user media
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Connect source to analyser
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      
      // Set up media recorder
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      
      // Set up visualization if callback provided
      if (onVisualizationUpdate) {
        this.onVisualizationUpdate = onVisualizationUpdate;
        this.startVisualization();
      }
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
      return false;
    }
  }
  
  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        // Stop visualization
        this.stopVisualization();
        
        // Close audio context
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
        
        // Create audio blob
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        
        resolve(audioBlob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  private startVisualization(): void {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVisualization = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Process the data for visualization (reduce resolution for performance)
      const sampleCount = 20;
      this.visualizationData = Array.from({ length: sampleCount }, (_, i) => {
        const index = Math.floor(i * (bufferLength / sampleCount));
        return dataArray[index] / 255; // Normalize to 0-1
      });
      
      // Send data to callback if provided
      if (this.onVisualizationUpdate) {
        this.onVisualizationUpdate(this.visualizationData);
      }
      
      this.animationFrame = requestAnimationFrame(updateVisualization);
    };
    
    updateVisualization();
  }
  
  private stopVisualization(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  public isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }
  
  public getVisualizationData(): number[] {
    return [...this.visualizationData];
  }
  
  // Web Audio API utility functions
  public static createAudioElementFromBlob(blob: Blob): HTMLAudioElement {
    const audioURL = URL.createObjectURL(blob);
    const audio = new Audio(audioURL);
    return audio;
  }
  
  public static async getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = AudioService.createAudioElementFromBlob(blob);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0);
      });
    });
  }
  
  public static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export default new AudioService();
