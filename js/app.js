const matches = [
    {
        id: 1,
        homeTeam: "Norge",
        awayTeam: "Tyskland",
        dateTime: "2026-04-10T12:00"
    },
    {
    id: 2,
    homeTeam: "Brasil",
    awayTeam: "Japan",
    dateTime: "2026-06-11T19:00"
  },
  {
    id: 3,
    homeTeam: "Frankrike",
    awayTeam: "USA",
    dateTime: "2026-06-12T21:00"
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

const matchesContainer = document.getElementById("matchesContainer");

const userNameInput = document.getElementById("userName");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const messageBox = document.getElementById("messageBox");
const groupsContainer = document.getElementById("groupsContainer");

const groupLockTime = "2026-06-10T17:00";

function renderMatches() {
    matchesContainer.innerHTML = "";

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const locked = isMatchLocked(match);
        const formattedDateTime = formatMatchDateTime(match.dateTime);

        matchesContainer.innerHTML += `
            <article class="match-card ${locked ? "locked-card" : "open-card"}">
                <div class="match-header">
                    <h3>${match.homeTeam} vs ${match.awayTeam}</h3>
                    <span class="match-status ${locked ? "status-locked" : "status-open"}">
                        ${locked ? "Låst" : "Åpen"}
                    </span>
                </div>

                <p>Start: ${formattedDateTime}</p>

                <div class="score-inputs">
                    <div>
                        <label for="home-${match.id}">${match.homeTeam}</label>
                        <input 
                            type="number" 
                            id="home-${match.id}" 
                            min="0" 
                            placeholder="0"
                            ${locked ? "disabled" : ""}
                        >
                    </div>

                    <div>
                        <label for="away-${match.id}">${match.awayTeam}</label>
                        <input 
                            type="number" 
                            id="away-${match.id}" 
                            min="0" 
                            placeholder="0"
                            ${locked ? "disabled" : ""}
                        >
                    </div>
                </div>
            </article>
        `;
    }
}


function collectPredictions() {
  const userName = userNameInput.value.trim();
  const matchPredictions = [];
  const groupPredictions = {};

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];

    const homeInput = document.getElementById(`home-${match.id}`);
    const awayInput = document.getElementById(`away-${match.id}`);

    matchPredictions.push({
      matchId: match.id,
      homeScore: homeInput.value,
      awayScore: awayInput.value
    });
  }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    const firstPlaceSelect = document.getElementById(`group-${group.id}-first`);
    const secondPlaceSelect = document.getElementById(`group-${group.id}-second`);

    groupPredictions[group.id] = {
      first: firstPlaceSelect.value,
      second: secondPlaceSelect.value
    };
  }

  return {
    user: userName,
    predictions: matchPredictions,
    groupPredictions: groupPredictions
  };
}

function savePredictions() {
    clearMessage();

    const predictionData = collectPredictions();
    const validationError = validatePredictions(predictionData);

    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    const savedParticipants = localStorage.getItem("vmParticipants");
    const participants = savedParticipants ? JSON.parse(savedParticipants) : [];

    const existingParticipantIndex = participants.findIndex(function (participant) {
        return participant.user.toLowerCase() === predictionData.user.toLowerCase();
    });

    if (existingParticipantIndex !== -1) {
        const existingParticipant = participants[existingParticipantIndex];

        for (let i = 0; i < predictionData.predictions.length; i++) {
            const newPrediction = predictionData.predictions[i];

            const match = matches.find(function (matchItem) {
                return matchItem.id === newPrediction.matchId;
            });

            if (isMatchLocked(match)) {
                const oldPrediction = existingParticipant.predictions.find(function (prediction) {
                    return prediction.matchId === newPrediction.matchId;
                });

                if (oldPrediction) {
                    newPrediction.homeScore = oldPrediction.homeScore;
                    newPrediction.awayScore = oldPrediction.awayScore;
                }
            }
        }

        if (areGroupsLocked()) {
    predictionData.groupPredictions = existingParticipant.groupPredictions;
}

        participants[existingParticipantIndex] = predictionData;
    } else {
        participants.push(predictionData);
    }

    localStorage.setItem("vmParticipants", JSON.stringify(participants));
    showMessage("Tipsene dine ble lagret.", "success");
}


function clearPredictionInput() {
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        const homeInput = document.getElementById(`home-${match.id}`);
        const awayInput = document.getElementById(`away-${match.id}`);

        homeInput.value = "";
        awayInput.value = "";
    }
}

function loadParticipantByName() {
    clearMessage();

    const userName = userNameInput.value.trim();

    if (!userName) {
        showMessage("Skriv inn navnet ditt først.", "error");
        return;
    }

    const savedParticipants = localStorage.getItem("vmParticipants");

    if (!savedParticipants) {
        showMessage("Ingen lagrede tips funnet ennå", "error");
        return;
    }

    const participants = JSON.parse(savedParticipants);

    const matchingParticipant = participants.find(function (participant) {
        return participant.user.toLowerCase() === userName.toLowerCase();
    });

    if (!matchingParticipant) {
        showMessage("Fant ingen lagrede tips for dette navnet", "error");
        clearPredictionInput();
        clearGroupInputs();
        return;
    }

    clearPredictionInput();
    clearGroupInputs();

    for (let i = 0; i < matchingParticipant.predictions.length; i++) {
        const prediction = matchingParticipant.predictions[i];

        const homeInput = document.getElementById(`home-${prediction.matchId}`);
        const awayInput = document.getElementById(`away-${prediction.matchId}`);

        homeInput.value = prediction.homeScore;
        awayInput.value = prediction.awayScore;
    }

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const savedGroup = matchingParticipant.groupPredictions[group.id];

        const firstPlaceSelect = document.getElementById(`group-${group.id}-first`);
        const secondPlaceSelect = document.getElementById(`group-${group.id}-second`);

        if (savedGroup) {
            firstPlaceSelect.value = savedGroup.first;
            secondPlaceSelect.value = savedGroup.second;
        }
    }

    showMessage("Lagrede tips hentet inn.", "success");
}

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
}

function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "message-box";
}

function renderGroups() {
    groupsContainer.innerHTML = "";
    const locked = areGroupsLocked();

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        let optionsHTML = `<option value="">Velg lag</option>`;

        for (let j = 0; j < group.teams.length; j++) {
            const team = group.teams[j];
            optionsHTML += `<option value="${team}">${team}</option>`;
        }

        groupsContainer.innerHTML += `
            <article class="group-card ${locked ? "locked-card" : "open-card"}">
                <div class="match-header">
                    <h3>Gruppe ${group.id}</h3>
                    <span class="match-status ${locked ? "status-locked" : "status-open"}">
                        ${locked ? "Låst" : "Åpen"}
                    </span>
                </div>

                <div class="group-selects">
                    <div>
                        <label for="group-${group.id}-first">1.-plass</label>
                        <select id="group-${group.id}-first" ${locked ? "disabled" : ""}>
                            ${optionsHTML}
                        </select>
                    </div>

                    <div>
                        <label for="group-${group.id}-second">2.-plass</label>
                        <select id="group-${group.id}-second" ${locked ? "disabled" : ""}>
                            ${optionsHTML}
                        </select>
                    </div>
                </div>
            </article>
        `;
    }
}

function clearGroupInputs() {
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        const firstPlaceSelect = document.getElementById(`group-${group.id}-first`);
        const secondPlaceSelect = document.getElementById(`group-${group.id}-second`);

        firstPlaceSelect.value = "";
        secondPlaceSelect.value = "";
    }
}

function validatePredictions(predictionData) {
    if (!predictionData.user) {
        return "Du må skrive inn navnet ditt før du lagrer.";
    }

    for (let i = 0; i < predictionData.predictions.length; i++) {
        const prediction = predictionData.predictions[i];

        const match = matches.find(function (matchItem) {
            return matchItem.id === prediction.matchId;
        });

        if (!isMatchLocked(match)) {
            if (prediction.homeScore === "" || prediction.awayScore === "") {
                return `Du må fylle inn tips for alle åpne kamper før du lagrer.`;
            }
        }
    }

    if (!areGroupsLocked()) {
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const groupPrediction = predictionData.groupPredictions[group.id];

            if (!groupPrediction.first || !groupPrediction.second) {
                return `Du må velge både 1.- og 2.-plass i gruppe ${group.id}.`;
            }

            if (groupPrediction.first === groupPrediction.second) {
                return `Du kan ikke velge samme lag på både 1.- og 2.-plass i gruppe ${group.id}.`;
            }
        }
    }

    return "";
}



function isMatchLocked(match) {
    const now = new Date();
    const matchStartTime = new Date(match.dateTime);

    return now >= matchStartTime;
}

function areGroupsLocked() {
    const now = new Date();
    const groupLockDate = new Date(groupLockTime);

    return now >= groupLockDate;
}

function formatMatchDateTime(dateTime) {
    const date = new Date(dateTime);

    return date.toLocaleString("no-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

renderMatches();
renderGroups();


saveButton.addEventListener("click", savePredictions);
loadButton.addEventListener("click", loadParticipantByName);