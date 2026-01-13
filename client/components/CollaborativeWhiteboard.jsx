import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  StickyNote,
  Type,
  Undo,
  Redo,
  Trash2,
  Save
} from "lucide-react";

export default function CollaborativeWhiteboard({ roomId, whiteboardData, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');
  const [stickyNotes, setStickyNotes] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [shapes, setShapes] = useState([]);
  const historyRef = useRef([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (whiteboardData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.src = whiteboardData.imageData || '';
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      
      if (whiteboardData.stickyNotes) setStickyNotes(whiteboardData.stickyNotes);
      if (whiteboardData.textBoxes) setTextBoxes(whiteboardData.textBoxes);
      if (whiteboardData.shapes) setShapes(whiteboardData.shapes);
    }
  }, [whiteboardData]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newHistory = historyRef.current.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    historyRef.current = newHistory;
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    if (tool !== 'pen' && tool !== 'eraser') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleCanvasClick = (e) => {
    if (tool === 'sticky-note') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newNote = {
        id: Date.now(),
        x,
        y,
        width: 150,
        height: 150,
        text: 'Double-click to edit',
        color: '#fef08a'
      };
      
      const updatedNotes = [...stickyNotes, newNote];
      setStickyNotes(updatedNotes);
      drawStickyNote(newNote);
      saveToHistory();
    } else if (tool === 'text') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const text = prompt('Enter text:');
      if (text) {
        const newTextBox = {
          id: Date.now(),
          x,
          y,
          text,
          fontSize: 16,
          color: color
        };
        const updatedTextBoxes = [...textBoxes, newTextBox];
        setTextBoxes(updatedTextBoxes);
        drawTextBox(newTextBox);
        saveToHistory();
      }
    }
  };

  const drawStickyNote = (note) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = note.color;
    ctx.fillRect(note.x, note.y, note.width, note.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(note.x, note.y, note.width, note.height);
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText(note.text.substring(0, 20), note.x + 5, note.y + 20);
  };

  const drawTextBox = (box) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = box.color;
    ctx.font = `${box.fontSize}px Arial`;
    ctx.fillText(box.text, box.x, box.y);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = historyRef.current[historyStep - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const redo = () => {
    if (historyStep < historyRef.current.length - 1) {
      setHistoryStep(historyStep + 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = historyRef.current[historyStep + 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStickyNotes([]);
    setTextBoxes([]);
    setShapes([]);
    saveToHistory();
  };

  const handleSave = async () => {
    const dataToSave = {
      imageData: canvasRef.current.toDataURL(),
      stickyNotes,
      textBoxes,
      shapes
    };
    
    if (onSave) {
      await onSave(dataToSave);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-white text-sm">Collaborative Whiteboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap glass-card rounded-lg p-3">
          <div className="flex gap-1">
            <Button
              onClick={() => setTool('pen')}
              size="icon"
              className={tool === 'pen' ? 'btn-primary text-white' : 'glass-card border-0 text-white hover:bg-white/5'}
              title="Pen"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setTool('eraser')}
              size="icon"
              className={tool === 'eraser' ? 'btn-primary text-white' : 'glass-card border-0 text-white hover:bg-white/5'}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex gap-1">
            <Button
              onClick={() => setTool('rectangle')}
              size="icon"
              className={tool === 'rectangle' ? 'btn-primary text-white' : 'glass-card border-0 text-white hover:bg-white/5'}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setTool('circle')}
              size="icon"
              className={tool === 'circle' ? 'btn-primary text-white' : 'glass-card border-0 text-white hover:bg-white/5'}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex gap-1">
            <Button
              onClick={() => setTool('sticky-note')}
              size="icon"
              className={tool === 'sticky-note' ? 'btn-primary text-white' : 'glass-card border-0 text-white hover:bg-white/5'}
              title="Sticky Note"
            >
              <StickyNote className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setTool('text')}
              size="icon"
              className={tool === 'text' ? 'btn-primary text-white' : 'glass-card border-0 text-white hover:bg-white/5'}
              title="Text"
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <div className="flex gap-1">
              {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded border border-white/20"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 text-sm"
          >
            <option value="1">Thin</option>
            <option value="3">Medium</option>
            <option value="5">Thick</option>
            <option value="10">Very Thick</option>
          </select>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex gap-1 ml-auto">
            <Button
              onClick={undo}
              disabled={historyStep <= 0}
              size="icon"
              className="glass-card border-0 text-white hover:bg-white/5"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              onClick={redo}
              disabled={historyStep >= historyRef.current.length - 1}
              size="icon"
              className="glass-card border-0 text-white hover:bg-white/5"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              onClick={clearCanvas}
              size="icon"
              className="glass-card border-0 text-red-400 hover:bg-red-500/10"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSave}
              size="icon"
              className="btn-primary text-white"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onClick={handleCanvasClick}
            className="w-full bg-white cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="glass-card rounded p-3 bg-blue-500/10">
          <p className="text-blue-400 text-xs">
            <strong>Tips:</strong> {
              tool === 'pen' ? 'Click and drag to draw' :
              tool === 'eraser' ? 'Click and drag to erase' :
              tool === 'sticky-note' ? 'Click anywhere to place a sticky note' :
              tool === 'text' ? 'Click to add text' :
              tool === 'rectangle' || tool === 'circle' ? 'Click and drag to draw shapes' :
              'Select a tool to start'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}