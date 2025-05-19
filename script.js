const { useState, useEffect } = React;

const domains = [
    'Family',
    'Marriage/Relationships',
    'Parenting',
    'Friendship',
    'Work',
    'Education',
    'Recreation',
    'Spirituality',
    'Citizenship',
    'Physical self-care'
];

const extras = ['Finances', 'Environmental issues'];

function Intro({ onStart }) {
    return (
        <section>
            <img className="hero" src="https://source.unsplash.com/featured/?zen,nature" alt="Zen nature" />
            <p>Welcome to a mindful exploration of your values. Take a deep breath, relax, and move at your own pace.</p>
            <p>You can also download the original questionnaire PDFs:</p>
            <ul className="pdf-links">
                <li><a href="VLQ-1.pdf" target="_blank">VLQ-1 Questionnaire</a></li>
                <li><a href="VLQ-2.pdf" target="_blank">VLQ-2 Questionnaire</a></li>
            </ul>
            <button onClick={onStart}>Begin</button>
        </section>
    );
}

function ImportanceForm({ values, onChange, onToggle, onNext }) {
    return (
        <section>
            <h2>Rate Importance (1-10)</h2>
            {values.map(v => (
                <label key={v.domain}>
                    <input type="checkbox" checked={v.enabled} onChange={() => onToggle(v.domain)} /> {v.domain}
                    <input type="number" min="1" max="10" value={v.importance} onChange={e => onChange(v.domain, Number(e.target.value))} />
                </label>
            ))}
            <button onClick={onNext}>Next</button>
        </section>
    );
}

function ConsistencyForm({ values, onChange, onBack, onNext }) {
    return (
        <section>
            <h2>Rate Consistency (1-10)</h2>
            {values.map(v => (
                <label key={v.domain}>{v.domain}
                    <input type="number" min="1" max="10" value={v.consistency} onChange={e => onChange(v.domain, Number(e.target.value))} />
                </label>
            ))}
            <button onClick={onBack}>Back</button>
            <button onClick={onNext}>See Results</button>
        </section>
    );
}

function Results({ values, onBack }) {
    useEffect(() => {
        const labels = values.map(v => v.domain);
        const importance = values.map(v => v.importance);
        const consistency = values.map(v => v.consistency);
        const ctx = document.getElementById('radar').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels,
                datasets: [
                    { label: 'Importance', data: importance, backgroundColor: 'rgba(108,141,122,0.2)', borderColor: '#6c8d7a' },
                    { label: 'Consistency', data: consistency, backgroundColor: 'rgba(205,224,213,0.2)', borderColor: '#cde0d5' }
                ]
            },
            options: { responsive: true }
        });
    }, [values]);

    function csv() {
        const rows = ['Domain,Importance,Consistency,Discrepancy'];
        values.forEach(v => rows.push(`${v.domain},${v.importance},${v.consistency},${v.importance - v.consistency}`));
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vlq-results.csv';
        a.click();
    }

    function pdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Valued Living Questionnaire Results', 10, 10);
        values.forEach((v, i) => {
            doc.text(`${v.domain}: Importance ${v.importance} Consistency ${v.consistency}`, 10, 20 + i * 10);
        });
        doc.save('vlq-results.pdf');
    }

    const narrative = (() => {
        const discrepancies = values.map(v => ({ domain: v.domain, d: v.importance - v.consistency }));
        const poor = discrepancies.filter(d => Math.abs(d.d) > 2).map(d => d.domain);
        return poor.length ? `Consider focusing on: ${poor.join(', ')}` : 'Great alignment across domains!';
    })();

    return (
        <section>
            <h2>Your Results</h2>
            <canvas id="radar"></canvas>
            <p>{narrative}</p>
            <button onClick={pdf}>Download PDF</button>
            <button onClick={csv}>Download CSV</button>
            <button onClick={onBack}>Back</button>
        </section>
    );
}

function App() {
    const [step, setStep] = useState(0);
    const [dark, setDark] = useState(() => localStorage.getItem('vlqDark') === '1');
    const [font, setFont] = useState(() => Number(localStorage.getItem('vlqFont')) || 16);
    const [values, setValues] = useState(() => {
        const stored = localStorage.getItem('vlqValues');
        if (stored) return JSON.parse(stored);
        return domains.concat(extras).map(d => ({ domain: d, importance: 5, consistency: 5, enabled: domains.includes(d) }));
    });

    useEffect(() => { localStorage.setItem('vlqValues', JSON.stringify(values)); }, [values]);
    useEffect(() => { localStorage.setItem('vlqDark', dark ? '1' : '0'); document.body.classList.toggle('dark', dark); }, [dark]);
    useEffect(() => { localStorage.setItem('vlqFont', font); document.documentElement.style.setProperty('--font-size', font + 'px'); }, [font]);

    const active = values.filter(v => v.enabled);

    const toggleDomain = domain => setValues(v => v.map(d => d.domain === domain ? { ...d, enabled: !d.enabled } : d));
    const setImp = (domain, val) => setValues(v => v.map(d => d.domain === domain ? { ...d, importance: val } : d));
    const setCons = (domain, val) => setValues(v => v.map(d => d.domain === domain ? { ...d, consistency: val } : d));

    return (
        <div>
            <header><h1>Valued Living Questionnaire</h1></header>
            <div className="controls">
                <button onClick={() => setDark(!dark)}>{dark ? 'Light' : 'Dark'} Mode</button>
                <label>Text Size <input type="range" min="14" max="22" value={font} onChange={e => setFont(Number(e.target.value))} /></label>
            </div>
            <div className="progress"><div className="progress-bar" style={{ width: (step / 3) * 100 + '%' }} /></div>
            {step === 0 && <Intro onStart={() => setStep(1)} />}
            {step === 1 && <ImportanceForm values={values} onChange={setImp} onToggle={toggleDomain} onNext={() => setStep(2)} />}
            {step === 2 && <ConsistencyForm values={active} onChange={setCons} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
            {step === 3 && <Results values={active} onBack={() => setStep(2)} />}
            <footer><p>All data stored locally. No information is sent to any server.</p></footer>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
