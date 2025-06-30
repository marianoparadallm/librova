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
    let fluxSum = 0;
    let zcrSum = 0;
    let mfccSum = 0;
    let count = 0;

    for (let i = 0; i + bufferSize <= channelData.length; i += hop) {
        const slice = channelData.slice(i, i + bufferSize);
        const features = Meyda.extract(
            ['rms', 'spectralCentroid', 'spectralFlux', 'zcr', 'mfcc'],
            slice
        );
        centroidSum += features.spectralCentroid || 0;
        rmsSum += features.rms || 0;
        fluxSum += features.spectralFlux || 0;
        zcrSum += features.zcr || 0;
        if (features.mfcc && features.mfcc.length) {
            const avgMfcc =
                features.mfcc.reduce((a, b) => a + b, 0) / features.mfcc.length;
            mfccSum += avgMfcc;
        }
        count++;
    }

    if (count === 0)
        return { centroid: 0, rms: 0, spectralFlux: 0, zcr: 0, mfcc: 0 };

    return {
        centroid: centroidSum / count,
        rms: rmsSum / count,
        spectralFlux: fluxSum / count,
        zcr: zcrSum / count,
        mfcc: mfccSum / count
    };
}

async function train() {
    const files = document.getElementById('train-audios').files;
    if (!files.length) {
        M.toast({ html: 'Selecciona audios para entrenar' });
        return;
    }
    let centroidTotal = 0;
    let rmsTotal = 0;
    let fluxTotal = 0;
    let zcrTotal = 0;
    let mfccTotal = 0;
    for (const file of files) {
        const buf = await fileToArrayBuffer(file);
        const f = await extractFeatures(buf);
        centroidTotal += f.centroid;
        rmsTotal += f.rms;
        fluxTotal += f.spectralFlux;
        zcrTotal += f.zcr;
        mfccTotal += f.mfcc;
    }
    trainingProfile = {
        centroid: centroidTotal / files.length,
        rms: rmsTotal / files.length,
        spectralFlux: fluxTotal / files.length,
        zcr: zcrTotal / files.length,
        mfcc: mfccTotal / files.length
    };
    M.toast({ html: 'Entrenamiento completado' });
}

function probabilityFromDistance(d) {
    const normalized = Math.min(d, 1);
    return Math.max(0, 100 - normalized * 100);
}

function featureDistance(a, b) {
    const eps = 0.0001;
    const diffs = [
        (a.centroid - b.centroid) / (a.centroid + eps),
        (a.rms - b.rms) / (a.rms + eps),
        (a.spectralFlux - b.spectralFlux) / (a.spectralFlux + eps),
        (a.zcr - b.zcr) / (a.zcr + eps),
        (a.mfcc - b.mfcc) / (a.mfcc + eps)
    ];
    return Math.sqrt(diffs.reduce((s, v) => s + v * v, 0));
}

function drawChart(train, test) {
    const ctx = document.getElementById('chart');
    const labels = ['Centroid', 'RMS', 'Flux', 'ZCR', 'MFCC'];
    const trainData = [
        train.centroid,
        train.rms,
        train.spectralFlux,
        train.zcr,
        train.mfcc
    ];
    const testData = [
        test.centroid,
        test.rms,
        test.spectralFlux,
        test.zcr,
        test.mfcc
    ];

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entrenamiento',
                    data: trainData,
                    fill: true,
                    backgroundColor: 'rgba(33,150,243,0.2)',
                    borderColor: 'rgba(33,150,243,1)'
                },
                {
                    label: 'Prueba',
                    data: testData,
                    fill: true,
                    backgroundColor: 'rgba(244,67,54,0.2)',
                    borderColor: 'rgba(244,67,54,1)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: { r: { beginAtZero: true } }
        }
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
    const dist = featureDistance(trainingProfile, f);
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
