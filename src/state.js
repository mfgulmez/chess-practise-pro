import { Chess } from 'chess.js';

export const state = {
    game: new Chess(),
    board: null,          // Will be initialized in Board.js
    
    // Config
    playerColor: 'w',
    difficulty: 5,
    gameMode: 'pvc',      // 'pvc', 'pvp', 'cvc'
    
    // Time
    timers: { w: 300, b: 300 },
    increment: 0,
    isTimeless: true,
    clockInterval: null,
    
    // Features
    redoStack: [],
    isHintMode: false,
    
    // Jobs (Engine)
    currentJob: null,     // 'hint', 'move', 'analysis'
    engineStatus: 0,
    
    // UI State
    isExplorerOpen: false,
    
    // Analysis Data
    analysisQueue: [],
    analysisHistory: [],
    totalAnalysisMoves: 0
};