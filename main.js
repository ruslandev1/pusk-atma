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
        const totalAssigned = assignedTeams.size;

        // Determine which groups are available
        let availableGroups = groups.filter(group => {
            const isNotFull = groupAssignments[group].length < 11;
            const adjacentNotInGroup = 
                !groupAssignments[group].includes(teams[teamIndex - 1]) && 
                !groupAssignments[group].includes(teams[teamIndex + 1]);
            
            return isNotFull && (totalAssigned < 30 ? adjacentNotInGroup : true);
        });
        
        if (availableGroups.length > 0) {
            // Sort available groups by size (ascending)
            availableGroups.sort((a, b) => groupAssignments[a].length - groupAssignments[b].length);
            
            // Select from the groups with the fewest teams
            const minSize = groupAssignments[availableGroups[0]].length;
            const candidateGroups = availableGroups.filter(group => groupAssignments[group].length === minSize);
            
            // Randomly select from candidate groups
            const chosenGroup = candidateGroups[Math.floor(Math.random() * candidateGroups.length)];
            
            groupAssignments[chosenGroup].push(team);
            assignedTeams.add(team);
            
            lastAssignedGroup = chosenGroup;
            lastAssignedTeamIndex = teamIndex;

            // Play the sound when a team is successfully assigned
            pinSound.currentTime = 0; // Reset the audio to the beginning
            await pinSound.play().catch(error => console.log('Error playing sound:', error));
            
            // Permanently disable the assigned team
            const teamElement = document.querySelectorAll('.team')[teamIndex];
            teamElement.classList.add('assigned');
        } else {
            alert("No valid assignments available. Try assigning to other groups first.");
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
