const matches = [
  {
    id: 1,
    homeTeam: "Norge",
    awayTeam: "Tyskland",
    date: "2026-06-10"
  },
  {
    id: 2,
    homeTeam: "Brasil",
    awayTeam: "Japan",
    date: "2026-06-11"
  },
  {
    id: 3,
    homeTeam: "Frankrike",
    awayTeam: "USA",
    date: "2026-06-12"
  }
];

const groups = [
  {
    id: "A",
    teams: ["Norge", "Tyskland", "Japan", "Brasil"]
  },
  {
    id: "B",
    teams: ["Frankrike", "USA", "Spania", "Italia"]
  }
];

const adminMatchesContainer = document.getElementById("adminMatchesContainer");
const adminGroupsContainer = document.getElementById("adminGroupsContainer");
const saveResultsButton = document.getElementById("saveResultsButton");
const adminMessageBox = document.getElementById("adminMessageBox");

function renderAdminMatches() {
    adminMatchesContainer.innerHTML = "";

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        adminMatchesContainer.innerHTML += `
            <article class="match-card">
                <h3>${match.homeTeam} vs ${match.awayTeam}</h3>
                <p>Dato: ${match.date}</p>

                <div class="score-inputs">
                    <div>
                        <label for="actual-home-${match.id}">${match.homeTeam}</label>
                        <input type="number" id="actual-home-${match.id}" min="0" placeholder="0">
                    </div>

                    <div>
                        <label for="actual-away-${match.id}">${match.awayTeam}</label>
                        <input type="number" id="actual-away-${match.id}" min="0" placeholder="0">
                    </div>
                </div>
            </article>
        `;
    }
}

function renderAdminGroups() {
  adminGroupsContainer.innerHTML = "";

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    let optionsHTML = `<option value="">Velg lag</option>`;

    for (let j = 0; j < group.teams.length; j++) {
      const team = group.teams[j];
      optionsHTML += `<option value="${team}">${team}</option>`;
    }

    adminGroupsContainer.innerHTML += `
      <article class="group-card">
        <h3>Gruppe ${group.id}</h3>

        <div class="group-selects">
          <div>
            <label for="actual-group-${group.id}-first">1.-plass</label>
            <select id="actual-group-${group.id}-first">
              ${optionsHTML}
            </select>
          </div>

          <div>
            <label for="actual-group-${group.id}-second">2.-plass</label>
            <select id="actual-group-${group.id}-second">
              ${optionsHTML}
            </select>
          </div>
        </div>
      </article>
    `;
  }
}

function collectActualResults() {
    const actualMatches = [];
    const actualGroups = [];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        const homeInput = document.getElementById(`actual-home-${match.id}`);
        const awayInput = document.getElementById(`actual-away-${match.id}`);

        actualMatches.push({
            matchId: match.id,
            homeScore: homeInput.value,
            awayScore: awayInput.value
        });
    }

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        const firstPlaceSelect = document.getElementById(`actual-group-${group.id}`);
        const secondPlaceSelect = document.getElementById(`actual-group-${group.id}-second`);

    actualGroups[group.id] = {
      first: firstPlaceSelect.value,
      second: secondPlaceSelect.value
    };
  }

  return {
    matches: actualMatches,
    groups: actualGroups
    };
}

function validateActualResults(actualResults) {
  for (let i = 0; i < actualResults.matches.length; i++) {
    const match = actualResults.matches[i];

    if (match.homeScore === "" || match.awayScore === "") {
      return "Du må fylle inn alle kampresultatene.";
    }
  }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const actualGroup = actualResults.groups[group.id];

    if (!actualGroup.first || !actualGroup.second) {
      return `Du må velge både 1.- og 2.-plass i gruppe ${group.id}.`;
    }

    if (actualGroup.first === actualGroup.second) {
      return `Du kan ikke velge samme lag på både 1.- og 2.-plass i gruppe ${group.id}.`;
    }
  }

  return "";
}

function showAdminMessage(message, type) {
  adminMessageBox.textContent = message;
  adminMessageBox.className = `message-box ${type}`;
}

function saveActualResults() {
  const actualResults = collectActualResults();
  const validationError = validateActualResults(actualResults);

  if (validationError) {
    showAdminMessage(validationError, "error");
    return;
  }

  localStorage.setItem("vmActualResults", JSON.stringify(actualResults));
  showAdminMessage("Fasiten ble lagret.", "success");
}

function loadSavedActualResults() {
  const savedResults = localStorage.getItem("vmActualResults");

  if (!savedResults) {
    return;
  }

  const actualResults = JSON.parse(savedResults);

  for (let i = 0; i < actualResults.matches.length; i++) {
    const match = actualResults.matches[i];

    const homeInput = document.getElementById(`actual-home-${match.matchId}`);
    const awayInput = document.getElementById(`actual-away-${match.matchId}`);

    if (homeInput && awayInput) {
      homeInput.value = match.homeScore;
      awayInput.value = match.awayScore;
    }
  }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const savedGroup = actualResults.groups[group.id];

    const firstPlaceSelect = document.getElementById(`actual-group-${group.id}-first`);
    const secondPlaceSelect = document.getElementById(`actual-group-${group.id}-second`);

    if (savedGroup) {
      firstPlaceSelect.value = savedGroup.first;
      secondPlaceSelect.value = savedGroup.second;
    }
  }
}

renderAdminMatches();
renderAdminGroups();
loadSavedActualResults();

saveResultsButton.addEventListener("click", saveActualResults);