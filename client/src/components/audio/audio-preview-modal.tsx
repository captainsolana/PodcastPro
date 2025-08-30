import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WaveformVisualizer from "./waveform-visualizer";
import { RefreshCw, Check, X } from "lucide-react";

interface AudioPreviewModalProps {
  audioUrl: string;
  title: string;
  onClose: () => void;
  onRegenerateSegment: () => void;
  isRegenerating: boolean;
}

export default function AudioPreviewModal({
  audioUrl,
  title,
  onClose,
  onRegenerateSegment,
  isRegenerating,
}: AudioPreviewModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Audio Preview</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-preview"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground">Preview - First 30 seconds</p>
          </div>

          {/* Waveform Visualization */}
          <WaveformVisualizer audioUrl={audioUrl} />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onRegenerateSegment}
              disabled={isRegenerating}
              className="flex-1"
              data-testid="button-regenerate-segment"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-success hover:bg-success/90"
              data-testid="button-approve-segment"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
