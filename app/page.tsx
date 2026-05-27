"use client";

import React, { useRef, useState } from "react";

export default function BadgeGenerator() {
  const pixelifyFont = '"Pixelify Sans"';

  const [step, setStep] = useState(1);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");

  const [finalBadge, setFinalBadge] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = { x: clientX, y: clientY };
    startOffsetRef.current = { x: offsetX, y: offsetY };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleRatio = 3240 / rect.width;

    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    setOffsetX(startOffsetRef.current.x + dx * scaleRatio);
    setOffsetY(startOffsetRef.current.y + dy * scaleRatio);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const resetImagePosition = () => {
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
  };

  const FRAME_URL =
    "https://ik.imagekit.io/k2pkqd50y/innovateX%20member%20badge@3x.png?updatedAt=1779802381226";

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setUploadedImage(imageUrl);
    resetImagePosition();

    setStep(2);
  };

  const generateBadge = async () => {
    if (!uploadedImage) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const frame = new Image();
    const userImg = new Image();

    frame.crossOrigin = "anonymous";

    frame.src = FRAME_URL;
    userImg.src = uploadedImage;

    await Promise.all([
      new Promise((resolve) => {
        frame.onload = resolve;
      }),

      new Promise((resolve) => {
        userImg.onload = resolve;
      }),
    ]);

    canvas.width = frame.width;
    canvas.height = frame.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const photoX = 680;
    const photoY = 1180;
    const photoW = 1880;
    const photoH = 2140;

    const imgAspect = userImg.width / userImg.height;
    const boxAspect = photoW / photoH;

    let drawW, drawH;
    if (imgAspect > boxAspect) {
      drawH = photoH;
      drawW = drawH * imgAspect;
    } else {
      drawW = photoW;
      drawH = drawW / imgAspect;
    }

    const centerX = photoX + photoW / 2;
    const centerY = photoY + photoH / 2;

    const scaledW = drawW * zoom;
    const scaledH = drawH * zoom;

    const adjX = centerX - scaledW / 2 + offsetX;
    const adjY = centerY - scaledH / 2 + offsetY;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();

    ctx.drawImage(userImg, adjX, adjY, scaledW, scaledH);

    ctx.restore();

    ctx.drawImage(frame, 0, 0);

    await document.fonts.load(`bold 170px ${pixelifyFont}`);
    await document.fonts.load(`bold 115px ${pixelifyFont}`);

    ctx.font = `bold 170px ${pixelifyFont}`;

    ctx.fillStyle = "#000";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    ctx.fillText(
      name.toUpperCase(),
      2780,
      3330
    );

    ctx.font = `bold 115px ${pixelifyFont}`;
    ctx.textBaseline = "middle";

    ctx.fillText(
      designation.toUpperCase(),
      2820,
      3536
    );

    const finalImage = canvas.toDataURL("image/png");

    setFinalBadge(finalImage);

    setStep(3);
  };

  const downloadBadge = () => {
    if (!finalBadge) return;

    const link = document.createElement("a");

    link.href = finalBadge;

    link.download = "innovatex-badge.png";

    link.click();
  };

  return (
    <div className="min-h-screen bg-[#071018] flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-white/20 bg-[#010102] backdrop-blur-xl p-6 shadow-2xl">

        {step === 1 && (
          <>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="w-full  border border-white/50 py-4 text-center text-white text-xl font-semibold hover:bg-white/10 transition">
                + Upload your Photo
              </div>
            </label>

            <p className="mt-6 text-white/80 text-center text-sm">
              Image should be in .jpg, .png, or .webp format
            </p>

            <div className="mt-8 text-white">
              <h3 className="font-semibold text-lg mb-3">
                Photo Guidelines:
              </h3>

              <ul className="list-disc pl-5 space-y-2 text-white/85">
                <li>
                  Upload a clear, front-facing solo photo with
                  good lighting and a fully visible face.
                </li>

                <li>
                  A square image is preferred for the best badge
                  fit and layout.
                </li>
              </ul>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-3xl text-white font-bold text-center mb-6">
              Customize your badge
            </h2>

            <div 
              ref={containerRef}
              className="relative w-full aspect-3240/4050 overflow-hidden  border border-white/10 select-none bg-[#0a121d] cursor-move touch-none"
              style={{ containerType: "inline-size" }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <div 
                className="absolute overflow-hidden"
                style={{
                  top: "29.136%",
                  left: "20.988%",
                  width: "58.025%",
                  height: "52.84%",
                }}
              >
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Preview avatar"
                    className="w-full h-full object-cover origin-center pointer-events-none"
                    style={{
                      transform: `translate(${(offsetX / 1880) * 100}%, ${(offsetY / 2140) * 100}%) scale(${zoom})`,
                    }}
                  />
                )}
              </div>

              <img 
                src={FRAME_URL} 
                alt="Frame Template" 
                className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" 
              />

              {name && (
                <div
                  style={{
                    position: "absolute",
                    top: "82.222%",
                    right: "14.198%",
                    transform: "translateY(-50%)",
                    fontSize: "5.247cqw",
                    fontWeight: "bold",
                    fontFamily: "Pixelify Sans, sans-serif",
                    color: "#000000",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  {name}
                </div>
              )}

              {designation && (
                <div
                  style={{
                    position: "absolute",
                    textAlignLast: "center",
                    top: "87.309%",
                    right: "12.963%",
                    transform: "translateY(-50%)",
                    fontSize: "3.549cqw",
                    fontWeight: "bold",
                    fontFamily: "Pixelify Sans, sans-serif",
                    color: "#000000",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  {designation}
                </div>
              )}
            </div>

            <div className="mt-4 bg-white/5 border border-white/10  p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">Zoom Photo</span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={resetImagePosition}
                    className="text-white/40 hover:text-white/80 text-xs transition"
                  >
                    Reset
                  </button>
                  <span className="text-orange-400 text-xs font-semibold">{Math.round(zoom * 100)}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <p className="text-white/50 text-[11px] text-center mt-2">
                Drag the photo directly to reposition it
              </p>
            </div>

            <div className="mt-6">
              <label className="text-white text-sm mb-2 block">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-5">
              <label className="text-white text-sm mb-2 block">
                Designation
              </label>

              <input
                type="text"
                placeholder="Enter designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              onClick={generateBadge}
              className="mt-8 w-full rounded-[5px] uppercase bg-orange-500 text-white font-semibold py-4 hover:scale-[1.02] transition"
            >
              Generate Badge
            </button>
          </>
        )}

        {step === 3 && finalBadge && (
          <>
            <h2 className="text-4xl font-bold text-center text-white">
              Your badge is here!
            </h2>

            <div className="mt-8 rounded-2xl overflow-hidden">
              <img
                src={finalBadge}
                alt="Badge"
                className="w-full"
              />
            </div>

            <button
              onClick={downloadBadge}
              className="mt-8 w-full rounded-full bg-white text-black font-semibold py-4 hover:scale-[1.02] transition"
            >
              Download & Share
            </button>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}