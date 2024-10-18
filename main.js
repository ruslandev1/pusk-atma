const teams = [
    "Dəmir Yumruq 1",
    "KAEnerji",
    "KA quru",
    "Zəfər",
    "Süd Team",
    "Bəyaz Team",
    "HR Strikes",
    "Dəmir Yumruq 2",
    "Aslan",
    "Enerji",
    "AvroRare",
    "Bizon Pərakəndə",
    "Laboratoriya",
    "Lawyers",
    "Strikers",
    "The visionaries",
    "Şedevr",
    "Bizon",
    "3+2",
    "Fire Catchers",
    "Byte Bowlers",
    "Xəmsə",
    "Zinara",
    "Memento Mori",
    "Bolmilk",
    "Standart",
    "SPL",
    "Bowking",
    "Logistrike",
    "Qartal",
    "Pluton"
];

const groups = ['A', 'B', 'C'];
let groupAssignments = { A: [], B: [], C: [] };
let assignedTeams = new Set();

let lastAssignedGroup = null;
let lastAssignedTeamIndex = -1;
let groupConsecutiveCount = { A: 0, B: 0, C: 0 };

function initializeTeams() {
    const teamsListElement = document.getElementById('teamsList');
    teams.forEach((team, index) => {
        const teamElement = document.createElement('div');
        teamElement.classList.add('team');
        teamElement.innerHTML = `
            ${team}
            <img src="assets/bowled.png" alt="Bowling" class="bowling-icon">
        `;
        teamElement.addEventListener('click', async (event) => {
            if (event.currentTarget.classList.contains('disabled')) return;
            await toggleTeamAssignment(index);
        });
        teamsListElement.appendChild(teamElement);
    });
}

async function toggleTeamAssignment(teamIndex) {
    disableAllTeams(true);
    
    const team = teams[teamIndex];
    
    if (!assignedTeams.has(team)) {
        // Determine which groups are available
        let availableGroups = groups.filter(group => {
            const isNotFull = groupAssignments[group].length < Math.ceil(31 / 3);
            
            const adjacentNotInGroup = 
                !groupAssignments[group].includes(teams[teamIndex - 1]) && 
                !groupAssignments[group].includes(teams[teamIndex + 1]);
            
            return isNotFull && (assignedTeams.size < 30 ? adjacentNotInGroup : true);
        });
        
        if (availableGroups.length > 0) {
            // Calculate the minimum group size
            const minGroupSize = Math.min(...groups.map(g => groupAssignments[g].length));
            
            // Filter groups that are within 1 of the minimum size
            const balancedGroups = availableGroups.filter(g => 
                groupAssignments[g].length <= minGroupSize + 1
            );
            
            // Assign weights to the balanced groups
            let weights = balancedGroups.map(group => {
                if (group === lastAssignedGroup) {
                    return 1; // Lower weight for the last assigned group
                } else {
                    return 10 - groupConsecutiveCount[group] * 3; // Higher weight for less recently used groups
                }
            });
            
            // Choose a group randomly based on weights
            let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            let randomWeight = Math.random() * totalWeight;
            let chosenGroup;
            
            for (let i = 0; i < balancedGroups.length; i++) {
                if (randomWeight < weights[i]) {
                    chosenGroup = balancedGroups[i];
                    break;
                }
                randomWeight -= weights[i];
            }
            
            groupAssignments[chosenGroup].push(team);
            assignedTeams.add(team);
            
            groups.forEach(group => {
                if (group === chosenGroup) {
                    groupConsecutiveCount[group]++;
                } else {
                    groupConsecutiveCount[group] = 0;
                }
            });
            
            lastAssignedGroup = chosenGroup;
            lastAssignedTeamIndex = teamIndex;

            // Play the sound when a team is successfully assigned
            pinSound.currentTime = 0; // Reset the audio to the beginning
            pinSound.play().catch(error => console.log('Error playing sound:', error));
            
            // Permanently disable the assigned team
            const teamElement = document.querySelectorAll('.team')[teamIndex];
            teamElement.classList.add('assigned');
        } else {
            alert("All groups are full or no valid assignments available.");
        }
    }

    updateUI();
    disableAllTeams(false);
}

// Helper function to disable or enable all team buttons
function disableAllTeams(disable) {
    const teamElements = document.querySelectorAll('.team');
    teamElements.forEach(element => {
        if (disable) {
            element.classList.add('disabled');
        } else {
            element.classList.remove('disabled');
        }
    });
}

// Helper function to play sound and wait for it to finish
function playSound(sound) {
    return new Promise(resolve => {
        sound.play();
        sound.onended = resolve;
    });
}

function updateUI() {
    const teamElements = document.querySelectorAll('.team');
    teamElements.forEach((element, index) => {
        if (assignedTeams.has(teams[index])) {
            element.classList.add('assigned');
        } else {
            element.classList.remove('assigned');
        }
    });

    groups.forEach(group => {
        const groupElement = document.getElementById(`group${group}`);
        const currentItems = groupElement.querySelectorAll('div').length;
        const newItems = groupAssignments[group].length - currentItems;

        groupElement.innerHTML = `<h3>${group}</h3>` + 
            groupAssignments[group].map((team, index) => `
                <div class="${index >= currentItems ? 'new-item' : ''}">
                    ${team}
                    <img src="assets/bowling.png" alt="Bowling" class="bowling-icon">
                </div>
            `).join('');

        // Remove the 'new-item' class after the animation completes
        setTimeout(() => {
            groupElement.querySelectorAll('.new-item').forEach(item => {
                item.classList.remove('new-item');
            });
        }, 500); // 500ms matches the animation duration
    });
}

function initializeAudio() {
    pinSound.load();
}

function addRestartButton() {
    const restartButton = document.createElement('button');
    restartButton.innerHTML = '&#x21bb;';  // Unicode for a circular arrow
    restartButton.title = 'Yenidən başla';  // Tooltip text
    restartButton.id = 'restartButton';
    restartButton.addEventListener('click', restartAssignment);
    
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.appendChild(restartButton);
}

function restartAssignment() {
    groupAssignments = { A: [], B: [], C: [] };
    assignedTeams = new Set();
    lastAssignedGroup = null;
    lastAssignedTeamIndex = -1;
    groupConsecutiveCount = { A: 0, B: 0, C: 0 };
    
    const teamElements = document.querySelectorAll('.team');
    teamElements.forEach(element => {
        element.classList.remove('assigned', 'disabled');
    });
    
    updateUI();
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTeams();
    initializeAudio();
    addRestartButton();
});
