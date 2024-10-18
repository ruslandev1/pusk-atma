const ballEmbedImg = 'assets/image.png'; // Your base64 image data here
const GROUPS_COUNT = 6;
const POTA_TEAM_COUNT = 7;

const groups = [
    {name: 'A', teams: []},
    {name: 'B', teams: []},
    {name: 'C', teams: []},
    {name: 'D', teams: []},
    {name: 'E', teams: []},
    {name: 'F', teams: []},
];

const teams = [
    {name: 'Gəncə (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Fabrist (İstehsalat)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Key Account', selection: {groupId: -1, orderNo: -1}},
    {name: 'Logistika', selection: {groupId: -1, orderNo: -1}},
    {name: 'Enerji (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Dairy Team (süd şöbəsi)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Tamstore', selection: {groupId: -1, orderNo: -1}},
    {name: 'Bərdə (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Harika (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Maliyyə', selection: {groupId: -1, orderNo: -1}},
    {name: 'SPL (Tədarük zənciri)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Xırdalan (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Oven', selection: {groupId: -1, orderNo: -1}},
    {name: 'AlcoPoint', selection: {groupId: -1, orderNo: -1}},
    {name: 'Avropack', selection: {groupId: -1, orderNo: -1}},
    {name: 'Anbar təsərrüfatı', selection: {groupId: -1, orderNo: -1}},
    {name: 'İstehsalçı (İstehsalat)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Lənkəran (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Marketing', selection: {groupId: -1, orderNo: -1}},
    {name: 'Saatlı (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Ellab', selection: {groupId: -1, orderNo: -1}},
    {name: 'Audit', selection: {groupId: -1, orderNo: -1}},
    {name: 'United Ops', selection: {groupId: -1, orderNo: -1}},
    {name: 'Keyfiyyətə nəzarət', selection: {groupId: -1, orderNo: -1}},
    {name: 'Milla (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Quba (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Şəki (satış)', selection: {groupId: -1, orderNo: -1}},
    {name: 'Təhlükəsizlik', selection: {groupId: -1, orderNo: -1}},
];

let selections = [];

const compareTeam = (a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
};

const createTeamHtml = (team, teamId) => {
    const imgHtml = team.selection.groupId > -1
        ? `<img height="30" class="teamNameBall" src="${ballEmbedImg}"/>${groups[team.selection.groupId].name}`
        : `<img style="cursor: pointer;" onClick="addSelection(${teamId})" height="30" src="assets/image2.png"/>`;
    
    const className = team.selection.groupId > -1 ? 'selectedTeamName' : 'unSelectedTeamName';
    return `<div class="${className}">${team.name}${imgHtml}</div>`;
};

const getTeamNamesList = (start, end) => {
    return teams.slice(start, end + 1).map((team, index) => createTeamHtml(team, start + index)).join('');
};

const updateSelectionOrderHtml = () => {
    const html = `
        <ol>
            ${selections.map(selection => `
                <li class="selectionOrder" ondblclick="removeSelection(${selection.teamId})">
                    ${teams[selection.teamId].name}
                </li>
            `).join('')}
        </ol>
    `;
    document.getElementById("selectionOrder").innerHTML = html;
};

const updateSelectionHtml = () => {
    groups.forEach((group, groupIndex) => {
        const groupHtml = selections
            .filter(selection => teams[selection.teamId].selection.groupId === groupIndex)
            .map(selection => `<li>${teams[selection.teamId].name}</li>`)
            .join('');
        document.getElementById(`selectionList${groupIndex}`).innerHTML = `<ol>${groupHtml}</ol>`;
    });
};

const updateNamesListHtml = () => {
    for (let i = 0; i < 4; i++) {
        const elem = document.getElementById(`team${i}`);
        elem.innerHTML = getTeamNamesList(i * 7, i * 7 + 6);
    }
};

const getRandomUnselectedTeamId = () => {
    if (selections.length >= 24) return -1;
    let teamId;
    do {
        teamId = Math.floor(Math.random() * 24);
    } while (teams[teamId].selection.groupId > -1);
    return teamId;
};

const addSelection = (teamId) => {
    if (teamId < 0 || teamId >= teams.length) {
        console.error(`Invalid team ID: ${teamId}`);
        return;
    }
    const tourNo = Math.floor(selections.length / GROUPS_COUNT);
    let groupId;
    do {
        groupId = Math.floor(Math.random() * GROUPS_COUNT);
    } while (groups[groupId].teams.length > tourNo);
    
    selections.push({teamId: teamId});
    teams[teamId].selection = {
        groupId: groupId,
        orderNo: groups[groupId].teams.length
    };
    groups[groupId].teams.push(teamId);
    updateScreen();
};

const removeSelection = (teamId) => {
    if (selections.length === 0) return;
    if (teamId !== selections[selections.length - 1].teamId) return;
    const removedSelection = selections.pop();
    const team = teams[removedSelection.teamId];
    groups[team.selection.groupId].teams.pop();
    team.selection = {groupId: -1, orderNo: -1};
    updateScreen();
};

const generateRandomSelection = () => {
    selections = [];
    teams.forEach(team => {
        team.selection = {groupId: -1, orderNo: -1};
    });
    groups.forEach(group => {
        group.teams = [];
    });
    generateRandomSelectionHelper(300);
};

const generateRandomSelectionHelper = (timeout) => {
    console.log('selections.length=' + selections.length);
    if (selections.length >= 24) return;
    addSelection(getRandomUnselectedTeamId());
    setTimeout(() => {
        generateRandomSelectionHelper(timeout);
    }, timeout);
};

const updateScreen = () => {
    updateSelectionOrderHtml();
    updateSelectionHtml();
    updateNamesListHtml();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('randomSelectionButton').addEventListener('dblclick', generateRandomSelection);
    updateScreen();
});