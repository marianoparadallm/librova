let audioCtx;
let trainingProfile = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function extractFeatures(arrayBuffer) {
    initAudio();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const bufferSize = 512;
    const hop = 256;
    let centroidSum = 0;
    let rmsSum = 0;
    let count = 0;
    for (let i = 0; i + bufferSize <= channelData.length; i += hop) {
        const slice = channelData.slice(i, i + bufferSize);
        const features = Meyda.extract(['rms', 'spectralCentroid'], slice);
        centroidSum += features.spectralCentroid || 0;
        rmsSum += features.rms || 0;
        count++;
    }
    if (count === 0) return { centroid: 0, rms: 0 };
    return { centroid: centroidSum / count, rms: rmsSum / count };
}

async function train() {
    const files = document.getElementById('train-audios').files;
    if (!files.length) {
        M.toast({ html: 'Selecciona audios para entrenar' });
        return;
    }
    let centroidTotal = 0;
    let rmsTotal = 0;
    for (const file of files) {
        const buf = await fileToArrayBuffer(file);
        const f = await extractFeatures(buf);
        centroidTotal += f.centroid;
        rmsTotal += f.rms;
    }
    trainingProfile = {
        centroid: centroidTotal / files.length,
        rms: rmsTotal / files.length
    };
    M.toast({ html: 'Entrenamiento completado' });
}

function probabilityFromDistance(d) {
    const normalized = Math.min(d / (trainingProfile.centroid + 0.0001), 1);
    return Math.max(0, 100 - normalized * 100);
}

function drawChart(train, test) {
    const ctx = document.getElementById('chart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Centroid', 'RMS'],
            datasets: [
                { label: 'Entrenamiento', data: [train.centroid, train.rms], backgroundColor: 'rgba(33,150,243,0.5)' },
                { label: 'Prueba', data: [test.centroid, test.rms], backgroundColor: 'rgba(244,67,54,0.5)' }
            ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

async function analyze() {
    if (!trainingProfile) {
        M.toast({ html: 'Primero entrena con audios reales' });
        return;
    }
    const file = document.getElementById('test-audio').files[0];
    if (!file) {
        M.toast({ html: 'Selecciona un audio a analizar' });
        return;
    }
    const buf = await fileToArrayBuffer(file);
    const f = await extractFeatures(buf);
    const dist = Math.sqrt(
        Math.pow(f.centroid - trainingProfile.centroid, 2) +
        Math.pow(f.rms - trainingProfile.rms, 2)
    );
    const prob = probabilityFromDistance(dist);
    const clasificacion = prob > 50 ? 'REAL' : 'FAKE';
    document.getElementById('result').innerHTML = `<h5>Resultado: ${clasificacion} (${prob.toFixed(1)}% certeza)</h5>`;
    drawChart(trainingProfile, f);
}

document.addEventListener('DOMContentLoaded', () => {
    M.AutoInit();
    document.getElementById('btn-train').addEventListener('click', train);
    document.getElementById('btn-analyze').addEventListener('click', analyze);
});
