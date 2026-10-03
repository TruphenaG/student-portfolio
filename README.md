# Truphena Chelsea Getugi — Student Portfolio

A responsive personal portfolio with a one-sentence introduction, a developing-skills section, and three projects with source links.

## Website

Public repository: https://github.com/TruphenaG/student-portfolio

GitHub Pages: https://truphenag.github.io/student-portfolio/

## Projects

1. **Coursework Planner** — a task dashboard with course labels, add/edit/complete/remove actions, combined search and status filters, deadline and priority sorting, progress metrics, and undo. Records are stored in the browser and older planner records remain compatible. [Source](projects/study-planner/) · [Demo](https://truphenag.github.io/student-portfolio/projects/study-planner/)
2. **Grade Forecaster** — a weighted course model for actual scores, remaining assessments, predicted outcomes, and target-grade planning. Includes saved drafts, an assessment contribution table, and validation for incomplete or invalid weights. [Source](projects/grade-calculator/) · [Demo](https://truphenag.github.io/student-portfolio/projects/grade-calculator/)
3. **Personal Portfolio** — responsive HTML and CSS, semantic navigation, accessible forms, and GitHub Pages deployment. [Source](index.html) · [Website](https://truphenag.github.io/student-portfolio/)

## Run locally

No install or build step is required. From this directory, run:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. A local server is required for the projects’ JavaScript modules.

## Publish with GitHub Pages

In this repository, open **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and save. The `.nojekyll` file keeps the site as plain static files. All CSS and demo links use relative paths so the site works at the repository URL.

## Customize

- Edit `index.html` for the statement, skill descriptions, and project summaries.
- Edit `styles.css` for colors, spacing, typography, and responsive layout.
- Project scripts live in their respective `projects/` folders.

## Privacy and limitations

- Both tools save data in browser local storage only. They do not sync across devices or send entered data to a server. Clearing site data removes saved records.
- Unreadable saved data is left untouched. The tool shows a warning instead of silently overwriting it.
- The grade model assumes fixed positive weights totaling 100%, percentage scores from 0–100, and no dropped scores, penalties, or extra credit. Instructor rules determine actual grades.
- No analytics, external fonts, or tracking scripts are included.

## Try the projects

### Coursework Planner

Choose **Load sample tasks** to explore an example with overdue, due-today, upcoming, and completed assignments. Search by course, filter by status, change the sort order, and edit a task. Remove a task and use **Undo removal**. Reload to check persistence. Sample tasks are labeled and do not replace your existing tasks.

### Grade Forecaster

Choose **Load example**. The completed-work average is **84%**, the projected final grade is **85%**, and reaching a **90%** target requires a **96%** weighted average across the remaining work. Change the target to **95%** to see an unreachable-target result. Clear an expected score: the projection becomes unavailable, while the target calculation still works. Example grades are illustrative, not personal academic results.

## Calculation model

- Earned course points = sum of completed score × weight ÷ 100.
- Completed-work average = earned points ÷ completed weight × 100.
- Projected final grade = earned points + predicted contributions from remaining work.
- Required remaining average = (target − earned points) ÷ remaining weight × 100.
- Required averages are rounded upward to one decimal place. Calculations use unrounded values.

## Project structure

```text
index.html                          Portfolio content and navigation
styles.css                          Shared base and portfolio styles
projects/workspace.css              Dashboard and forecasting layouts
projects/study-planner/model.mjs    Record validation, filtering, sorting, metrics
projects/study-planner/planner.js   Forms, persistence, editing, rendering
projects/grade-calculator/math.mjs  Weighted-average and forecasting model
projects/grade-calculator/calculator.js  Forecast forms, storage, results
```
