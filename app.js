(() => {
  'use strict';

  // Paste the deployed Worker URL here after `npx wrangler deploy`.
  const API = "https://mgt3745-hw4.rchoi47.workers.dev";

  // Paths and skills are still hard-coded for HW4. FEATURES.md requires this
  // list to be editable, which a stored or fetched list would satisfy; see
  // ADR-001 (and now ADR-002, since it did not change this part).
  const careerPaths = [
    {
      id: 'audit',
      name: 'Audit',
      skills: ['Reviewing documents for missing detail', 'Applying compliance rules', 'Explaining findings to a client']
    },
    {
      id: 'forensic',
      name: 'Forensic accounting',
      skills: ['Investigating inconsistencies', 'Building a written case', 'Reading financial statements critically']
    },
    {
      id: 'government',
      name: 'Government or IRS',
      skills: ['Interpreting tax regulation', 'Handling confidential records', 'Documenting a decision trail']
    }
  ];

  const pathSelect = document.querySelector('#path-select');
  const skillSelect = document.querySelector('#skill-select');
  const skillList = document.querySelector('#skill-list');
  const evidenceForm = document.querySelector('#evidence-form');
  const evidenceInput = document.querySelector('#evidence-input');
  const evidenceError = document.querySelector('#evidence-error');
  const saveStatus = document.querySelector('#save-status');

  let savedEvidence = {};
  let selectedPathId = careerPaths[0].id;

  function evidenceKey(pathId, skillName) {
    return `${pathId}::${skillName}`;
  }

  function findPath(pathId) {
    return careerPaths.find(path => path.id === pathId);
  }

  // ---- HW3, for the record (superseded by ADR-002) ------------------------
  // function loadEvidence() { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
  // function saveEvidence(evidence) { localStorage.setItem(storageKey, JSON.stringify(evidence)); }
  // -------------------------------------------------------------------------

  // HW4: evidence now comes from the deployed Worker instead of this
  // browser's own storage. A row from the server has path_id, skill_name,
  // and evidence_text; this turns those rows into the same
  // "pathId::skillName -> text" shape the rendering code already expects.
  async function loadEvidence() {
    const response = await fetch(API + '/entries');
    if (!response.ok) {
      saveStatus.textContent = 'Could not load saved evidence from the server.';
      return {};
    }
    const rows = await response.json();
    const evidence = {};
    rows.forEach(row => {
      evidence[evidenceKey(row.path_id, row.skill_name)] = row.evidence_text;
    });
    return evidence;
  }

  // Sends one new piece of evidence to the Worker. Returns true only if the
  // server actually accepted it, so the caller never marks a skill
  // evidenced on the strength of a request that failed.
  async function saveEvidence(pathId, skillName, evidenceText) {
    const response = await fetch(API + '/entries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pathId, skillName, evidenceText }),
    });

    if (!response.ok) {
      const reason = await response.text();
      evidenceError.textContent = 'Could not save: ' + (reason || response.status);
      saveStatus.textContent = '';
      return false;
    }

    return true;
  }

  function renderPathOptions() {
    careerPaths.forEach(path => {
      const option = document.createElement('option');
      option.value = path.id;
      option.textContent = path.name;
      pathSelect.append(option);
    });
  }

  function renderSkills() {
    const currentPath = findPath(selectedPathId);

    skillList.replaceChildren();
    skillSelect.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a skill';
    skillSelect.append(placeholder);

    currentPath.skills.forEach(skillName => {
      const storedText = savedEvidence[evidenceKey(selectedPathId, skillName)];

      const listItem = document.createElement('li');

      const nameElement = document.createElement('span');
      nameElement.className = 'skill-name';
      nameElement.textContent = skillName;

      const statusElement = document.createElement('span');
      statusElement.className = 'skill-status';
      statusElement.dataset.state = storedText ? 'evidenced' : 'not-evidenced';
      statusElement.textContent = storedText ? 'Evidenced' : 'Not yet evidenced';

      listItem.append(nameElement, statusElement);

      if (storedText) {
        const evidenceElement = document.createElement('p');
        evidenceElement.className = 'skill-evidence';
        evidenceElement.textContent = storedText;
        listItem.append(evidenceElement);
      }

      skillList.append(listItem);

      const option = document.createElement('option');
      option.value = skillName;
      option.textContent = skillName;
      skillSelect.append(option);
    });
  }

  pathSelect.addEventListener('change', () => {
    selectedPathId = pathSelect.value;
    evidenceError.textContent = '';
    saveStatus.textContent = '';
    renderSkills();
  });

  evidenceForm.addEventListener('submit', async event => {
    event.preventDefault();

    const chosenSkill = skillSelect.value;
    const candidate = evidenceInput.value.trim();
    const characterCount = Array.from(candidate).length;

    if (chosenSkill === '') {
      evidenceError.textContent = 'Choose a skill before saving.';
      saveStatus.textContent = '';
      skillSelect.focus();
      return;
    }

    if (characterCount < 1 || characterCount > 200) {
      evidenceError.textContent = 'Enter evidence containing 1–200 characters.';
      evidenceInput.setAttribute('aria-invalid', 'true');
      saveStatus.textContent = '';
      evidenceInput.focus();
      return;
    }

    evidenceInput.removeAttribute('aria-invalid');
    evidenceError.textContent = '';

    let saved;
    try {
      saved = await saveEvidence(selectedPathId, chosenSkill, candidate);
    } catch {
      // The network itself failed (offline, DNS, CORS). fetch throws here
      // rather than returning a response at all, so this is a separate
      // case from the server answering with a 400 or 500.
      evidenceError.textContent = 'Could not reach the server. Check your connection and try again.';
      saveStatus.textContent = '';
      return;
    }

    if (!saved) return;

    savedEvidence = await loadEvidence();
    renderSkills();
    evidenceInput.value = '';
    skillSelect.value = '';
    evidenceInput.focus();
    saveStatus.textContent = `Evidence saved. ${chosenSkill} is now evidenced.`;
  });

  async function init() {
    renderPathOptions();
    try {
      savedEvidence = await loadEvidence();
    } catch {
      saveStatus.textContent = 'Could not reach the server. Check your connection and try again.';
      savedEvidence = {};
    }
    renderSkills();
  }

  init();
})();