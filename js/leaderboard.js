const leaderboardContainer = document.getElementById("leaderboardContainer");
const leaderboardMessage = document.getElementById("leaderboardMessage");

function showLeaderboardMessage(message, type) {
    leaderboardMessage.textContent = message;
    leaderboardMessage.className = `message-box ${type}`;
}

function loadParticipants() {
    const savedParticipants = localStorage.getItem("vmParticipants");

    if (!savedParticipants) {
        showLeaderboardMessage("Ingen deltakere har lagret tips ennå", "error");
        return [];
    }

    const participants = JSON.parse(savedParticipants);

    if (participants.length === 0) {
        showLeaderboardMessage("Ingen deltakere har lagret tips ennå", "error");
        return [];
    }

    return participants;
}

function loadActualResults() {
    const savedResults = localStorage.getItem("vmActualResults");

    if (!savedResults) {
        return null;
    }

    return JSON.parse(savedResults);
}

function calculateScore(participant) {
    const actualResults = loadActualResults();

    if (!actualResults) {
        return 0;
    }

    let score = 0;

    for (let i = 0; i < participant.predictions.length; i++) {
        const prediction = participant.predictions[i];

        const actualMatch = actualResults.matches.find(function (match) {
            return match.matchId === prediction.matchId;
        });

        if (!actualMatch) {
            continue;
        }

        const predictedHome = Number(prediction.homeScore);
        const predictedAway = Number(prediction.awayScore);

        const actualHome = Number(actualMatch.homeScore);
        const actualAway = Number(actualMatch.awayScore);

        if (predictedHome === actualHome && predictedAway === actualAway) {
            score += 3;
        } else {
            let predictedWinner = "draw";
            let actualWinner = "draw";

            if (predictedHome > predictedAway) {
                predictedWinner = "home";
            } else if (predictedHome < predictedAway) {
                predictedWinner = "away";
            }

            if (actualHome > actualAway) {
                actualWinner = "home";
            } else if (actualHome < actualAway) {
                actualWinner = "away";
            }

            if (predictedWinner === actualWinner) {
                score += 1;
            }
        }
    }

    for (let groupId in participant.groupPredictions) {
        const predictedGroup = participant.groupPredictions[groupId];
        const actualGroup = actualResults.groups[groupId];

        if (!actualGroup) {
            continue;
        }

        if (predictedGroup.first === actualGroup.first) {
            score += 2;
        }

        if (predictedGroup.second === actualGroup.second) {
            score += 2;
        }
    }
 
    return score;
}


function renderLeaderboard() {
    const participants = loadParticipants();

    if (participants.length === 0) {
        leaderboardContainer.innerHTML = "";
        return;
    }

    participants.forEach(function (participant) {
        participant.score = calculateScore(participant);
    });

    participants.sort(function (a, b) {
        return b.score - a.score;
    });

    leaderboardMessage.textContent = "";
    leaderboardMessage.className = "message-box";

    leaderboardContainer.innerHTML = "";

    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];

        leaderboardContainer.innerHTML += `
            <article class="leaderboard-card">
                <h3>${i + 1}. ${participant.user}</h3>
                <p>Poeng: ${participant.score}</p>
                <p>Antall kamptips: ${participant.predictions.length}</p>
            </article>
        `;
    }
}

renderLeaderboard();