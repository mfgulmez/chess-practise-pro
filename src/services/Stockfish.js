// src/services/Stockfish.js

const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

// --- HELPER: Fix SecurityError by using a Blob ---
async function createWorkerFromUrl(url) {
    const res = await fetch(url);
    const script = await res.text();
    const blob = new Blob([script], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}

// --- 1. THE CLASS (For the AI Opponent) ---
export default class StockfishService {
    constructor(onMessage) {
        // We initialize the worker asynchronously now
        this.initWorker(onMessage);
    }

    async initWorker(onMessage) {
        this.worker = await createWorkerFromUrl(STOCKFISH_URL);
        this.worker.onmessage = (e) => onMessage(e.data);
        this.worker.postMessage('uci');
    }

    play(fen, difficulty, moveTime) {
        if (!this.worker) return; // Guard in case worker isn't ready yet
        
        const skill = Math.min(20, Math.max(0, difficulty));
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage(`setoption name Skill Level value ${skill}`);
        this.worker.postMessage(`go movetime ${moveTime}`);
    }

    analyze(fen) {
        if (!this.worker) return;
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage('go depth 15');
    }

    getHint(fen) {
        if (!this.worker) return;
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage('go depth 10');
    }

    stop() {
        if (!this.worker) return;
        this.worker.postMessage('stop');
    }
}

// --- 2. THE HELPER FUNCTION (For the Hint Button) ---
export async function getBestMove(fen, depth = 10) {
    return new Promise(async (resolve) => {
        // Use the same Blob trick here
        const worker = await createWorkerFromUrl(STOCKFISH_URL);
        
        worker.onmessage = function(e) {
            const msg = e.data;
            if (msg.startsWith('bestmove')) {
                const move = msg.split(' ')[1];
                worker.terminate(); 
                resolve(move);
            }
        };
        worker.postMessage('uci');
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go depth ${depth}`);
    });
}