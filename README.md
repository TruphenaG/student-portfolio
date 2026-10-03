# Truphena Chelsea Getugi — Student Portfolio

A responsive personal portfolio with a one-sentence introduction, a developing-skills section, and three projects with source links.

## Website

Public repository: https://github.com/TruphenaG/student-portfolio

GitHub Pages: https://truphenag.github.io/student-portfolio/

## Projects

1. **Study Planner** — add assignments, due dates, and priorities; mark tasks complete; filter tasks; undo an accidental removal; save tasks locally in the browser. [Source](projects/study-planner/) · [Demo](https://truphenag.github.io/student-portfolio/projects/study-planner/)
2. **Grade Calculator** — calculate weighted percentage averages with input validation and an assignment-by-assignment breakdown. [Source](projects/grade-calculator/) · [Demo](https://truphenag.github.io/student-portfolio/projects/grade-calculator/)
3. **Personal Portfolio** — semantic HTML, responsive CSS, keyboard navigation, and a custom favicon. [Source](index.html) · [Website](https://truphenag.github.io/student-portfolio/)

## Run locally

No install or build step is required. From this directory, run:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. A local server is required for the calculator's JavaScript module.

## Publish with GitHub Pages

In this repository, open **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and save. The `.nojekyll` file keeps the site as plain static files. All CSS and demo links use relative paths so the site works at the repository URL.

## Customize

- Edit `index.html` for the statement, skill descriptions, and project summaries.
- Edit `styles.css` for colors, spacing, typography, and responsive layout.
- Project scripts live in their respective `projects/` folders.

## Privacy and limitations

- The planner uses browser local storage only. It does not sync across devices or send task data to a server. Clearing site data removes saved tasks.
- The calculator does not save entries and does not assign letter grades. It requires scores and weights from 0–100 and a total weight of 100%.
- No analytics, external fonts, or tracking scripts are included.

## Try the projects

- **Planner:** Add a task with a due date, reload the page to check that it stays saved, mark it complete, and use the filters. Remove the task and choose **Undo removal** to restore it.
- **Calculator:** Choose **Try an example** to see 90 at 40% and 80 at 60% produce 84%. Change a weight so the total is not 100% to see the validation message. The result table shows each score’s contribution.

## Project structure

```text
index.html                     Portfolio content and navigation
styles.css                     Shared responsive styles
projects/study-planner/         Planner page and browser-storage logic
projects/grade-calculator/      Calculator page, UI, and calculation module
```
