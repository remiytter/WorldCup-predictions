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

function calculateScore(participant, actualResults) {
    if (!actualResults) {
        return {
            matchScore: 0,
            groupScore: 0,
            totalScore: 0
        };
    }

    let matchScore = 0;
    let groupScore = 0;

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
            matchScore += 3;
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
                matchScore += 1;
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
            groupScore += 2;
        }

        if (predictedGroup.second === actualGroup.second) {
            groupScore += 2;
        }
    }

    return {
        matchScore: matchScore,
        groupScore: groupScore,
        totalScore: matchScore + groupScore
    };
}


function renderLeaderboard() {
    const participants = loadParticipants();
    const actualResults = loadActualResults();

    if (participants.length === 0) {
        leaderboardContainer.innerHTML = "";
        return;
    }

    participants.forEach(function (participant) {
        const scoreData = calculateScore(participant, actualResults);
        participant.matchScore = scoreData.matchScore;
        participant.groupScore = scoreData.groupScore;
        participant.score = scoreData.totalScore;
    });

    participants.sort(function (a, b) {
        return b.score - a.score;
    });

    leaderboardMessage.textContent = "";
    leaderboardMessage.className = "message-box";

    leaderboardContainer.innerHTML = "";

    for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];

    let rankClass = "";

    if (i === 0) {
        rankClass = "gold";
    } else if (i === 1) {
        rankClass = "silver";
    } else if (i === 2) {
        rankClass = "bronze";
    }

    leaderboardContainer.innerHTML += `
        <article class="leaderboard-card ${rankClass}">
            <h3>${i + 1}. ${participant.user}</h3>
            <p>Totalpoeng: ${participant.score}</p>
            <p>Kamp-poeng: ${participant.matchScore}</p>
            <p>Gruppe-poeng: ${participant.groupScore}</p>
        </article>
    `;
}
}

renderLeaderboard();