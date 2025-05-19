const lifeAreas1 = [
    'Family Relationships',
    'Marriage/Couples/Intimacy',
    'Parenting',
    'Friends/Social Life',
    'Work',
    'Education/Training',
    'Recreation/Fun',
    'Spirituality',
    'Citizenship/Community Life',
    'Physical Self-Care'
];

const lifeAreas2 = [
    'Family', 'Romantic', 'Parenting', 'Friends',
    'Work', 'Education', 'Recreation', 'Spirituality',
    'Citizenship', 'Health', 'Self-Care', 'Art'
];

let journalEntries = [];
let currentStep = 0;
const steps = ['intro','vlq1','vlq2','results','journal'];
let currentSlide1 = 0;
let currentSlide2 = 0;

function updateProgress() {
    let offset = 0;
    if (currentStep === 1) {
        offset = currentSlide1 / lifeAreas1.length;
    } else if (currentStep === 2) {
        offset = currentSlide2 / lifeAreas2.length;
    }
    const progress = ((currentStep + offset) / (steps.length - 1)) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function attachSlider(input) {
    const span = input.nextElementSibling;
    span.textContent = input.value;
    input.addEventListener('input', () => {
        span.textContent = input.value;
    });
}

function createVlq1() {
    const form = document.getElementById('vlq1Form');
    lifeAreas1.forEach(area => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `<label>${area} Importance: <input type="range" min="1" max="10" value="5" name="imp-${area}"><span class="slider-value">5</span></label><br>`+
                        `<label>${area} Consistency: <input type="range" min="1" max="10" value="5" name="cons-${area}"><span class="slider-value">5</span></label>`;
        form.appendChild(slide);
        slide.querySelectorAll('input[type="range"]').forEach(attachSlider);
    });
}

function createVlq2() {
    const form = document.getElementById('vlq2Form');
    const aspects = ['Possibility','Current Importance','Overall Importance','Action','Satisfaction with Action','Concern'];
    lifeAreas2.forEach(area => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        const det = document.createElement('details');
        det.innerHTML = `<summary>${area}</summary>`+
            aspects.map(q => `<label>${q}: <input type="range" min="1" max="10" value="5" name="${q}-${area}"><span class="slider-value">5</span></label>`).join('<br>');
        slide.appendChild(det);
        form.appendChild(slide);
        slide.querySelectorAll('input[type="range"]').forEach(attachSlider);
    });
    // Add prioritization prompts
    form.innerHTML += `<h3>Prioritization</h3><p>Which areas are most important to you right now?</p><textarea name="priority"></textarea>`;
}

function scrollVlq1() {
    const slides = document.querySelectorAll('#vlq1Form .slide');
    if (slides[currentSlide1]) {
        slides[currentSlide1].scrollIntoView({behavior: 'smooth', inline: 'start'});
    }
}

function scrollVlq2() {
    const slides = document.querySelectorAll('#vlq2Form .slide');
    if (slides[currentSlide2]) {
        slides[currentSlide2].scrollIntoView({behavior: 'smooth', inline: 'start'});
    }
}

function showSection(id) {
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    currentStep = steps.indexOf(id);
    if (id === 'vlq1') {
        currentSlide1 = 0;
        scrollVlq1();
    }
    if (id === 'vlq2') {
        currentSlide2 = 0;
        scrollVlq2();
    }
    updateProgress();
}

function gatherVlq1() {
    const form = new FormData(document.getElementById('vlq1Form'));
    const data = lifeAreas1.map(area => ({
        area,
        importance: Number(form.get(`imp-${area}`)),
        consistency: Number(form.get(`cons-${area}`))
    }));
    return data;
}

function gatherVlq2() {
    const form = new FormData(document.getElementById('vlq2Form'));
    const aspects = ['Possibility','Current Importance','Overall Importance','Action','Satisfaction with Action','Concern'];
    const data = lifeAreas2.map(area => {
        let obj = { area };
        aspects.forEach(a => {
            obj[a] = Number(form.get(`${a}-${area}`));
        });
        return obj;
    });
    const priority = form.get('priority');
    return { data, priority };
}

function renderCharts(v1, v2) {
    const ctxRadar = document.getElementById('radarChart').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: v1.map(d => d.area),
            datasets: [
                {
                    label: 'Importance',
                    data: v1.map(d => d.importance),
                    backgroundColor: 'rgba(108,141,122,0.2)',
                    borderColor: '#6c8d7a'
                },
                {
                    label: 'Consistency',
                    data: v1.map(d => d.consistency),
                    backgroundColor: 'rgba(205,224,213,0.2)',
                    borderColor: '#cde0d5'
                }
            ]
        },
        options: { responsive: true }
    });

    const ctxBar = document.getElementById('barChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: lifeAreas2,
            datasets: ['Possibility','Current Importance','Overall Importance','Action','Satisfaction with Action','Concern'].map((a,i)=>({
                label: a,
                data: v2.data.map(d=>d[a]),
                backgroundColor: `hsla(${i*40},70%,70%,0.5)`
            }))
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 10 } } }
    });

    const ctxHeat = document.getElementById('heatMap').getContext('2d');
    new Chart(ctxHeat, {
        type: 'bar',
        data: {
            labels: v1.map(d=>d.area),
            datasets: [{
                label: 'Alignment (Importance - Consistency)',
                data: v1.map(d=>d.importance-d.consistency),
                backgroundColor: v1.map(d=>`rgba(255,99,132,${Math.abs(d.importance-d.consistency)/10})`)
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function generateNarrative(v1, v2) {
    const topAreas = [...v1].sort((a,b)=>b.importance-a.importance).slice(0,3).map(d=>d.area);
    const goodAlign = v1.filter(d=>Math.abs(d.importance-d.consistency)<=2).map(d=>d.area);
    const poorAlign = v1.filter(d=>Math.abs(d.importance-d.consistency)>2).map(d=>d.area);
    const div = document.getElementById('narrative');
    div.innerHTML = `<p>Your highest values include: <strong>${topAreas.join(', ')}</strong>.</p>`+
        `<p>These areas show good alignment between values and actions: <strong>${goodAlign.join(', ')||'None'}</strong>.</p>`+
        `<p>These areas might need attention: <strong>${poorAlign.join(', ')||'None'}</strong>.</p>`+
        `<p>You indicated priority in: <em>${v2.priority}</em>.</p>`+
        `<p>Consider journaling your thoughts below.</p>`;
}

function saveJournal() {
    const text = document.getElementById('journalEntry').value.trim();
    if (text) {
        journalEntries.push(text);
        const li = document.createElement('li');
        li.textContent = text;
        document.getElementById('journalList').appendChild(li);
        document.getElementById('journalEntry').value = '';
    }
}

function setup() {
    createVlq1();
    createVlq2();

    updateProgress();

    document.getElementById('startBtn').addEventListener('click', () => showSection('vlq1'));
    document.getElementById('vlq1Next').addEventListener('click', () => showSection('vlq2'));
    document.getElementById('vlq2Prev').addEventListener('click', () => showSection('vlq1'));
    document.getElementById('vlq2Next').addEventListener('click', () => {
        const v1 = gatherVlq1();
        const v2 = gatherVlq2();
        showSection('results');
        renderCharts(v1,v2);
        generateNarrative(v1,v2);
    });
    document.getElementById('vlq1NextSlide').addEventListener('click', () => {
        if (currentSlide1 < lifeAreas1.length - 1) {
            currentSlide1++;
            scrollVlq1();
            updateProgress();
        }
    });
    document.getElementById('vlq1PrevSlide').addEventListener('click', () => {
        if (currentSlide1 > 0) {
            currentSlide1--;
            scrollVlq1();
            updateProgress();
        }
    });
    document.getElementById('vlq2NextSlide').addEventListener('click', () => {
        if (currentSlide2 < lifeAreas2.length - 1) {
            currentSlide2++;
            scrollVlq2();
            updateProgress();
        }
    });
    document.getElementById('vlq2PrevSlide').addEventListener('click', () => {
        if (currentSlide2 > 0) {
            currentSlide2--;
            scrollVlq2();
            updateProgress();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            if (!document.getElementById('vlq1').classList.contains('hidden')) {
                if (currentSlide1 < lifeAreas1.length - 1) {
                    currentSlide1++;
                    scrollVlq1();
                    updateProgress();
                }
            } else if (!document.getElementById('vlq2').classList.contains('hidden')) {
                if (currentSlide2 < lifeAreas2.length - 1) {
                    currentSlide2++;
                    scrollVlq2();
                    updateProgress();
                }
            }
        }
        if (e.key === 'ArrowLeft') {
            if (!document.getElementById('vlq1').classList.contains('hidden')) {
                if (currentSlide1 > 0) {
                    currentSlide1--;
                    scrollVlq1();
                    updateProgress();
                }
            } else if (!document.getElementById('vlq2').classList.contains('hidden')) {
                if (currentSlide2 > 0) {
                    currentSlide2--;
                    scrollVlq2();
                    updateProgress();
                }
            }
        }
    });
    document.getElementById('journalBtn').addEventListener('click', () => showSection('journal'));
    document.getElementById('saveJournal').addEventListener('click', saveJournal);

    document.getElementById('save').addEventListener('click', () => {
        const data = {
            vlq1: gatherVlq1(),
            vlq2: gatherVlq2(),
            journal: journalEntries
        };
        const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vlq-results.json';
        a.click();
    });

    document.getElementById('print').addEventListener('click', () => window.print());
    document.getElementById('email').addEventListener('click', () => {
        const body = encodeURIComponent(document.getElementById('narrative').innerText);
        location.href = `mailto:?subject=My VLQ Results&body=${body}`;
    });
}

window.onload = setup;
