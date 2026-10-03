# Truphena Chelsea Getugi — Student Portfolio

A responsive personal portfolio with a one-sentence introduction, a developing-skills section, and three projects with source links.

## Website

Public repository: https://github.com/TruphenaG/student-portfolio

GitHub Pages: https://truphenag.github.io/student-portfolio/

## Projects

1. **Study Planner** — add assignments, due dates, and priorities; mark tasks complete; filter tasks; save tasks locally in the browser. [Source](projects/study-planner/) · [Demo](https://truphenag.github.io/student-portfolio/projects/study-planner/)
2. **Grade Calculator** — calculate weighted percentage averages with input validation. [Source](projects/grade-calculator/) · [Demo](https://truphenag.github.io/student-portfolio/projects/grade-calculator/)
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
- The course video “Github Setup.mov” was not supplied, so its exact steps could not be checked. Deployment follows GitHub's documented Pages workflow.
