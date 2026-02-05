import { state } from '../state.js';
import $ from 'jquery';

export function startClock(onTimeOut) {
    if (state.clockInterval || state.isTimeless) return;
    
    state.clockInterval = setInterval(() => {
        if (state.game.game_over() || state.game.history().length === 0) return;
        
        state.timers[state.game.turn()]--;
        updateClockUI();
        
        if (state.timers[state.game.turn()] <= 0) {
            clearInterval(state.clockInterval);
            onTimeOut();
        }
    }, 1000);
}

export function stopClock() {
    if(state.clockInterval) {
        clearInterval(state.clockInterval);
        state.clockInterval = null;
    }
}

export function updateClockUI() {
    const fmt = s => {
        let m = Math.floor(s/60), sec = Math.floor(s%60);
        return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    };
    
    const wText = state.isTimeless ? '∞' : fmt(state.timers.w);
    const bText = state.isTimeless ? '∞' : fmt(state.timers.b);
    
    $('#timer-w').text(wText).toggleClass('active', state.game.turn() === 'w');
    $('#timer-b').text(bText).toggleClass('active', state.game.turn() === 'b');
    
    if(!state.isTimeless) {
        $('#timer-w').toggleClass('low-time', state.timers.w < 30);
        $('#timer-b').toggleClass('low-time', state.timers.b < 30);
    }
}