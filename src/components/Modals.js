// src/components/Modals.js

// 1. DELETE THE IMPORT
// import $ from 'jquery'; <--- DELETE THIS

// 2. USE THE GLOBAL JQUERY
const $ = window.jQuery;

// --- ANALYSIS ---
export function openAnalysisModal() {
    $('#analysisModal').addClass('open');
}

export function closeAnalysisModal() {
    $('#analysisModal').removeClass('open');
}

export function renderAnalysisRows(history, onRowClick) {
    const container = $('#analysisContent');
    container.empty();
    
    history.forEach((h, i) => {
        const moveNum = Math.ceil((i + 1) / 2);
        const turnChar = i % 2 === 0 ? '.' : '...';
        const html = `
            <div class="analysis-row" id="row-${i}">
                <span class="move-num">${moveNum}${turnChar}</span>
                <span class="move-san">${h.move.san}</span>
                <span class="eval-badge eval-loading" id="eval-${i}">...</span>
            </div>
        `;
        // Use standard JS click for safety, wrapped in jQuery
        const $el = $(html);
        $el.on('click', () => onRowClick(i));
        container.append($el);
    });
}

export function updateAnalysisEval(index, score) {
    const el = $(`#eval-${index}`);
    el.removeClass('eval-loading');
    
    let scoreText = score > 0 ? '+' + score.toFixed(1) : score.toFixed(1);
    if (Math.abs(score) > 900) scoreText = score > 0 ? '+M' : '-M';
    
    let cls = 'eval-good';
    if (Math.abs(score) > 1.5) cls = 'eval-blunder';
    
    el.text(scoreText).addClass(cls);
}

// --- EXPLORER ---
export function toggleExplorerModal(isOpen) {
    if(isOpen) $('#explorerModal').addClass('open');
    else $('#explorerModal').removeClass('open');
}

export function renderExplorer(data, onMoveClick) {
    const container = document.getElementById('explorerContent');
    if (!container) return;

    container.innerHTML = ''; // Clear "Loading..."

    // 1. Handle API Failure (null data)
    if (!data) {
        container.innerHTML = `
            <div style="padding:20px; text-align:center; color:#fa5252">
                <strong>Connection Failed</strong><br>
                <span style="font-size:0.8em; color:#909296">Lichess servers are busy (504).<br>Try again in a moment.</span>
            </div>`;
        return;
    }

    // 2. Handle Empty Moves
    if (!data.moves || data.moves.length === 0) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#909296">No games found.</div>';
        return;
    }

    // ... (Rest of the rendering logic remains the same) ...
    // 3. Render Opening Name
    if(data.opening && data.opening.name) {
        // ... code from previous steps ...
        const title = document.createElement('div');
        title.style.cssText = 'padding:10px; text-align:center; font-weight:bold; color:#fff; border-bottom:1px solid #2c2e33';
        title.innerText = data.opening.name;
        container.appendChild(title);
    }

    // 4. Render Moves
    data.moves.forEach(m => {
        // ... code from previous steps ...
        const total = m.white + m.draws + m.black;
        if (total === 0) return;
        const wPct = (m.white / total) * 100;
        const dPct = (m.draws / total) * 100;
        const bPct = (m.black / total) * 100;
        let countText = (total / 1000).toFixed(1) + 'k';
        if (total < 1000) countText = total;

        const row = document.createElement('div');
        row.className = 'explorer-row';
        row.innerHTML = `
            <div class="exp-move">${m.san}</div>
            <div class="exp-stat-row">
                <div class="exp-bar-container">
                    <div class="exp-bar-w" style="width:${wPct}%"></div>
                    <div class="exp-bar-d" style="width:${dPct}%"></div>
                    <div class="exp-bar-b" style="width:${bPct}%"></div>
                </div>
            </div>
            <div class="exp-games">${countText}</div>
        `;
        row.onclick = () => onMoveClick(m.san);
        container.appendChild(row);
    });
}