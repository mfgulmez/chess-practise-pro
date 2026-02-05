export async function getOpeningMoves(fen) {
    const encodedFen = encodeURIComponent(fen);
    const primaryUrl = `https://explorer.lichess.ovh/masters?fen=${encodedFen}`;
    const backupUrl = `https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=2000,2200,2500&fen=${encodedFen}`;

    // Helper: Stop waiting after 5 seconds
    const fetchWithTimeout = async (url, time = 5000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), time);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    };

    try {
        console.log("Attempting Masters DB...");
        // Try Masters (Wait max 5s)
        let response = await fetchWithTimeout(primaryUrl, 5000).catch(() => null);

        // If failed, Try Backup (Wait max 5s)
        if (!response || !response.ok) {
            console.warn("Masters failed. Trying Backup...");
            response = await fetchWithTimeout(backupUrl, 5000).catch(() => null);
        }

        // If both fail, return null.
        // This triggers the "Connection Failed" screen you liked.
        if (!response || !response.ok) {
            console.error("All APIs failed.");
            return null; 
        }

        return await response.json();

    } catch (e) {
        console.error("Critical Explorer Error:", e);
        return null;
    }
}