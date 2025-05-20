# Valued Living Questionnaires (VLQ)

This project provides a simple web interface for completing the VLQ‑1 and VLQ‑2 assessments. These questionnaires help you clarify what matters in different areas of life and how closely your actions align with those values.

## Setup
1. Clone or download this repository.
2. No build step is required. You can open `index.html` directly in a web browser.
   - Alternatively, run a small local server (for example `python3 -m http.server`) and visit `http://localhost:8000`.
3. A network connection is needed to load the Chart.js library used for the result charts.

## Usage
1. Open `index.html` in your browser.
2. Choose **VLQ‑1** for a quick check or **VLQ‑2** for a more detailed assessment.
3. Complete the ratings for each life domain and submit the form.
4. After submitting, a results section appears with radar and bar charts summarising your answers.
   - VLQ‑1 also generates a brief written summary that highlights domains you value most, areas of consistency, and potential gaps.
5. Use the buttons under the results to save, print or email the outcome.

## Interpreting the Results
- Higher *Importance* ratings show how strongly you value a domain.
- *Consistency* ratings indicate how well your current actions match those values.
- Large differences between importance and consistency may point to areas for change.
- VLQ‑2 adds extra aspects such as possibility and overall importance, giving a broader picture of your values and priorities.

PDF versions of the questionnaires are available as `VLQ-1.pdf` and `VLQ-2.pdf` for reference.
