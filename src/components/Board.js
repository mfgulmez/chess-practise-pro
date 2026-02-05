import { state } from '../state.js';
import $ from 'jquery';

// 1. Attach jQuery to window
window.jQuery = $;
window.$ = $;

// 3. Grab the global variable
const Chessboard = window.Chessboard;

// We need a way to call back to main controller when a move is dropped
let onDropHandler = null;

export function initBoard(onDrop) {
    onDropHandler = onDrop;
    
    state.board = Chessboard('board', {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDropWrapper,
        onSnapEnd: () => state.board.position(state.game.fen()),
        // ENSURE THIS URL IS CORRECT AND ACCESSIBLE
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });
    
    $(window).resize(state.board.resize);
}

function onDragStart(source, piece) {
    if (state.game.game_over()) return false;
    if (state.gameMode === 'pvc' && state.game.turn() !== state.playerColor) return false;
    if ((state.game.turn() === 'w' && piece.search(/^b/) !== -1) || 
        (state.game.turn() === 'b' && piece.search(/^w/) !== -1)) return false;
}

function onDropWrapper(source, target) {
    return onDropHandler(source, target);
}

export function updateBoardUI(move) {
    state.board.position(state.game.fen());
    updateMaterial();
    
    // Highlight
    $('.square-55d63').removeClass('highlight-move highlight-hint');
    if (move) {
        $('.square-' + move.from).addClass('highlight-move');
        $('.square-' + move.to).addClass('highlight-move');
    }
}

export function highlightHint(from, to) {
    $('.square-55d63').removeClass('highlight-hint');
    $('.square-' + from).addClass('highlight-hint');
    $('.square-' + to).addClass('highlight-hint');
}

export function flipBoard() {
    state.board.flip();
    state.playerColor = state.board.orientation() === 'white' ? 'w' : 'b';
    updateMaterial();
}

function updateMaterial() {
    const history = state.game.history({ verbose: true });
    const captured = { w: [], b: [] };
    history.forEach(m => { if (m.captured) (m.color === 'w' ? captured.w : captured.b).push(m.captured); });
    
    const wHtml = captured.w.map(p => `<img src="https://chessboardjs.com/img/chesspieces/wikipedia/b${p.toUpperCase()}.png">`).join('');
    const bHtml = captured.b.map(p => `<img src="https://chessboardjs.com/img/chesspieces/wikipedia/w${p.toUpperCase()}.png">`).join('');
    
    if (state.board.orientation() === 'white') { 
        $('#material-top').html(bHtml); $('#material-bottom').html(wHtml); 
    } else { 
        $('#material-top').html(wHtml); $('#material-bottom').html(bHtml); 
    }
}