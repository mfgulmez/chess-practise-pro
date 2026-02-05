const $ = window.jQuery;

export function initControls(actions) {
    // Game Controls
    $('#btn-reset').on('click', actions.resetGame);
    $('#btn-undo').on('click', actions.undoMove);
    $('#btn-redo').on('click', actions.redoMove);
    $('#btn-flip').on('click', actions.flipBoard);
    $('#btn-hint').on('click', actions.toggleHints);
    
    // Feature Controls
    $('#btn-analyze').on('click', actions.startAnalysis);
    $('#btn-explore').on('click', actions.toggleExplorer);
    $('#close-analysis').on('click', actions.closeAnalysis);
    $('#close-explorer').on('click', actions.toggleExplorer);
    
    // Settings
    $('#gameMode').on('change', actions.resetGame);
    $('#timeControl').on('change', actions.resetGame);
    $('#difficulty').on('change', () => { 
        // Just update state, no reset needed
    });
}