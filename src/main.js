import $ from 'jquery';
import { Chess } from 'chess.js';
import { state } from './state.js';

// --- FIX THE IMPORT HERE ---
// We import the default Class as "StockfishService"
// AND the named function "getBestMove"
import StockfishService, { getBestMove } from './services/Stockfish.js';

import { getOpeningMoves } from './services/Explorer.js';
import * as Board from './components/Board.js';
import * as Clock from './components/Clock.js';
import * as Controls from './components/Controls.js';
import * as Modals from './components/Modals.js';

// --- ENGINE INIT ---
const engine = new StockfishService((msg) => handleEngineMessage(msg));

// --- APP ACTIONS ---
const actions = {
    resetGame: () => {
        // Settings
        const timeVal = $('#timeControl').val().split(',');
        state.timers.w = parseInt(timeVal[0]);
        state.timers.b = parseInt(timeVal[0]);
        state.increment = parseInt(timeVal[1]);
        state.isTimeless = state.timers.w === -1;
        state.difficulty = parseInt($('#difficulty').val());
        state.gameMode = $('#gameMode').val();

        // Logic
        state.game.reset();
        state.redoStack = [];
        state.board.position('start');
        Clock.stopClock();
        Clock.updateClockUI();
        
        // UI
        $('#btn-analyze').hide();
        $('#status-text').text('New Game').removeClass('game-over');
        $('.highlight-move, .highlight-hint').removeClass('highlight-move highlight-hint');
        
        state.currentJob = null;
        engine.stop();
        
        if(state.isExplorerOpen) updateExplorer();
        if(state.gameMode === 'cvc') setTimeout(triggerAI, 500);
    },

    undoMove: () => {
        const move = state.game.undo();
        if (move) {
            state.redoStack.push(move);
            Board.updateBoardUI();
            Clock.updateClockUI();
            if(state.isExplorerOpen) updateExplorer();
        }
    },

    redoMove: () => {
        if (!state.redoStack.length) return;
        const move = state.redoStack.pop();
        makeMove({ ...move, isRedo: true });
    },

    flipBoard: () => Board.flipBoard(),

    // Update this function inside the 'actions' object
// Update this inside 'actions' in src/main.js
// src/main.js

    toggleHints: async () => {
        const btn = $('#btn-hint');
        
        // 1. Toggle the state
        state.isHintMode = !state.isHintMode;

        // 2. Apply Visuals based on state
        if (state.isHintMode) {
            // --- TURN ON ---
            btn.addClass('active'); // CSS will now force this to be Gold
            $('#status-text').text('Hint Mode ON');
            
            // Get the first hint immediately
            const bestMove = await getBestMove(state.game.fen(), 10);
            if (bestMove) {
                const from = bestMove.substring(0, 2);
                const to = bestMove.substring(2, 4);
                $(`.square-${from}`).addClass('highlight-hint');
                $(`.square-${to}`).addClass('highlight-hint');
            }
        } else {
            // --- TURN OFF ---
            btn.removeClass('active'); // Go back to Grey
            clearHints(); 
            $('#status-text').text('Hint Mode OFF');
        }
    },

    toggleExplorer: () => {
        state.isExplorerOpen = !state.isExplorerOpen;
        Modals.toggleExplorerModal(state.isExplorerOpen);
        if(state.isExplorerOpen) updateExplorer();
    },

    startAnalysis: () => {
        Modals.openAnalysisModal();
        state.analysisQueue = state.game.history({verbose: true}).map((m, i) => ({
            fen: getFenAfterMove(i),
            move: m,
            id: i
        }));
        state.totalAnalysisMoves = state.analysisQueue.length;
        Modals.renderAnalysisRows(state.analysisQueue, (i) => {
            // Click to load position
            // (Simpler implementation: just show fen)
            state.board.position(getFenAfterMove(i));
        });
        state.currentJob = 'analysis';
        processNextAnalysis();
    },
    
    closeAnalysis: () => {
        Modals.closeAnalysisModal();
        state.currentJob = null;
        state.board.position(state.game.fen());
    }
};

// --- CORE LOGIC ---
function makeMove(moveCfg) {
    if (state.currentJob === 'move' || state.currentJob === 'hint') engine.stop();
    clearHints(); 
    const move = state.game.move(moveCfg);
    if (!move) return null;
    
    if (!moveCfg.isRedo) state.redoStack = [];
    if (!state.isTimeless && state.game.history().length > 1) {
        state.timers[move.color] += state.increment;
    }
    
    Board.updateBoardUI(move);
    Clock.startClock(onTimeOut);
    Clock.updateClockUI();
    
    // FIX: Use remote URLs so you don't need local files
    const audioUrl = move.captured 
        ? 'https://images.chesscomfiles.com/chess-themes/sounds/_common/capture.mp3' 
        : 'https://images.chesscomfiles.com/chess-themes/sounds/_common/move-self.mp3';
    
    new Audio(audioUrl).play().catch(() => {});

    if(state.game.game_over()) endGame();
    if(state.isExplorerOpen) updateExplorer();

    // --- AI & HINT TRIGGER ---
    if (!state.game.game_over() && !moveCfg.isRedo) {
        
        // 1. If it's the AI's turn, let the AI play
        if (state.gameMode === 'cvc' || (state.gameMode === 'pvc' && state.game.turn() !== state.playerColor)) {
            setTimeout(triggerAI, 250);
        } 
        
        // 2. If it's YOUR turn and Hint Mode is ON -> Get a new hint automatically
        else if (state.isHintMode) {
            console.log("Auto-fetching hint...");
            
            // Wait slightly for the board to update visually, then fetch
            setTimeout(async () => {
                const bestMove = await getBestMove(state.game.fen(), 10);
                
                if (bestMove) {
                    const from = bestMove.substring(0, 2);
                    const to = bestMove.substring(2, 4);
                    
                    // Apply the highlight directly (same as the button logic)
                    $(`.square-${from}`).addClass('highlight-hint');
                    $(`.square-${to}`).addClass('highlight-hint');
                    $('#status-text').text('Hint Active');
                }
            }, 300);
        }
    }
    
    return move;
}

function triggerAI() {
    state.currentJob = 'move';
    $('#status-text').text('AI Thinking...');
    const moveTime = state.difficulty * 100 + 400;
    engine.play(state.game.fen(), state.difficulty, moveTime);
}

function handleEngineMessage(msg) {
    // 1. Analysis
    if (state.currentJob === 'analysis' && msg.includes('score') && state.analysisQueue.length > 0) {
        // Parse Score... (simplified for brevity)
        const match = msg.match(/score cp (-?\d+)/);
        if(match) Modals.updateAnalysisEval(state.analysisQueue[0].id, parseInt(match[1])/100);
    }
    
    // 2. Best Move
    if (msg.includes('bestmove')) {
        const m = msg.match(/bestmove ([a-h][1-8])([a-h][1-8])(q|r|b|n)?/);
        
        if (state.currentJob === 'analysis') {
            state.analysisQueue.shift();
            processNextAnalysis();
            return;
        }
        
        if (m) {
            if (state.currentJob === 'hint') {
                Board.highlightHint(m[1], m[2]);
                $('#status-text').text('Hint Ready');
            } else if (state.currentJob === 'move') {
                makeMove({ from: m[1], to: m[2], promotion: m[3] || 'q' });
                $('#status-text').text('Your Turn');
            }
        }
        state.currentJob = null;
    }
}

function processNextAnalysis() {
    if(state.analysisQueue.length === 0) return;
    engine.analyze(state.analysisQueue[0].fen);
}

async function updateExplorer() {
    // 1. Show Loading State immediately
    const container = document.getElementById('explorerContent');
    if(container) container.innerHTML = '<div style="padding: 20px; text-align: center; color: #909296;">Loading...</div>';
    
    // 2. Fetch Data (with error handling)
    const data = await getOpeningMoves(state.game.fen());
    
    // 3. Render (Even if data is null, the render function handles it now)
    Modals.renderExplorer(data, (san) => {
        if(state.gameMode === 'pvc' && state.game.turn() !== state.playerColor) return;
        makeMove(san);
    });
}

function getFenAfterMove(index) {
    const tmp = new Chess();
    const history = state.game.history();
    for(let i=0; i<=index; i++) tmp.move(history[i]);
    return tmp.fen();
}

function onTimeOut() {
    endGame();
    $('#status-text').text('Time Out!');
}

function endGame() {
    $('#status-text').text(state.game.in_checkmate() ? 'CHECKMATE' : 'DRAW').addClass('game-over');
    $('#btn-analyze').css('display', 'flex');
    Clock.stopClock();
}

// --- INIT ---
$(() => {
    Board.initBoard((s, t) => makeMove({from:s, to:t, promotion:'q'}));
    Controls.initControls(actions);
    actions.resetGame();
});

// Remove any "hint" highlights from the board
function clearHints() {
    // Removes the yellow/blue highlight class from all squares
    $('.square-55d63').removeClass('highlight-hint');
}