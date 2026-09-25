# Standards

Status: ACTIVE in Module 3, extended in Module 4.

These are the rules this project's code is required to follow.

1. **Naming.** Variables and functions use descriptive camelCase that names the thing or the action: `savedEvidence`, `renderSkills`. Conventional short names are fine where the role is obvious, such as `event` in a handler or `index` in a loop.
2. **File structure.** Structure lives in index.html, presentation in styles.css, behavior in app.js. No `style=` attributes, no script in the HTML beyond the tag that loads app.js. All application code sits inside one immediately-invoked function so nothing leaks to the global scope.
3. **Comments.** Comments explain why a line exists when the reason is not obvious from reading it. They do not restate what the code does. Debug output is removed before committing.
4. **Commit messages.** A commit message names the behavior that changed and why, not the files touched: "Preserve input text when a save fails" rather than "update app.js."
5. **Forbidden pattern.** Student-entered text reaches the page through `textContent` only. `innerHTML` is never used with any value a user typed. This is a hard rule with no exception.
6. **Accessible feedback.** Every form control has a `<label>`. Success and error messages are announced through a live region rather than appearing silently, and a failed write leaves the student's unsaved text in the input.

## Added for HW4

7. **No string-concatenated SQL.** User values reach SQL through `bind()`, never by being pasted into the query string. worker.js has one INSERT statement; it uses `prepare(...).bind(...)` for every value that came from a request, with no exception.
8. **No credential in the repository.** Not in code, not in config, not in a context file. A database id is an address and is allowed in `wrangler.toml`; a login token, API key, or password is not allowed anywhere in this repository, including in a commit message or a screenshot.
9. **Failed requests are shown, never thrown.** If a `fetch` call fails or the server responds with anything other than 2xx, the page shows a message where the student can see it. Nothing is left only in the browser console.

If this file and context/CLAUDE.md ever disagree, **STANDARDS.md is the source of truth.** The conflicting instruction gets repaired rather than quietly followed.

## Split Test

CLAUDE.md is read on every interaction, so every rule in it spends attention on every task, including tasks it has nothing to do with. Three rules, tested.

**Rule 5, the innerHTML prohibition.** This applies to every task that touches the page, and it never changes between tasks. The rule is the same whether I am adding a form, a list, or an error message. If it were left out of persistent context, the risk is poisoning: Copilot's default for writing to the DOM is `innerHTML`, so the wrong pattern gets generated once, I accept it because it works, and it propagates through every later function built by copying the first. That is a false fact settling in and staying. **Verdict: belongs in CLAUDE.md.**

**Rule 2, separation of concerns.** This applies to every file in the project and stays constant across tasks. Leaving it out risks clash rather than poisoning: I would be asking for "a styled list" while the generated answer inlines the styling, so the instruction and the output contradict each other and I have to reconcile them by hand every time. Cheap to state once, expensive to re-argue per task. **Verdict: belongs in CLAUDE.md.**

**Rule 6, accessible feedback and preserving unsaved input.** This one only applies to tasks that involve a form or a write path. It is irrelevant to renaming a variable, adjusting spacing, or writing the skill data structure, which is most of the tasks in this project. Worse, it changes shape depending on the task: what counts as preserving input for a text field is different from a select, and different again for a delete action. Kept in persistent context, it risks confusion, meaning irrelevant material getting used anyway, producing `aria-live` regions and rollback handling on a function that only formats a string. **Verdict: belongs in the prompt for the task that needs it.** Removed from CLAUDE.md.

Prompt snippet it becomes, pasted only when working on a form or a write path:

> This task touches a write path. Every form control needs an associated `<label>`. Announce success and failure in the existing `#save-status` live region rather than silently. If the write fails, leave the user's text in the input, show the reason, and do not change the visible list.

## Colleague Test

I had my colleague, Joel, read through the instructions and explain in her own words what code following these rules would look like. She understood the main structure pretty quickly: keeping index.html clean, putting all the styling in styles.css without inline styles, wrapping app.js in an IIFE, using camelCase for names, and using textContent for user input. The only part she misunderstood was the split test for the accessibility and failed-write rules. She thought I had left the file unchanged. I updated the document to make it clearer that I intentionally removed those rules from CLAUDE.md because the test showed they were more specific to certain tasks and should be added to prompts when needed.