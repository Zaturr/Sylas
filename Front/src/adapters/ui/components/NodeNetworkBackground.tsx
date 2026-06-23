import { useEffect, useRef } from 'react';
import './NodeNetworkBackground.css';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface NodeNetworkBackgroundProps {
  nodeCount?: number;
  connectionDistance?: number;
}

export function NodeNetworkBackground({
  nodeCount = 100,
  connectionDistance = 160,
}: NodeNetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId = 0;
    let nodes: Node[] = [];
    let width = 0;
    let height = 0;

    const createNodes = () => {
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      }));
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      createNodes();
    };

    const drawBackground = () => {
      context.fillStyle = '#eaf2f8';
      context.fillRect(0, 0, width, height);
    };

    const drawConnections = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 0.25 * (1 - distance / connectionDistance);
            context.beginPath();
            context.strokeStyle = `rgba(0, 77, 153, ${opacity})`;
            context.lineWidth = 1;
            context.moveTo(nodes[i].x, nodes[i].y);
            context.lineTo(nodes[j].x, nodes[j].y);
            context.stroke();
          }
        }
      }
    };

    const drawNodes = () => {
      for (const node of nodes) {
        context.beginPath();
        context.fillStyle = 'rgba(211, 212, 219, 0.9)';
        context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        context.lineWidth = 1.5;
        context.shadowColor = 'rgba(211, 212, 219, 0.9)';
        context.shadowBlur = 6;
        context.arc(node.x, node.y, 4, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
      }
    };

    const updateNodes = () => {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 4 || node.x >= width - 4) node.vx *= -1;
        if (node.y <= 4 || node.y >= height - 4) node.vy *= -1;

        node.x = Math.max(4, Math.min(width - 4, node.x));
        node.y = Math.max(4, Math.min(height - 4, node.y));
      }
    };

    const draw = () => {
      drawBackground();
      updateNodes();
      drawConnections();
      drawNodes();
      animationFrameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [nodeCount, connectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="node-network-bg"
      aria-hidden="true"
    />
  );
}
