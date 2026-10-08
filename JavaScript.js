(() => {
  function startOdontogram() {
let providedTreatments = null;
let noteOverride = null;
const query = selector => document.querySelector(selector);
const all = selector => document.querySelectorAll(selector);
const byId = id => document.getElementById(id);

function setDentitionButtons(mode) {
  all(".dentition-button").forEach(button => {
    const active = button.dataset.dentition === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setAttributes(element, attributes) {
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

function refreshChart() {
  ensureProvidedTreatments();
  noteOverride = null;
  updateFindingButtons();
  renderFindings();
  updateNote();
  updatePreparationFields();
  saveOdontogram(true);
}

function finishSelection() {
  clearTemporarySelection();
  selections = [];
  refreshChart();
}

let selections = [];
let findings = [];
let nextBatchId = 1;
let chartEdits = {};
const anteriorTeeth = [ 6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27 ];
const maxillaryTeeth = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
const mandibularTeeth = [ 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17 ];
const primaryToothMap = {
  4: "A", 5: "B", 6: "C", 7: "D", 8: "E", 9: "F", 10: "G", 11: "H", 12: "I", 13: "J",
  20: "K", 21: "L", 22: "M", 23: "N", 24: "O", 25: "P", 26: "Q", 27: "R", 28: "S", 29: "T"
};
const positionFindings = [ "mobility", "tilted", "rotated", "super-eruption", "erupting" ];
const mixedPermanentTeeth = [ 3, 14, 19, 30, 7, 8, 9, 10, 23, 24, 25, 26 ];
createArch("maxillary", maxillaryTeeth);
createArch("mandibular", mandibularTeeth);
updateFindingButtons();

function createArch(containerID, teeth) {
  const container = byId(containerID);
  teeth.forEach((toothNumber, index) => {
    const tooth = createTooth(toothNumber);
    if (index === 7) tooth.classList.add("midline");
    container.appendChild(tooth);
  });
}

function createTooth(toothNumber) {
  const wrapper = document.createElement("div");
  wrapper.className = "tooth";
  wrapper.dataset.tooth = toothNumber;
  const isAnterior = anteriorTeeth.includes(toothNumber);
  const centerSurface = isAnterior ? "I" : "O";
  const outerSurface = isAnterior ? "F" : "B";
  const isRightSide = (toothNumber >= 1 && toothNumber <= 8) || (toothNumber >= 25 && toothNumber <= 32);
  const leftSurface = isRightSide ? "D" : "M";
  const rightSurface = isRightSide ? "M" : "D";
  const isMandibular = toothNumber >= 17 && toothNumber <= 32;
  const topSurface = isMandibular ? "L" : outerSurface;
  const bottomSurface = isMandibular ? outerSurface : "L";
  wrapper.innerHTML = ` <svg class="tooth-diagram" viewBox="0 0 120 205" data-tooth="${toothNumber}" >
    <path class="surface" data-surface="${topSurface}" d="M 13.515 13.515 Q 17.029 10 22 10 H 98 Q 102.971 10 106.485 13.515 L 85 35 H 35 Z" >
    </path>
    <path class="surface" data-surface="${leftSurface}" d="M 13.515 13.515 L 35 35 V 85 L 13.515 106.485 Q 10 102.971 10 98 V 22 Q 10 17.029 13.515 13.515 Z" >
    </path>
    <rect class="surface" data-surface="${centerSurface}" x="35" y="35" width="50" height="50" >
    </rect>
    <path class="surface" data-surface="${rightSurface}" d="M 106.485 13.515 Q 110 17.029 110 22 V 98 Q 110 102.971 106.485 106.485 L 85 85 V 35 Z" >
    </path>
    <path class="surface" data-surface="${bottomSurface}" d="M 13.515 106.485 L 35 85 H 85 L 106.485 106.485 Q 102.971 110 98 110 H 22 Q 17.029 110 13.515 106.485 Z" >
    </path>
    <g class="endo-coronal-network">
    <path class="endo-coronal-links" d="M60 60 L60 23 M60 60 L23 60 M60 60 L97 60 M60 60 L60 98" >
    </path>
    <circle cx="60" cy="23" r="9">
    </circle>
    <circle cx="23" cy="60" r="9">
    </circle>
    <circle cx="60" cy="60" r="9">
    </circle>
    <circle cx="97" cy="60" r="9">
    </circle>
    <circle cx="60" cy="98" r="9">
    </circle>
    </g>
    <text x="60" y="28">${topSurface}</text>
    <text x="23" y="65">${leftSurface}</text>
    <text x="60" y="65">${centerSurface}</text>
    <text x="97" y="65">${rightSurface}</text>
    <text x="60" y="103">${bottomSurface}</text>
    <rect class="surface cervical-surface" data-surface="C" x="15" y="135" width="90" height="40" rx="3" >
    </rect>
    <text class="cervical-label" x="60" y="155" >C</text>
    <g class="lengthening-arrows">
    <path d="M35 181 V197 M29 191 L35 197 L41 191" >
    </path>
    <path d="M60 181 V197 M54 191 L60 197 L66 191" >
    </path>
    <path d="M85 181 V197 M79 191 L85 197 L91 191" >
    </path>
    </g>
    <g class="endo-symbol">
    <path class="endo-root" d="M43 130 Q60 125 77 130 L68 169 Q60 184 52 169 Z" >
    </path>
    <path class="endo-canal" d="M50 135 H70 M60 135 L60 174" >
    </path>
    </g>
    <g class="pulpotomy-symbol">
    <path class="endo-root" d="M43 130 Q60 125 77 130 L68 169 Q60 184 52 169 Z" >
    </path>
    <rect class="pulp-chamber" x="49" y="132" width="22" height="10" rx="2" >
    </rect>
    </g>
    <g class="post-core-symbol">
    <path class="endo-root" d="M43 130 Q60 125 77 130 L68 169 Q60 184 52 169 Z" >
    </path>
    <path class="post-canal" d="M60 155 V174" >
    </path>
    <rect class="core-block" x="47" y="130" width="26" height="12" rx="2" >
    </rect>
    <path class="post-shaft" d="M60 140 V159" >
    </path>
    </g>
    <g class="implant-symbol" transform="translate(0 121) scale(1 .38)" >
    <path d="M48 14 H72 V29 L77 35 H43 L48 29 Z" fill="#ccefed" >
    </path>
    <path d="M40 36 H80 V48 L72 127 Q60 147 48 127 L40 48 Z" fill="#e8f6f5" >
    </path>
    <path d="M39 49 L80 55 M41 62 L78 68 M42 75 L77 81 M44 88 L76 94 M45 101 L74 107 M47 114 L72 120 M50 126 L68 132" fill="none" >
    </path>
    </g>
    <rect class="crown-outline" x="6" y="6" width="108" height="108" rx="8" >
    </rect>
    <path class="extraction-cross" d="M10 10 L110 175 M110 10 L10 175" >
    </path>
    </svg>
    <div class="tooth-number" data-tooth="${toothNumber}" data-age="permanent" >#${toothNumber}</div>
    <div class="root-markers" data-tooth="${toothNumber}" >
    </div>
    <div class="watch-marker" data-tooth="${toothNumber}" >
    <svg viewBox="0 0 32 20" role="img" aria-label="Watch tooth" >
    <path d="M2 10 Q16 -5 30 10 Q16 25 2 10 Z">
    </path>
    <circle cx="16" cy="10" r="4">
    </circle>
    </svg>
    </div>
    <div class="position-display" data-tooth="${toothNumber}" >
    </div> `;
  return wrapper;
}

function getToothLabel(toothNumber) {
  const numberElement = query( `.tooth-number[data-tooth="${toothNumber}"]` );
  if ( numberElement && numberElement.dataset.age === "primary" ) return "#" + primaryToothMap[toothNumber];
  return "#" + toothNumber;
}
document.addEventListener("click", event => {
  const surface = event.target.closest(".surface");
  if (!surface) return;
  const svg = surface.closest(".tooth-diagram");
  const toothNumber = Number(svg.dataset.tooth);
  const surfaceName = surface.dataset.surface;
  if (hasWholeSelections()) {
    clearTemporarySelection();
    selections = [];
  }
  let toothSelection = selections.find((item) => item.tooth === toothNumber && item.whole === false);
  if (!toothSelection) {
    toothSelection = {
      tooth: toothNumber, surfaces: [], whole: false };
    selections.push(toothSelection);
  }
  if (toothSelection.surfaces.includes(surfaceName)) {
    toothSelection.surfaces = toothSelection.surfaces.filter((item) => item !== surfaceName);
    surface.classList.remove("selected");
  } else {
    toothSelection.surfaces.push(surfaceName);
    surface.classList.add("selected");
  }
  if (toothSelection.surfaces.length === 0) selections = selections.filter((item) => item !== toothSelection);
  updateFindingButtons();
});
document.addEventListener("click", event => {
  const number = event.target.closest(".tooth-number");
  if (!number) return;
  const toothNumber = Number(number.dataset.tooth);
  if (hasSurfaceSelections()) {
    clearTemporarySelection();
    selections = [];
  }
  const existing = selections.find((item) => item.tooth === toothNumber && item.whole === true);
  if (existing) {
    selections = selections.filter((item) => item !== existing);
    number.classList.remove("selected");
  } else {
    selections.push({
      tooth: toothNumber, surfaces: [], whole: true });
    number.classList.add("selected");
  }
  updateFindingButtons();
});

function hasWholeSelections() {
  return selections.some(item => item.whole === true);
}

function hasSurfaceSelections() {
  return selections.some(item => item.whole === false);
}

function clearTemporarySelection() {
  all(".surface.selected, .tooth-number.selected")
  .forEach(element => element.classList.remove("selected"));
}

function isToothMissing(toothNumber) {
  const tooth = query( `.tooth[data-tooth="${toothNumber}"]` );
  return Boolean(tooth && tooth.hidden) || findings.some((record) => record.tooth === toothNumber && record.whole === true && record.finding === "missing");
}

function ensureProvidedTreatments() {
  if (query('input[name="cohri-provided"]:checked')?.value !== "change" || providedTreatments !== null) return;
  const previous = byId("providedDetails").value;
  const legacy = [...previous.matchAll(/(Composite|Amalgam|RMGI|IRM)\s*#+\s*(\d{1,2}|[A-T])(?:[\s-]+([MODBLFIC]+)\b)?/gi)].map(match => {
    const label = match[2].toUpperCase();
    const number = /^\d+$/.test(label) ? Number(label) : Number(Object.keys(primaryToothMap).find(key => primaryToothMap[key] === label));
    return { tooth: number, toothLabel: "#" + label, finding: match[1], surfaces: (match[3] || "").toUpperCase().split(""), whole: !match[3], treatment: true, batchId: nextBatchId++ };
  }).filter(record => record.tooth >= 1 && record.tooth <= 32);
  providedTreatments = legacy.length ? legacy : findings.filter(record => record.treatment).map(record => ({ ...record, surfaces: [...record.surfaces] }));
}

function renderRecordTags(containerId, treatment) {
  const container = byId(containerId);
  container.replaceChildren();
  const records = containerId === "providedTreatmentTags" ? providedTreatments || [] : findings;
  records.forEach((record, index) => {
    if (Boolean(record.treatment) !== treatment) return;
    const label = "#" + String(record.toothLabel || record.tooth).replace(/^#+/, "");
    const surfaces = orderedSurfaces(record.surfaces).join("");
    const material = ["composite", "amalgam", "sealant", "irm"].includes(record.finding.toLowerCase());
    const description = treatment ? `${record.finding} ${label}${surfaces ? "-" + surfaces : ""}`
      : `${label}${surfaces ? "-" + surfaces : ""} ${material ? "existing " : ""}${record.finding}`;
    const tag = document.createElement("span");
    tag.className = "diagnosis-tag";
    const choose = document.createElement("button");
    choose.type = "button";
    choose.className = "diagnosis-tag-select";
    choose.textContent = description;
    const selected = selections.some(selection => selection.tooth === record.tooth && selection.whole === record.whole &&
      orderedSurfaces(selection.surfaces).join("") === surfaces);
    choose.setAttribute("aria-pressed", String(selected));
    choose.addEventListener("click", () => {
      clearTemporarySelection();
      selections = selected ? [] : [{ tooth: record.tooth, surfaces: [...record.surfaces], whole: record.whole, diagnosis: treatment ? null : record.finding }];
      if (!selected) {
        if (record.whole) query(`.tooth-number[data-tooth="${record.tooth}"]`)?.classList.add("selected");
        else record.surfaces.forEach(surface => {
          query(`.tooth-diagram[data-tooth="${record.tooth}"] .surface[data-surface="${surface}"]`)?.classList.add("selected");
        });
      }
      updateFindingButtons();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "diagnosis-tag-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Delete " + description);
    remove.addEventListener("click", () => {
      records.splice(index, 1);
      finishSelection();
    });
    tag.append(choose, remove);
    container.append(tag);
  });
}

function renderDiagnosisTags() {
  renderRecordTags("diagnosisTags", false);
  renderRecordTags("plannedTreatmentTags", true);
  renderRecordTags("providedTreatmentTags", true);
}

function plannedFillingSurfaces(selection, treatment) {
  const surfaces = [...selection.surfaces];
  if (treatment !== "Composite" || !surfaces.some(surface => ["M", "D"].includes(surface))) return surfaces;
  const isCaries = name => /decay|caries/i.test(name || "");
  const caries = selection.diagnosis !== undefined ? isCaries(selection.diagnosis)
    : findings.some(record => !record.treatment && record.tooth === selection.tooth && isCaries(record.finding) &&
        record.surfaces.some(surface => ["M", "D"].includes(surface) && surfaces.includes(surface)));
  if (caries) {
    const anterior = (selection.tooth >= 6 && selection.tooth <= 11) || (selection.tooth >= 22 && selection.tooth <= 27);
    const additional = anterior ? "L" : "O";
    if (!surfaces.includes(additional)) surfaces.push(additional);
  }
  return orderedSurfaces(surfaces);
}

function updateFindingButtons() {
  const surface = hasSurfaceSelections();
  const whole = selections.length > 0 && !surface;
  const setDisabled = (selector, disabled) => {
    all(selector).forEach(button => { button.disabled = disabled; });
  };
  setDisabled(".watch-treatment", !hasWholeSelections() && !surface);
  setDisabled(".surface-treatment", !surface);
  setDisabled(".whole-treatment", !hasWholeSelections());
  setDisabled(".surface-finding", !surface);
  setDisabled(".whole-finding", !whole);
  const unmissing = whole && selections.every(item => isToothMissing(item.tooth));
  const missingButton = byId("missingMain");
  missingButton.textContent = unmissing ? "(M) Unmissing" : "(M) Missing";
  missingButton.dataset.name = unmissing ? "unmissing" : "missing";
  renderDiagnosisTags();
}
all(".finding").forEach(function(button) {
  button.addEventListener("click", function() {
    if (selections.length === 0) return;
    const finding = this.dataset.name;
    if (finding === "unmissing") {
      delete chartEdits["missing-teeth"];
      const selectedToothNumbers = selections.map((selection) => selection.tooth);
      findings = findings.filter((record) => !( selectedToothNumbers.includes(record.tooth) && record.whole === true && record.finding === "missing" ));
      selectedToothNumbers.forEach(toothNumber => {
        const tooth = query( `.tooth[data-tooth="${toothNumber}"]` );
        if (tooth) tooth.hidden = false;
      });
      finishSelection();
      return;
    }
    if (finding === "missing") delete chartEdits["missing-teeth"];
    const batchId = nextBatchId++;
    if (finding === "Bridge") {
      const selectedTeeth = selections .map((selection) => selection.tooth) .sort((a, b) => a - b);
      if (selectedTeeth.length < 2) {
        alert("Please select at least two teeth for a bridge.");
        return;
      }
      const bridgeStart = selectedTeeth[0];
      const bridgeEnd = selectedTeeth[selectedTeeth.length - 1];
      findings.push({
        tooth: bridgeStart, bridgeTeeth: selectedTeeth, bridgeStart, bridgeEnd, bridgeStartLabel: getToothLabel(bridgeStart), bridgeEndLabel: getToothLabel(bridgeEnd), surfaces: [], whole: true, finding: "Bridge", batchId });
    } else {
      selections.forEach(selection => {
        findings.push({
          tooth: selection.tooth, toothLabel: getToothLabel(selection.tooth), surfaces: [...selection.surfaces], whole: selection.whole, finding, batchId });
      });
    }
    finishSelection();
  });
});
byId("changeAge").addEventListener( "click", () => {
  if (!hasWholeSelections()) {
    alert("Please select one or more tooth numbers first.");
    return;
  }
  selections.forEach(selection => {
    const tooth = query( `.tooth[data-tooth="${selection.tooth}"]` );
    const number = tooth.querySelector(".tooth-number");
    const showPermanent = tooth.hidden || number.dataset.age === "primary";
    setToothAge( selection.tooth, showPermanent ? "permanent" : "primary" );
  });
  clearTemporarySelection();
  selections = [];
  all(".dentition-button").forEach( button => {
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  });
  refreshChart();
});

function setToothAge(toothNumber, age) {
  const tooth = query( `.tooth[data-tooth="${toothNumber}"]` );
  const number = tooth.querySelector(".tooth-number");
  const primary = age === "primary";
  const letter = primaryToothMap[toothNumber];
  tooth.hidden = primary && !letter;
  number.dataset.age = primary && letter ? "primary" : "permanent";
  number.textContent = "#" + (primary && letter ? letter : toothNumber);
}

function setDentition(mode) {
  clearTemporarySelection();
  selections = [];
  all(".tooth").forEach(tooth => {
    const toothNumber = Number(tooth.dataset.tooth);
    const permanent = mode === "permanent" || ( mode === "mixed" && mixedPermanentTeeth.includes(toothNumber) );
    setToothAge( toothNumber, permanent ? "permanent" : "primary" );
  });
  setDentitionButtons(mode);
  refreshChart();
}
all(".dentition-button").forEach( button => {
  button.addEventListener("click", () => { setDentition(button.dataset.dentition); });
});
all(".treatment").forEach(button => {
  button.addEventListener("click", () => {
    if (button.disabled || selections.length === 0) return;
    const bridgeTeeth = ["Bridge", "bridge"].includes(button.dataset.treatment) ? selections.map(selection => selection.tooth) : null;
    if (bridgeTeeth && bridgeTeeth.length < 2) {
      alert("Please select at least two teeth for a bridge.");
      return;
    }
    ensureProvidedTreatments();
    const records = query('input[name="cohri-provided"]:checked')?.value === "change" ? providedTreatments : findings;
    const batchId = nextBatchId++;
    selections.forEach(selection => {
      const label = getToothLabel(selection.tooth);
      const record = {
        tooth: selection.tooth, toothLabel: label, surfaces: plannedFillingSurfaces(selection, button.dataset.treatment), whole: selection.whole, finding: button.dataset.treatment, treatment: true, bridgeTeeth, batchId };
      const duplicate = records.some((r) => r.treatment && r.tooth === record.tooth && r.toothLabel === label && r.finding === record.finding && r.whole === record.whole && [...r.surfaces].sort().join(",") === [...record.surfaces].sort().join(","));
      if (!duplicate) records.push(record);
      delete chartEdits[ "tooth-" + record.tooth + "-" + label ];
    });
    finishSelection();
  });
});

function getRecordColor(record) {
  const selector = record.treatment ? ".treatment" : ".finding";
  const button = Array.from( all(selector) ).find(button => {
    const name = record.treatment ? button.dataset.treatment : button.dataset.name;
    return name === record.finding;
  });
  return button
  ? getComputedStyle(button).backgroundColor
  : null;
}

function markCrown(toothNumber, color) {
  const tooth = query( `.tooth-diagram[data-tooth="${toothNumber}"]` );
  if (!tooth || !color) return;
  tooth.classList.add("has-crown-outline");
  tooth.querySelector(".crown-outline").style.stroke = color;
}

function renderFindings() {
  all(".tooth").forEach(tooth => { tooth.classList.remove("has-watch-marker"); });
  const surfaceClasses = {
    "stain": "stain", "caries": "caries", "cavity": "caries",
    "decay": "caries", "decalcified": "decalcified", "incipient caries": "incipient-caries",
    "recurrent caries": "recurrent-caries", "gross caries": "gross-caries", "composite": "composite",
    "amalgam": "amalgam", "sealant": "sealant", "IRM": "irm",
    "wear": "wear", "chipped": "chipped", "abfraction": "abfraction", "erosion": "erosion",
    "crack line": "crack-line", "broken": "broken"
  };
  const wholeClasses = {
    "SSC": "ssc", "Zirconia crown": "zirconia-crown", "PFM crown": "pfm-crown",
    "Metal crown": "metal-crown", "RCT": "rct", "post & core": "post-core",
    "implant": "implant", "missing": "missing", "root tip": "root-tip",
    "PARL": "parl", "PARO": "paro", "ankylosis": "ankylosis"
  };
  const crownFindings = [ "SSC", "Zirconia crown", "PFM crown", "Metal crown", "implant" ];
  const crownTreatments = [ "CBU", "SSC", "Zirconia", "PFM", "Metal", "Bridge", "bridge", "Implant", "implant" ];
  const fillingTreatments = [ "Composite", "Amalgam", "RMGI", "IRM" ];
  all(".cervical-label").forEach( label => { label.textContent = "C"; });
  all(".root-markers").forEach( marker => { marker.innerHTML = ""; });
  all(".surface").forEach( surface => {
    surface.classList.remove( ...new Set(Object.values(surfaceClasses)) );
    surface.style.removeProperty("fill");
  });
  all(".tooth-diagram").forEach( tooth => {
    tooth.classList.remove( ...Object.values(wholeClasses), "bridge", "extraction-planned", "has-crown-outline", "has-implant-symbol", "has-endo-symbol", "has-lengthening-arrows", "has-pulpotomy-symbol", "has-post-core-symbol", "has-endo-coronal" );
    tooth.style.removeProperty("--endo-color");
    tooth.querySelector(".crown-outline") .style.removeProperty("stroke");
  });
  findings.forEach(record => {
    const color = getRecordColor(record);
    const tooth = query( `.tooth-diagram[data-tooth="${record.tooth}"]` );
    if (!tooth) return;
    if ( ["Pulpotomy", "RCT", "post & core"].includes(record.finding) ) {
      tooth.classList.add("has-endo-coronal");
      tooth.style.setProperty( "--endo-color", color || "#66bb6a" );
    }
    if (record.finding === "RCT") tooth.classList.add("has-endo-symbol");
    if (record.finding === "Pulpotomy") tooth.classList.add("has-pulpotomy-symbol");
    if (record.finding === "post & core") tooth.classList.add("has-post-core-symbol");
    if ( record.treatment && record.finding === "Crown lengthening" ) tooth.classList.add("has-lengthening-arrows");
    if (record.treatment) {
      if (record.finding === "Watch" && record.whole) tooth.closest(".tooth") .classList.add("has-watch-marker");
      if (record.finding === "Extraction") tooth.classList.add("extraction-planned");
      if (["Implant", "implant"].includes(record.finding)) tooth.classList.add("has-implant-symbol");
      if (crownTreatments.includes(record.finding)) markCrown(record.tooth, color);
      if (fillingTreatments.includes(record.finding) && color) {
        record.surfaces.forEach(name => {
          const surface = tooth.querySelector( `.surface[data-surface="${name}"]` );
          if (surface) surface.style.fill = color;
        });
      }
      return;
    }
    if (record.whole) {
      if (positionFindings.includes(record.finding)) return;
      if ( record.finding === "Bridge" && record.bridgeTeeth ) {
        record.bridgeTeeth.forEach(number => { markCrown(number, color); });
        return;
      }
      if ( ["PARL", "PARO", "ankylosis"].includes(record.finding) ) {
        const markers = query( `.root-markers[data-tooth="${record.tooth}"]` );
        const alreadyPresent = Array.from( markers.children ).some((dot) => dot.dataset.finding === record.finding);
        if (!alreadyPresent) {
          const dot = document.createElement("span");
          dot.className = "root-marker";
          dot.dataset.finding = record.finding;
          dot.style.backgroundColor = color;
          dot.title = record.finding;
          dot.setAttribute("aria-label", record.finding);
          markers.appendChild(dot);
        }
        return;
      }
      if (record.finding === "implant") tooth.classList.add("has-implant-symbol");
      if (crownFindings.includes(record.finding)) markCrown(record.tooth, color);
      if (wholeClasses[record.finding]) tooth.classList.add(wholeClasses[record.finding]);
      if (record.finding === "root tip") tooth.querySelector(".cervical-label").textContent = "R";
      return;
    }
    record.surfaces.forEach(name => {
      const surface = tooth.querySelector( `.surface[data-surface="${name}"]` );
      if (!surface) return;
      if (surfaceClasses[record.finding]) surface.classList.add(surfaceClasses[record.finding]);
      if ( ["composite", "amalgam", "sealant", "IRM"] .includes(record.finding) && color ) surface.style.fill = color;
    });
  });
  renderPositions();
  renderBridges();
}

function renderPositions() {
  all(".position-display").forEach( display => { display.innerHTML = ""; });
  all(".tooth-number").forEach( number => { number.classList.remove("has-mobility"); });
  findings.forEach(record => {
    if (!positionFindings.includes(record.finding)) return;
    const display = query( `.position-display[data-tooth="${record.tooth}"]` );
    if (!display) return;
    const item = document.createElement("span");
    item.className = "position-item";
    item.textContent = record.finding.charAt(0).toUpperCase() + record.finding.slice(1);
    display.appendChild(item);
    if (record.finding === "mobility") {
      const toothNumber = query( `.tooth-number[data-tooth="${record.tooth}"]` );
      if (toothNumber) toothNumber.classList.add("has-mobility");
    }
  });
}

function renderBridges() {
  all(".bridge-overlay").forEach( overlay => { overlay.remove(); });
  const bridgeGroups = new Map();
  findings.filter((record) => ["Bridge", "bridge"].includes(record.finding)).forEach(record => {
    const key = (record.treatment ? "treatment-" : "finding-") + record.batchId;
    if (!bridgeGroups.has(key)) {
      bridgeGroups.set(key, {
        record, teeth: new Set() });
    }
    (record.bridgeTeeth || [record.tooth]).forEach( number => { bridgeGroups.get(key).teeth.add(number); });
  });
  const ns = "http://www.w3.org/2000/svg";
  all(".arch").forEach(arch => {
    const bounds = arch.getBoundingClientRect();
    const overlay = document.createElementNS(ns, "svg");
    overlay.classList.add("bridge-overlay");
    overlay.setAttribute("width", arch.scrollWidth);
    overlay.setAttribute("height", arch.clientHeight);
    overlay.setAttribute("aria-hidden", "true");
    bridgeGroups.forEach(group => {
      const color = getRecordColor(group.record) || "#ffa726";
      const teeth = [...group.teeth] .map(number => {
        const card = arch.querySelector( `.tooth[data-tooth="${number}"]` );
        if (!card) return null;
        const diagram = card.querySelector(".tooth-diagram");
        const box = diagram.getBoundingClientRect();
        const scale = box.width / 120;
        const pontic = isToothMissing(number);
        if (!pontic) markCrown(number, color);
        return {
          x: box.left - bounds.left + arch.scrollLeft + box.width / 2, y: box.top - bounds.top + arch.scrollTop + 60 * scale, edge: pontic ? 5 : 54 * scale, pontic };
      }) .filter(Boolean) .sort((a, b) => a.x - b.x);
      if (teeth.length < 2) return;
      for (let index = 0; index < teeth.length - 1; index++) {
        const left = teeth[index];
        const right = teeth[index + 1];
        const line = document.createElementNS(ns, "line");
        setAttributes(line, {
          x1: left.x + left.edge, y1: left.y, x2: right.x - right.edge, y2: right.y, stroke: color, "stroke-width": "3", "stroke-linecap": "round" });
        overlay.appendChild(line);
      }
      teeth.filter((tooth) => tooth.pontic).forEach(tooth => {
        const circle = document.createElementNS(ns, "circle");
        setAttributes(circle, { cx: tooth.x, cy: tooth.y, r: "5", fill: color });
        overlay.appendChild(circle);
      });
    });
    arch.appendChild(overlay);
  });
}
let bridgeResizeFrame;
window.addEventListener("resize", () => {
  cancelAnimationFrame(bridgeResizeFrame);
  bridgeResizeFrame = requestAnimationFrame(renderBridges);
});

const findingShortcuts = {
  d: "decay", c: "composite", a: "amalgam",
  r: "RCT", z: "Zirconia crown", b: "Bridge",
  w: "wear", m: "missingMain", t: "root tip",
  p: "PFM crown", i: "incipient caries"
};
all('input[type="radio"][aria-keyshortcuts="N"]').forEach(input => {
  const row = input.closest(".cohri-row");
  row.classList.add("n-shortcut-row");
  row.tabIndex = 0;
  row.setAttribute("aria-keyshortcuts", input.name === "cohri-provided" ? "N" : "N Y");
});
document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const row = event.target.closest(".n-shortcut-row");
  if (row && !event.target.closest("input, label, button, select, textarea, [contenteditable]")) row.focus();
});

document.addEventListener("keydown", event => {
  if ( event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.isComposing ) return;
  if (event.key.toLowerCase() === "n") {
    const typingSelector = "input:not([type='radio']):not([type='checkbox']):not([type='button']):not([type='submit']), textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']";
    if (document.activeElement?.closest(typingSelector) ||
        (event.target instanceof Element && event.target.closest(typingSelector)) ||
        byId("clearAllDialog").open) return;
    const row = document.activeElement?.closest(".n-shortcut-row") ||
      (event.target instanceof Element ? event.target.closest(".n-shortcut-row") : null);
    const option = row?.querySelector('input[type="radio"][value="no-change"], input[type="radio"][value="none"], input[type="radio"][value="no"], input[type="radio"][value="same-as-planned"]');
    if (!option || option.disabled) return;
    event.preventDefault();
    option.checked = true;
    updateCOHRIFields();
    updateTreatmentProvidedFields();
    saveOdontogram(true);
    advanceFormLine(option);
    return;
  }
  if (event.key.toLowerCase() === "y") {
    const typingSelector = "input:not([type='radio']):not([type='checkbox']):not([type='button']):not([type='submit']), textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']";
    if (document.activeElement?.closest(typingSelector) ||
        (event.target instanceof Element && event.target.closest(typingSelector)) ||
        byId("clearAllDialog").open) return;
    const row = document.activeElement?.closest(".n-shortcut-row") ||
      (event.target instanceof Element ? event.target.closest(".n-shortcut-row") : null);
    const option = row?.querySelector('input[type="radio"][value="yes"], input[type="radio"][value="change"]');
    if (!option || option.disabled || option.name === "cohri-provided") return;
    event.preventDefault();
    if (option.checked) {
      const details = row.querySelector(".cohri-details:not([hidden])");
      if (details) details.focus();
      else advanceFormLine(option);
    } else option.click();
    return;
  }
  const editingSelector = "input, textarea, select, " + "[contenteditable]:not([contenteditable='false']), " + "[role='textbox']";
  const active = document.activeElement;
  if (active && active.closest(editingSelector)) return;
  if ( event.target instanceof Element && event.target.closest(editingSelector) ) return;
  const name = findingShortcuts[event.key.toLowerCase()];
  if (!name) return;
  const button = name === "missingMain" ? byId("missingMain") : Array.from(all(".finding")) .find((button) => button.dataset.name === name);
  if ( !button || button.disabled || selections.length === 0 ) return;
  event.preventDefault();
  button.click();
});

const cohriGroups = {
  history: { show: "change", input: "historyDetails" },
  medication: { show: "change", input: "medicationDetails" },
  premedication: { show: "yes", input: "premedicationDetails" },
  provided: { show: "change", input: "providedDetails" }
};

function updateCOHRIFields() {
  Object.entries(cohriGroups).forEach(([name, group]) => {
    const choice = query(`input[name="cohri-${name}"]:checked`);
    byId(group.input).hidden = name === "provided" || choice?.value !== group.show;
    if (name === "provided") byId("providedTreatmentTags").hidden = choice?.value !== "change";
  });
}

function readCOHRI() {
  return Object.fromEntries(Object.entries(cohriGroups).map(([name, group]) => [name, {
    choice: query(`input[name="cohri-${name}"]:checked`)?.value || "",
    details: byId(group.input).value
  }]));
}

function restoreCOHRI(data = {}) {
  Object.entries(cohriGroups).forEach(([name, group]) => {
    const saved = data?.[name];
    all(`input[name="cohri-${name}"]`).forEach(input => {
      input.checked = input.value === saved?.choice;
    });
    byId(group.input).value = typeof saved?.details === "string" ? saved.details : "";
  });
  updateCOHRIFields();
}

all(".cohri-choice").forEach(input => {
  input.addEventListener("change", () => {
    ensureProvidedTreatments();
    updateCOHRIFields();
    renderDiagnosisTags();
    saveOdontogram(true);
  });
});
updateCOHRIFields();

function updatePreparationFields() {
  const changed = query('input[name="cohri-provided"]:checked')?.value === "change";
  const records = changed ? providedTreatments || [] : findings.filter(record => record.treatment);
  const hasProximal = records.some(record => record.surfaces.some(surface => ["M", "D"].includes(surface)));
  byId("proximalPrep").hidden = !hasProximal;
}

byId("providedDetails").addEventListener("input", updatePreparationFields);
all('input[name="cohri-provided"]').forEach(input => input.addEventListener("change", updatePreparationFields));

function updateTreatmentProvidedFields() {
  updatePreparationFields();
  byId("nerveBlockDetails").hidden = !byId("nerveBlock").checked;
  byId("infiltrationDetails").hidden = !byId("localInfiltration").checked;
  ["Right", "Left"].forEach(side => {
    byId("nerve" + side + "Blocks").hidden = !byId("nerve" + side).checked;
  });
}

function readTreatmentProvided() {
  return Object.fromEntries([...all(".provided-input")].map(input => [input.id,
    ["checkbox", "radio"].includes(input.type) ? input.checked : input.value
  ]));
}

function restoreTreatmentProvided(data = {}) {
  all(".provided-input").forEach(input => {
    const saved = data?.[input.id];
    if (["checkbox", "radio"].includes(input.type)) {
      input.checked = typeof saved === "boolean" ? saved : input.defaultChecked;
    } else if (input.tagName === "SELECT") {
      const fallback = [...input.options].find(option => option.defaultSelected)?.value || input.options[0].value;
      input.value = typeof saved === "string" && [...input.options].some(option => option.value === saved)
        ? saved : fallback;
    } else input.value = typeof saved === "string" ? saved : input.defaultValue;
  });
  updateTreatmentProvidedFields();
}

all(".provided-input").forEach(input => {
  input.addEventListener("change", () => {
    updateTreatmentProvidedFields();
    saveOdontogram(true);
  });
});
updateTreatmentProvidedFields();

const odontogramStorageKey = "odontogram-filling-autosave-v1";
let restoringOdontogram = false;
const autosaveMessage = byId("autosaveMessage");

function orderedSurfaces(surfaces) {
  const order = surfaces.includes("M") ? "MOIDBFLC" : "DOIBFLCM";
  return [...surfaces].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function generateClinicalNote(s) {
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[char]));
  const field = value => escape(value);
  const bold = value => `<strong>${escape(value)}</strong>`;
  const sentenceList = items => items.length > 1 ? items.slice(0, -1).join(", ") + (items.length > 2 ? ", and " : " and ") + items.at(-1) : items[0] || "";
  const p = s.provided, c = s.cohri;
  const tooth = record => "#" + String(record.toothLabel || record.tooth).replace(/^#+/, "");
  const site = record => `${tooth(record)}${record.surfaces.length ? "-" + orderedSurfaces(record.surfaces).join("") : ""}`;
  const diagnosisName = value => value.charAt(0).toUpperCase() + value.slice(1);
  const sortTeeth = records => [...records].sort((a, b) => Number(a.tooth) - Number(b.tooth));
  const planned = sortTeeth(s.findings.filter(record => record.treatment));
  const diagnosis = sortTeeth(s.findings.filter(record => !record.treatment));
  const existingMaterials = new Map([["composite", "composite"], ["amalgam", "amalgam"], ["sealant", "sealant"], ["irm", "IRM"]]);
  const diagnosisByTooth = new Map();
  for (const record of diagnosis) {
    const label = tooth(record);
    if (!diagnosisByTooth.has(label)) diagnosisByTooth.set(label, new Map());
    const conditions = diagnosisByTooth.get(label);
    const key = record.finding.toLowerCase().replace(/^existing\s+/, "");
    if (!conditions.has(key)) conditions.set(key, { surfaces: [], whole: false });
    const condition = conditions.get(key);
    condition.surfaces = [...new Set([...condition.surfaces, ...record.surfaces])];
    condition.whole ||= record.whole;
  }
  const conditionRank = name => name === "decay" ? 0 : existingMaterials.has(name) ? 2 : 1;
  const diagnosisText = [...diagnosisByTooth].map(([label, conditions]) => {
    const descriptions = [...conditions].sort(([a], [b]) => conditionRank(a) - conditionRank(b)).map(([name, condition]) => {
      const surfaces = condition.whole ? "" : orderedSurfaces(condition.surfaces).join("");
      const description = existingMaterials.has(name) ? "existing " + existingMaterials.get(name) : name;
      return `${surfaces ? surfaces + " " : ""}${description}`;
    });
    return field(`${label}-${descriptions.join("/")}`);
  }).join(", ");

  const status = name => {
    const item = c[name];
    if (!item?.choice) return "";
    if (item.choice === "no-change") return "No change";
    if (item.choice === "none") return "None";
    return item.details.trim() || (item.choice === "yes" ? "Yes" : "Change");
  };
  const confirmed = c.provided?.choice;
  const restorations = confirmed === "same-as-planned" ? planned : confirmed === "change" ? sortTeeth(s.providedRecords || []) : [];
  const tx = restorations.map(record => field(`${record.finding} ${site(record)}`)).join(", ");
  const lines = [
    `${bold("Appointment for")}: ${planned.map(record => escape(record.finding) + " " + field(site(record))).join(", ")}`, "",
    `${bold("Vitals:")} BP: ${field(s.vitals.bp)} mmHg. Pulse: ${field(s.vitals.pulse)} bpm, Temperature: ${field(s.vitals.temperature)} F`,
    `${bold("Update MHX and DHX:")} ${field(status("history"))}`,
    `${bold("Update medication:")} ${field(status("medication"))}`,
    `${bold("Pre-medication:")} ${field(status("premedication"))}`, "",
    `${bold("Diagnosis:")} ${diagnosisText}`, "",
    `${bold("Treatment provided:")} ${tx}`
  ];
  if (p.inhaledNOYes) lines.push(`${bold("- Inhaled NO:")} Used to alleviate patient anxiety and provide mild analgesia. 100% O2 was administered during the starting procedure, then NO increased to 50%. Upon completion of the procedure, the patient inhaled with 100% O2 in 5 minutes.`);
  const anesthesia = [];
  const teeth = [...new Set(restorations.map(record => tooth(record)))];
  if (p.topicalBenzocaine) anesthesia.push(`Topical benzocaine was applied around ${teeth.length > 1 ? "teeth" : "tooth"} ${field(teeth.join(", "))}${p.nerveBlock ? " and block injection locations" : ""}.`);
  const drug = label => label.replace(/\bepi\b/gi, "epinephrine");
  if (p.nerveBlock) {
    const locations = [], blocks = ["PSA", "MSA", "ASA", "Palatal", "IAN", "Buccal block", "Mental block"];
    for (const [side, mark] of [["Right", "R"], ["Left", "L"]]) {
      if (p["nerve" + side]) blocks.forEach((block, i) => {
        if (p["nerve" + side + i]) locations.push(field(`(${mark}) ${block}${block.endsWith("block") ? "" : " block"}`));
      });
    }
    anesthesia.push(`${field(`${p.nerveCarpules || ""} carpules of ${drug(s.nerveLA)}`)} was administered via ${sentenceList(locations) || ""}.`);
  }
  if (p.localInfiltration) anesthesia.push(`${p.nerveBlock ? "Then local infiltration" : "Local infiltration"} with ${field(`${p.infiltrationCarpules || ""} carpules of ${drug(s.infiltrationLA)}`)} was administered around the tooth.`);
  if (anesthesia.length) lines.push(`${bold("- Anesthesia:")} ${anesthesia.join(" ")}`);
  if (restorations.length) {
    const sites = [...new Set(restorations.map(site))];
    const prep = [], restoration = [];
    const isolation = p.isolationDam ? "clamps and rubber dam" : p.isolationIsolite ? "Isolite with high volume suction" : p.isolationCotton ? "Dri-angle, throat pack and cotton rolls" : "";
    if (isolation) prep.push(`Isolation was achieved with ${escape(isolation)}.`);
    const removed = p.removeOldFilling && p.removeCaries ? "the existing restoration and all carious tooth structure" : p.removeOldFilling ? "the existing restoration" : p.removeCaries ? "all carious tooth structure" : "";
    const technique = p.conventionalPrep ? "Conventional" : p.conservativePrep ? "Conservative" : "";
    if (technique) prep.push(`${technique} cavity preparation was performed${removed ? ", ensuring complete removal of " + removed : ""}.`);
    else if (removed) prep.push(`${removed.charAt(0).toUpperCase() + removed.slice(1)} ${p.removeOldFilling && p.removeCaries ? "were" : "was"} completely removed.`);
    const proximalByTooth = new Map();
    for (const record of restorations) {
      const proximal = record.surfaces.filter(surface => ["M", "D"].includes(surface));
      if (proximal.length) proximalByTooth.set(tooth(record), [...new Set([...(proximalByTooth.get(tooth(record)) || []), ...proximal])]);
    }
    for (const [label, surfaces] of proximalByTooth) {
      const proximal = orderedSurfaces(surfaces);
      if (p.mdBox) prep.push(`${proximal.join(" and ")} ${proximal.length > 1 ? "boxes were" : "box was"} created on tooth ${escape(label)}.`);
      if (p.slotPrep) prep.push(`${proximal.join(" and ")} slot preparation was performed on tooth ${escape(label)}.`);
    }
    lines.push(`- ${bold(`Preparation ${sites.join(", ")}`)}: ${prep.join(" ")}`);
    if (p.glumaYes) restoration.push("GLUMA desensitizer was applied.");
    const composites = restorations.filter(record => record.finding.toLowerCase() === "composite");
    const compositeSites = [...new Set(composites.map(site))];
    if (p.imgiYes) restoration.push("The pulpal floor was lined with IMGI" + (composites.length === restorations.length ? ", and the preparation was etched with 38% phosphoric acid." : "."));
    if (composites.length) {
      if (composites.length < restorations.length) restoration.push(`For ${escape(compositeSites.join(", "))}, the preparation was etched with 38% phosphoric acid.`);
      else if (!p.imgiYes) restoration.push("The preparation was etched with 38% phosphoric acid.");
      restoration.push("BeautiBond was then applied and light-cured.");
    }
    restoration.push(`Shade ${escape(p.providedShade)} was chosen.`);
    if (composites.length) {
      const materials = [];
      if (p.flowableYes) materials.push("flowable");
      if (p.compactableYes) materials.push("packable");
      if (materials.length) restoration.push(`${compositeSites.length > 1 ? "The cavities were" : "The cavity was"} restored using ${escape(p.providedShade)} ${materials.join(" and ")} composite resin${composites.length < restorations.length ? " on " + escape(compositeSites.join(", ")) : ""}.`);
      const occlusalSites = [...new Set(composites.filter(record => record.surfaces.includes("O")).map(site))];
      if (occlusalSites.length) restoration.push(`The cusps and grooves were carefully reconstructed to replicate the natural tooth anatomy${occlusalSites.length < sites.length ? " on " + escape(occlusalSites.join(", ")) : ""}.`);
    }
    if (proximalByTooth.size) restoration.push(`The proximal contact${proximalByTooth.size > 1 ? "s" : ""}${proximalByTooth.size < new Set(restorations.map(tooth)).size ? " on " + escape([...proximalByTooth.keys()].join(", ")) : ""}, marginal adaptation, and occlusion were evaluated and adjusted as needed.`);
    else restoration.push("Marginal adaptation and occlusion were evaluated and adjusted as needed.");
    restoration.push(`${sites.length > 1 ? "The restorations were" : "The restoration was"} finished and polished using BEAM burs with a low-speed handpiece.`);
    lines.push(`- ${bold(`Restoration ${sites.join(", ")}:`)} ${restoration.join(" ")}`);
    lines.push("", "Postoperative instructions were provided, including avoiding chewing until anesthesia wears off, maintaining oral hygiene, and expecting temporary sensitivity. The patient was advised to contact the clinic for a high bite, persistent sensitivity, or worsening pain.");
  }
  lines.push("", `${bold("NV:")} ${escape(p.noteNV)}`, `${bold("Student Dr:")} Long Ton`, `${bold("Preceptor:")} ${escape(p.notePreceptor)}`, `${bold("Clinic:")} POD2 - 242`);
  return lines.join("<br>");
}

function cleanNoteHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const allowed = new Set(["STRONG", "B", "EM", "I", "U", "BR", "DIV", "P", "UL", "OL", "LI"]);
  function clean(node) {
    if (node.nodeType === 3) return document.createTextNode(node.textContent);
    const fragment = document.createDocumentFragment();
    if (node.nodeType !== 1 || ["SCRIPT", "STYLE", "IFRAME", "OBJECT"].includes(node.tagName)) return fragment;
    const result = allowed.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : fragment;
    node.childNodes.forEach(child => result.appendChild(clean(child)));
    return result;
  }
  const output = document.createElement("div");
  template.content.childNodes.forEach(node => output.appendChild(clean(node)));
  return output.innerHTML;
}

function updateNote() {
  if (noteOverride !== null) {
    if (byId("generatedNote").innerHTML !== noteOverride) byId("generatedNote").innerHTML = noteOverride;
    return;
  }
  const label = id => {
    const select = byId(id);
    return select.options[select.selectedIndex]?.textContent || "";
  };
  byId("generatedNote").innerHTML = generateClinicalNote({
    findings, providedRecords: providedTreatments, cohri: readCOHRI(), provided: readTreatmentProvided(),
    vitals: Object.fromEntries([...all(".vitals-input")].map(input => [input.dataset.vital, input.value])),
    nerveLA: label("nerveLA"), infiltrationLA: label("infiltrationLA")
  });
}

function saveOdontogram(regenerate = false) {
  if (regenerate === true) noteOverride = null;
  updateNote();
  if (restoringOdontogram) return;
  const data = {
    version: 1,
    noteHtml: noteOverride,
    providedTreatmentRecords: providedTreatments,
    cohri: readCOHRI(),
    treatmentProvided: readTreatmentProvided(),
    vitals: Object.fromEntries([...all(".vitals-input")].map(input => [input.dataset.vital, input.value])),
    findings,
    nextBatchId,
    chartEdits,
    teeth: Array.from( all(".tooth") ).map(tooth => {
      return {
        number: Number(tooth.dataset.tooth), age: tooth.querySelector(".tooth-number").dataset.age, hidden: tooth.hidden };
    }),
    mode:
    query(".dentition-button.active")
    ?.dataset.dentition || null
  };
  try {
    localStorage.setItem( odontogramStorageKey, JSON.stringify(data) );
    autosaveMessage.textContent = "Saved on this device.";
  } catch (error) {
    autosaveMessage.textContent = "Autosave unavailable. This browser could not save the odontogram.";
  }
}

function restoreOdontogram() {
  restoringOdontogram = true;
  try {
    const raw = localStorage.getItem(odontogramStorageKey);
    if (!raw) {
      autosaveMessage.textContent = "Autosave ready on this device.";
      return;
    }
    const data = JSON.parse(raw);
    if ( data.version !== 1 || !Array.isArray(data.findings) || !Array.isArray(data.teeth) ) throw new Error("Invalid saved chart");
    const validFindings = data.findings.every((record) => record && Number.isInteger(record.tooth) && record.tooth >= 1 && record.tooth <= 32 && typeof record.finding === "string" && Array.isArray(record.surfaces) && typeof record.whole === "boolean" && Number.isInteger(record.batchId));
    if (!validFindings) throw new Error("Invalid saved findings");
    all(".vitals-input").forEach(input => {
      input.value = typeof data.vitals?.[input.dataset.vital] === "string"
        ? data.vitals[input.dataset.vital] : "";
    });
    providedTreatments = Array.isArray(data.providedTreatmentRecords) ? data.providedTreatmentRecords.filter(record =>
      record && Number.isInteger(record.tooth) && record.tooth >= 1 && record.tooth <= 32 &&
      typeof record.finding === "string" && Array.isArray(record.surfaces) && record.surfaces.every(surface => typeof surface === "string") && typeof record.whole === "boolean"
    ).map(record => ({ ...record, treatment: true, surfaces: [...record.surfaces] })) : null;
    restoreCOHRI(data.cohri);
    restoreTreatmentProvided(data.treatmentProvided);
    findings = data.findings;
    chartEdits = Object.fromEntries( Object.entries(data.chartEdits || {}) .filter((entry) => typeof entry[1] === "string") );
    nextBatchId = Math.max( Number(data.nextBatchId) || 1, 1 + findings.reduce((max, record) => Math.max(max, record.batchId), 0) );
    data.teeth.forEach(saved => {
      if ( !Number.isInteger(saved.number) || saved.number < 1 || saved.number > 32 ) return;
      setToothAge( saved.number, saved.age === "primary" ? "primary" : "permanent" );
      query( `.tooth[data-tooth="${saved.number}"]` ).hidden = Boolean(saved.hidden);
    });
    setDentitionButtons(data.mode);
    selections = [];
    clearTemporarySelection();
    refreshChart();
    noteOverride = typeof data.noteHtml === "string" ? cleanNoteHTML(data.noteHtml) : null;
    updateNote();
    autosaveMessage.textContent = "Saved odontogram restored.";
  } catch (error) {
    autosaveMessage.textContent = "The saved odontogram could not be restored. " + "Your stored copy has not been changed.";
  } finally {
    restoringOdontogram = false;
  }
}
document.addEventListener("input", event => {
  if (event.target.closest(".vitals-input, .cohri-details, .cohri-choice, .provided-input")) saveOdontogram(true);
});
document.addEventListener("focusout", event => {
  if (event.target.closest(".vitals-input, .cohri-details, .cohri-choice, .provided-input")) saveOdontogram(true);
});
window.addEventListener("pagehide", saveOdontogram);

restoreOdontogram();
updateNote();
renderDiagnosisTags();
byId("generatedNote").addEventListener("input", () => {
  noteOverride = cleanNoteHTML(byId("generatedNote").innerHTML);
  // Keep the cursor in place while saving the editable note.
  const current = byId("generatedNote").innerHTML;
  noteOverride = current === noteOverride ? noteOverride : cleanNoteHTML(current);
  saveOdontogram();
});
byId("copyNote").addEventListener("click", async () => {
  const note = byId("generatedNote");
  try {
    const plain = note.innerText;
    const html = `<div style="font-family:'Times New Roman',Times,serif;font-size:14px;line-height:1.65;color:#000">${note.innerHTML.replaceAll("<strong>", '<strong style="font-weight:700">')}</div>`;
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
      await navigator.clipboard.write([new ClipboardItem({
        "text/plain": new Blob([plain], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" })
      })]);
    } else {
      const range = document.createRange();
      range.selectNodeContents(note);
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      if (!document.execCommand("copy")) throw new Error("Copy unavailable");
    }
    byId("noteCopyStatus").textContent = "Note copied.";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(note);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    byId("noteCopyStatus").textContent = "Note selected. Copy to clipboard.";
  }
});
const clearAllDialog = byId("clearAllDialog");
byId("clearAll").addEventListener( "click", () => { clearAllDialog.showModal(); });
byId("cancelClearAll").addEventListener( "click", () => { clearAllDialog.close(); });
byId("confirmClearAll").addEventListener( "click", () => {
  providedTreatments = null;
  restoreCOHRI();
  restoreTreatmentProvided();
  all(".vitals-input").forEach(input => { input.value = ""; });
  findings = [];
  chartEdits = {};
  selections = [];
  nextBatchId = 1;
  clearTemporarySelection();
  for (let number = 1; number <= 32; number++) {
    setToothAge(number, "permanent");
  }
  setDentitionButtons("permanent");
  refreshChart();
  clearAllDialog.close();
});
all(".finding-section, .treatment-section")
.forEach(section => {
  if (section.querySelector(".category-pair")) return;
  const rows = [...section.children] .filter(row => row.classList.contains("finding-row"));
  for (let i = 0; i < rows.length; i += 2) {
    const pair = document.createElement("div");
    pair.className = "category-pair";
    rows[i].before(pair);
    pair.append(rows[i]);
    if (rows[i + 1]) pair.append(rows[i + 1]);
  }
});

function alignMidline() {
  const canvas = query(".dentition-canvas");
  const tooth8 = query('#maxillary .tooth-diagram[data-tooth="8"]');
  const tooth9 = query('#maxillary .tooth-diagram[data-tooth="9"]');
  if (!canvas || !tooth8 || !tooth9) return;
  const midpoint = ( tooth8.getBoundingClientRect().right + tooth9.getBoundingClientRect().left ) / 2;
  canvas.style.setProperty( "--tooth-midline", `${midpoint - canvas.getBoundingClientRect().left}px` );
}
requestAnimationFrame(alignMidline);
window.addEventListener("resize", alignMidline);

function advanceFormLine(current) {
  const scope = current.closest(".cohri-panel, .treatment-provided");
  if (!scope || scope.classList.contains("note-panel")) return;
  const controls = [...document.querySelectorAll(".cohri-panel input, .cohri-panel select, .treatment-provided:not(.note-panel) input, .treatment-provided:not(.note-panel) select")];
  const row = current.closest(".cohri-row");
  const start = controls.indexOf(current);
  const next = controls.slice(start + 1).find(input => {
    if (input.disabled || input.hidden || input.closest("[hidden]") || !input.getClientRects().length) return false;
    if (current.type === "radio" && input.closest(".cohri-row") === row) return false;
    return true;
  });
  if (!next) return;
  const nextRow = next.closest(".n-shortcut-row");
  if (next.type === "radio" && nextRow) nextRow.focus();
  else next.focus();
}

document.addEventListener("change", event => {
  const input = event.target;
  if (!(input instanceof Element) || !input.matches(".cohri-choice, .provided-input")) return;
  if (input.type === "radio") {
    const details = input.closest(".cohri-row")?.querySelector(".cohri-details:not([hidden])");
    if (details) details.focus();
    else if (input.name === "cohri-provided" && input.value === "change") return;
    else advanceFormLine(input);
  } else if (input.tagName === "SELECT") advanceFormLine(input);
});

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat) return;
  const input = event.target;
  if (!(input instanceof Element) || !input.matches(".vitals-input, .cohri-details, .provided-input")) return;
  event.preventDefault();
  saveOdontogram(true);
  advanceFormLine(input);
});

  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startOdontogram, { once: true });
  } else startOdontogram();
})();
