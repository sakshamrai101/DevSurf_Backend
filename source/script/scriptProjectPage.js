
//global Variables
let projectName = ''; //name of the project showcasing
let projectIndex = 0; //Place of the Project
let currentWidth;
let mediaQuery = window.matchMedia("(max-width: 768px)");
let mediaQuery2 = window.matchMedia("(max-width: 1024px)");
if (mediaQuery.matches) {
    currentWidth = 300;
}
else {
    currentWidth = 100;
}

/**
 * Function that handels the dropdown menu for mobile screens
 */
function toggleMenu() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
}


/**
 * Adds current date to the task if it is checked
 * 
 * @param {HTMLElement} check- the input checkbox that is checked
 */
function updateDate(check) {
    //Html elements milestone and task dates 
    let now = new Date();
    task = check.parentElement;
    let milestone = task.closest('[data-id^="milestone-"]');
    let currentDate = now.toLocaleDateString('en-GB');
    let dateDiv = task.querySelector('.date');
    if (check.checked) {
        //if a check of the input is checked adds the date
        dateDiv.innerText = currentDate;
        if (milestone.querySelector('.completed')) {
            milestone.querySelector('.date').innerText = currentDate;
        }
    }
    else {
        //if the checkmark is unchecked removes the date from the milestone
        // and task
        dateDiv.innerText = '';
        milestone.querySelector('.date').innerText = '';
    }
}
/**
 * 
 * @param {onclick} event Click event when user clicks on checkmark
 * @param {HTMLElement} checkbox check input that is clicked
 */
function toggleCheckboxOnEnter(event, checkbox) {
    if (event.key === 'Enter') {
        checkbox.checked = !checkbox.checked;
        event.preventDefault(); // Prevent the default action
        // Optionally trigger the click event to ensure consistency
        checkbox.dispatchEvent(new Event('click'));
    }
}

/**
 * Adds a new task with a specified state (checked or not).
 * 
ne to which t * @param {HTMLElement} button - The button element that triggered the function.
 * @param {number} milestoneId - The number of the milestone task is being added.
 * @param {string} taskText - The text content of the task.
 * @param {boolean} isChecked - Whether the task is checked or not.
 * @param {string} dateCompleted date task was checked
 */
function addTask(button, milestoneId, taskText, isChecked, dateCompleted) {
    //get Tasklist for specific milestone
    const taskList = document.getElementById(`task-list${milestoneId}`);
    const taskCount = taskList.children.length + 1;
    const newTask = document.createElement('li'); //create new task to append
    //check if taskname is empty
    if (taskText == '') {
        taskText = `Task ${taskCount}`;
    }
    //Required html in order to create a task: check and label
    newTask.innerHTML = `
       <div class="task-item">
            <input type="checkbox" id="task-${milestoneId}-${taskCount}" onclick="updateProgress(${milestoneId}); updateDate(this)" ${isChecked ? 'checked' : ''} onkeydown="toggleCheckboxOnEnter(event, this)">
            <label contenteditable="true">${taskText}</label>
            <div class = date>${dateCompleted}</div> 
            <button class="milestone-trash" onclick="deleteTask(this, ${milestoneId})" tabindex="0"><img class="milestoneX" src="/trash.png"></button>
        </div>

    `;
    let taskLabel = newTask.querySelector('label'); //To hold name of task
    if (taskLabel) {
        //check whether it is clicked or not
        taskLabel.addEventListener('input', function () {
            limitInnerTextLength(taskLabel);
        });
    }
    taskList.appendChild(newTask); //append to specific millestone tasklist
    updateProgress(milestoneId);
}

/**
 * Adds a new milestone to the list.
 * @param {string} milestoneName name of the milestone added
 */
function addMilestone(milestoneName) {
    //getmilestoneList
    const milestoneList = document.getElementById('milestone-list');
    let milestoneCount;
    //milestone index milestone list based of the length 
    if (milestoneList.children.length == 0) {
        milestoneCount = 1;
    }
    else {
        milestoneCount = milestoneList.children.length;
    }
    let newMilestone = document.createElement('li'); //create a li = milestone
    let timelineList = document.getElementById('timeline-elements');
    let newTimelineElement = document.createElement('li');// timeline milestone
    let timelineCount = timelineList.children.length;
    //Defaul milestone name
    if (milestoneName == '') {
        milestoneName = `Milestone ${milestoneCount}`;
    }
    //html for milestone on the timelien
    newTimelineElement.innerHTML =
        `
    <span>${milestoneName}</span>
    <img src="/2.png" alt="Incomplete Flag" class="milestone-image"/> 
    `;
    let length = milestoneName.length;
    //using length of milestone name claculate the width of the span element
    newTimelineElement.style.width = 430 + (length - 11) * 30;
    newTimelineElement.classList.add('uncompleted');
    newTimelineElement.setAttribute('data-id', `milestone-${milestoneCount}`,);
    timelineList.insertBefore(newTimelineElement, timelineList.children[timelineCount - 1]);
    newMilestone.innerHTML = getMilestoneHTML(milestoneCount, milestoneName);
    //allow timeline to be accessed by tab
    newTimelineElement.setAttribute('tabindex', '0');
    //allows clickable by enter 
    newTimelineElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            this.click();
            document.getElementById('closeIsland').focus();
        }
    });

    //dynamically changes milestone name on TIMELINE
    const milestoneNameElement = newMilestone.querySelector('.milestone-name');
    milestoneNameElement.addEventListener('input', function () {
        limitInnerTextLength(milestoneNameElement);
        updateTimeline(this); //change the name of the milestone on timeline
    });
    milestoneList.appendChild(newMilestone);
    newMilestone.setAttribute('data-id', `milestone-${milestoneCount}`);
    // Move the "Add Milestone" button to be at the end of the list
    milestoneList.appendChild(document.querySelector('.add-milestone'));

    //dynamically adds to the timeline to make it bigger when certain
    //milestone number is reached
    if (milestoneCount > 3) {
        addWidth();
    }
    updateTimelineProgress(); //ensures progress is realigned with new width
}
/**
 * Limits the amount of text to be 20 for any editable name
 * @param {HTMLElement} text the element innertext that has to be limited
 */
function limitInnerTextLength(text) {
    let tested = text.innerText;
    if (tested.length > 20) {
        text.innerText = tested.slice(0, 20); //makes sure length < 20
        setCursorToEnd(text); // ensure that cursor position isnt reset
    }
}
/**
 * Sets the inputs position to end once max limit is reached
 * @param {HTMLElement} element the contented idable element
 */
function setCursorToEnd(element) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false); // Move range to the end
    selection.removeAllRanges();
    selection.addRange(range);
}
/**
 * Updates the timeline if > 3 milestones exist
 * 
 */
function addWidth() {
    // add : is the width being added to the line
    let add = 24.5;
    if (mediaQuery.matches) {
        add = 100;
    }
    else if (mediaQuery2.matches) {
        add = 45;
    }
    //get the timeline 
    let timelineContainer = document.
        getElementsByClassName('timeline-container')[0];
    let timelineList = document.getElementById('timeline-elements');
    // Calculate the new width (current width + add%)
    currentWidth += add;
    let newWidth = currentWidth + '%';
    timelineList.style.width = newWidth;
    line = document.getElementById('line'); //the line of the timeline
    line.style.width = newWidth;
    timelineContainer.style.overflowX = 'auto';
}
/**
 * Resizes the width of the timeline when a mediaQuery is matched
 */
function resizeWidth() {
    //checks if screen is < 768
    if (mediaQuery.matches) {
        currentWidth = 300;
    }
    else {
        currentWidth = 100;
    }
    let milestones = getMilestoneArray(); //array of the milestones
    let mINumber = milestones.length;
    if (mINumber > 3) {
        for (let i = 0; i < mINumber - 3; i++) {
            //adds width based on mediaQuery
            addWidth();
        }
    }
    updateTimelineProgress(); //ensures timeline progress is correct
}
/**
 * Updates the milestone name on the timeline based on the input.
 * 
 * @param {HTMLElement} milestoneElement - The milestone element being updated.
 */

function updateTimeline(milestoneElement) {
    // get the milestone index within the list
    const milestoneId = milestoneElement.closest('li').getAttribute('data-id');
    const milestoneName = milestoneElement.textContent;
    let strLen = milestoneName.length;
    //calcuates the width of span element based on length of milestoneName
    let spanWidth = 460 + (strLen - 11) * 41;
    //get the milstone onthe timeline
    const timelineElement = document.querySelector
        (`#timeline-elements [data-id="${milestoneId}"] span`);
    if (timelineElement) {
        timelineElement.textContent = milestoneName;
        timelineElement.style.width = spanWidth + '%';
    }
    // ensure the width is correct for screen size
    resizeWidth();
}

/**
 * Toggles the visibility of the tasks and the "Add Task" button for the specified milestone.
 * 
 * @param {number} milestoneId - The milestone number whose tasks are being toggled.
 */
function toggleTasks(milestoneId) {
    // get the tasklist of the milsestone
    const taskList = document.getElementById(`task-list${milestoneId}`);
    //arrow to show the atasks
    const arrowElement = document.getElementById(`dropdown-arrow-${milestoneId}`);
    const addTaskButton = taskList.nextElementSibling;
    // changes drop down menu in according to when tasklist is pressed
    if (taskList.style.display === 'block') {
        taskList.style.display = 'none';
        addTaskButton.style.display = 'none';
        arrowElement.textContent = '▼';
    } else {
        taskList.style.display = 'block';
        addTaskButton.style.display = 'block';
        arrowElement.textContent = '▲';
    }
}

/** 
 * Returns the total amount of completed progress as a decimal of tasklist
 * @param {string} milestoneId the id/number of the milestone
 * @returns {number} progress percentage of tasks completed/total
 */
function getProgressPercentage(milestoneId) {
    //get the tasklist;
    const taskList = document.getElementById(`task-list${milestoneId}`);
    if (!taskList) {
        //if tasklist doesn't exist return 0;
        return 0;
    }
    const tasks = taskList.querySelectorAll('li'); //get a list of the tasks
    const completedTasks = taskList.querySelectorAll
        ('input[type="checkbox"]:checked').length; //list of all tasks
    if (tasks.length == 0) {
        //to check for for undefined 
        return 0;
    }
    const progressPercentage = completedTasks / tasks.length;
    return progressPercentage;
}
/**
 * Updates the progress bar status for the specified milestone based on 
 * completed tasks.
 * 
 * @param {number} milestoneId - The ID of the milestone being updated.
 */

function updateProgress(milestoneId) {
    //gets the tasklist of the milestone
    const taskList = document.getElementById(`task-list${milestoneId}`);
    const tasks = taskList.querySelectorAll('li'); //total tasks
    const completedTasks = taskList.querySelectorAll
        ('input[type="checkbox"]:checked').length; //completed tasks
    //progress bar of the milestone
    const progress = document.getElementById(`progress${milestoneId}`);
    //percentage of tasks done
    const progressPercentage = getProgressPercentage(milestoneId) * 100;
    progress.style.width = `${progressPercentage}%`;
    //get the associated element on timeline
    let timelineElement = document.querySelector
        (`#timeline-elements [data-id="milestone-${milestoneId}"]`);
    const milestone = taskList.closest('li');
    //image tage within the timeline milestone
    let image = timelineElement.querySelector('img');
    if (completedTasks === tasks.length && tasks.length > 0) {
        // All tasks are completed
        timelineElement.classList.remove('uncompleted');
        timelineElement.classList.add('completed');
        milestone.querySelector('.milestone-name').classList.add('completed');
        image.src = '/1.png';
        image.alt = 'complete flag';

    }
    else {
        // Not all tasks are completed
        timelineElement.classList.remove('completed');
        timelineElement.classList.add('uncompleted');
        milestone.querySelector('.milestone-name').classList.remove('completed');
        image.src = '/2.png';
        image.alt = 'incomplete flag';
    }

    // Update overall timeline progress
    updateTimelineProgress();

}
/**
 * Updates the overall progress of the timeline based on completed milestones.
 */
function updateTimelineProgress() {
    //gets completed length of milestone
    const milestoneList = document.getElementById('milestone-list');
    const milestones = milestoneList.querySelectorAll('li[data-id]');
    const completedMI = milestoneList.querySelectorAll('.completed').length;
    //get the timelineList
    const timelineList = document.getElementById('timeline-elements');
    const timeline = timelineList.querySelectorAll('li');
    const timelineLength = timeline.length;
    //one section based on how many milestones
    let oneDivision = currentWidth / (timeline.length - 1);
    // the max milestone with all previous milestones completed
    let maxMilestone = 1;
    for (let i = 0; i < completedMI; i++) {
        let check = milestones[i].querySelector('.completed');
        if (!check) {
            break;
        }
        maxMilestone++;
    }
    // get % of tasks completed
    let progressPercentage = getProgressPercentage(maxMilestone);
    let timelineText = document.querySelector('#TIHeader');
    // check for completion
    if (completedMI == timelineLength - 2) {
        // if completed bar is filled and end is set to complete
        tlProgress = currentWidth;
        timeline[timelineLength - 1].classList.remove('uncompleted');
        timeline[timelineLength - 1].classList.add('completed');
        timelineText.style.color = '#00FFB0';
    }
    else {
        // if progress bar is dynamically calculated and end is set to uncomplete
        tlProgress = (maxMilestone - 1) / (timelineLength - 1) * currentWidth;
        tlProgress += progressPercentage * oneDivision;
        timeline[timelineLength - 1].classList.remove('completed');
        timeline[timelineLength - 1].classList.add('uncompleted');
        timelineText.style.color = '#CCFF00';
    }
    let line = document.getElementById('line2');
    line.style.width = tlProgress + '%';
}
/**
 * Deletes a task and updates the progress.
 * @param {HTMLElement} taskElement - The task element to be deleted.
 * @param {number} milestoneId - The milestone number
 * from which the task is being deleted.
 */
function deleteTask(taskElement, milestoneId) {
    taskElement.closest('li').remove();
    // make sure progress on timeline is ensured to recalculated
    updateProgress(milestoneId);
    renumberMilestones(); //renumbers the milestones
}

/**
 * Renumbers milestones and updates their content and IDs when a milestone
 * is deleted
 */
function renumberMilestones() {
    //get the milestone and timeline list
    const milestoneList = document.getElementById('milestone-list');
    const timelineList = document.getElementById('timeline-elements');
    const milestones = milestoneList.querySelectorAll('li[data-id]');
    // iterate through each milestone 
    milestones.forEach((milestone, index) => {
        const newNumber = index + 1; // the new milestone number to be replaced
        const milestoneNameElement = milestone.querySelector('.milestone-name');
        //the original name
        const placeholder = milestoneNameElement.textContent;
        //default name
        const currentName = milestoneNameElement.textContent.replace(/\s*\d+$/, '');
        // if the milestone was a default milestone change name
        if (currentName === 'Milestone') {
            milestoneNameElement.textContent = `${currentName.trim()} ${newNumber}`;
        } else {
            //preserves unique milestone names
            milestoneNameElement.textContent = `${placeholder}`;
        }

        // Update the milestone number in all of the htm attributes
        milestone.querySelector('.dropdown-arrow').setAttribute('onclick', `toggleTasks(${newNumber});`);
        const progressBar = milestone.querySelector('.progress');
        progressBar.id = `progress${newNumber}`;
        milestone.querySelector('.task-list').id = `task-list${newNumber}`;
        milestone.querySelector('.add-task').
            setAttribute('onclick', `addTask(this, ${newNumber},'',false,'')`);
        milestone.setAttribute('data-id', `milestone-${newNumber}`);
        const tasks = milestone.querySelectorAll('.task-list .task-item');
        //renumberTasks of the milestone
        renumberTasks(tasks, newNumber);

    });

    const timelineElements = timelineList.querySelectorAll('li[data-id]');
    // updates the namne of the timeline when renumbering
    timelineElements.forEach((timeline, index) => {
        const newNumber = index + 1;
        const milestoneId = `milestone-${newNumber}`;
        const milestone = milestoneList.querySelector(`li[data-id="${milestoneId}"]`);
        const milestoneName = milestone ? milestone.querySelector('.milestone-name').textContent : `Milestone ${newNumber}`;
        timeline.querySelector('span').textContent = milestoneName;
        timeline.setAttribute('data-id', milestoneId);
    });

    updateTimelineProgress();
}
/**
 * Renumbers and correctly assigns correct data 
 * @param {HTMLElement} tasks a node list to the tasks of a milestone
 * @param {number} milestoneId the milestone number of 
 * the tasklist that is being modified
 */
function renumberTasks(tasks, milestoneId) {
    //iterate all tasks of milestoneId
    tasks.forEach((task, taskIndex) => {
        // go through all html attributes of the taskmark
        let taskCheckbox = task.querySelector('input');
        taskCheckbox.id = `task-${milestoneId}-${taskIndex + 1}`;
        taskCheckbox.setAttribute('onclick', `updateProgress(${milestoneId})`);
        let taskLabel = task.querySelector('label');
        taskLabel.setAttribute('ondblclick', `deleteTask(this, ${milestoneId})`);
        const placeholder = taskLabel.textContent; //the previous
        const currentName = placeholder.replace(/\s*\d+$/, ''); //default name
        //checks if name is default name
        if (currentName == 'Task') {
            //renumbers task
            taskLabel.innerText = `Task ${taskIndex + 1}`;
        }
        else {
            //preserves unique name
            taskLabel.innerText = `${placeholder}`
        }

    });
}

/**
 * Returns the HTML structure for a milestone given its number.
 * 
 * @param {number} milestoneNumber - The number of the milestone.
 * @returns {string} The HTML structure for the milestone.
 */
function getMilestoneHTML(milestoneNumber, milestoneName) {
    return `
        <div class="milestone-header" tabindex>
            <div class="milestone-content">
                <div contenteditable="true" class="milestone-name">${milestoneName}</div>
                <div class='date'></div>
                <button class="milestone-trash" onclick="deleteMilestone(this)" tabindex="0"><img class="milestoneX" src="/trash.png"></button>
            </div>
            <button class="dropdown-arrow" id="dropdown-arrow-${milestoneNumber}" onclick="toggleTasks(${milestoneNumber});" tabindex="0">▼</button>
        </div>
        <div class="progress-bar">
            <div class="progress" id="progress${milestoneNumber}"></div>
        </div>
        <ul class="task-list" id="task-list${milestoneNumber}">
            <!-- Tasks will be added here -->
        </ul>
        <button class="add-task" onclick="addTask(this, ${milestoneNumber}, '',false,'')" style="display: none;">Add Task +</button>
    `;
}
/**
 * Deletes a milestone and updates the timeline and progress.
 * 
 * @param {HTMLElement} milestoneElement - The milestone element to be deleted.
 */

function deleteMilestone(milestoneElement) {
    //gets the milestone number
    const milestoneId = milestoneElement.closest('li').getAttribute('data-id');
    milestoneElement.closest('li').remove(); //removes the milestone from the list
    const milestoneList = document.getElementById('milestone-list'); //list of milestones
    let milestoneCount = milestoneList.children.length;
    //get the associated timeline milestone
    const timelineElement = document.querySelector(`#timeline-elements [data-id="${milestoneId}"]`);
    if (timelineElement) {
        timelineElement.remove();
    }
    //checks for >4 milestones
    if (milestoneCount > 4) {
        //subtracts width of line 
        subWidth();
    }
    else {
        resetWidth(); //resets the width of line to before 4+ milestones
    }
    renumberMilestones(); //renumbers the milestone to maintain order
    updateTimelineProgress(); //makes sure the progress on timeline is correct
}
/**
 * Updates the timeline width when a milestone is deleted
 * 
 */
function subWidth() {
    // desired width to be subtracted depending on screen size
    let sub = 24;
    if (mediaQuery.matches) {
        sub = 90;
    }
    if (mediaQuery2.matches) {
        sub = 45;
    }
    //get the timeline Container to get the desired tags
    let timelineContainer = document.
        getElementsByClassName('timeline-container')[0];
    let timelineList = document.getElementById('timeline-elements');
    // Calculate the new width (current width - sub%)
    currentWidth -= sub;
    let newWidth = currentWidth + '%';
    timelineList.style.width = newWidth;
    line = document.getElementById('line');
    line.style.width = newWidth;
}

/**
 * resets the width of the timeline when milestones <= 3
 */

function resetWidth() {
    //the width of the line to default width
    currentWidth = 100;
    let timelineContainer = document.
        getElementsByClassName('timeline-container')[0];
    if (mediaQuery.matches) {
        //changes default to match small screen size
        currentWidth = 300;
    }
    else {
        //no overflow for big screens
        timelineContainer.style.overflowX = 'visible';
    }
    let timelineList = document.getElementById('timeline-elements');
    //change width of desired elements
    timelineList.style.width = currentWidth + '%';
    line = document.getElementById('line');
    line.style.width = currentWidth + '%';

}

/**
 * saves milestones to storage after a milestone is created/deleted
 */

function saveMilestoneToStorage() {
    //gets a array of milestones
    let milestones = getMilestoneArray();
    let milestoneNames = []; //placeholder array to store milestone names
    for (let i = 0; i < milestones.length; i++) {
        //get the milestone name of each milestone
        const nameDiv = milestones[i].querySelector('.milestone-name');
        const milestoneName = nameDiv.textContent;
        //push to the placeholder array
        milestoneNames.push(milestoneName);
    }
    //stringify the array for storage in local storage
    let stored = JSON.stringify(milestoneNames);
    localStorage.setItem('milestones', stored);
}

/**
 * saves tasks to storage after a milestone is created/deleted
 */
function saveTasksArrayToStorage() {
    const milestones = getMilestoneArray(); //get array of milestones
    const taskArray = []; //placeholder array for tasks
    //iterate through every milestone
    milestones.forEach(milestone => {
        //tasklist of each milestone
        const taskList = milestone.querySelector('.task-list');
        if (taskList) {
            //default task object
            const tasks = [];
            taskList.querySelectorAll('li').forEach(task => {
                //gets all required task attributes
                const checkbox = task.querySelector('input[type="checkbox"]');
                const label = task.querySelector('label');
                const date = task.querySelector('.date');
                tasks.push({
                    text: label.textContent,
                    checked: checkbox.checked,
                    dateCompleted: date.innerText,
                });
            });
            taskArray.push(tasks);
        }
    });
    //stringify for storage in local storage
    const stored = JSON.stringify(taskArray);
    localStorage.setItem('tasks', stored);
}

/**
 * Returns the milestone list for the page
 * @returns node list of milestones
 */
function getMilestoneArray() {
    const milestoneList = document.getElementById('milestone-list');
    let milestones = milestoneList.querySelectorAll('li[data-id]');
    return milestones;
}
//listens for when the dom is loaded
document.addEventListener("DOMContentLoaded", function () {
    //variables for usage in the notepad section
    clearOldData();
    const notepad = document.getElementById('notepad');
    const markdown = document.getElementById('markdown');
    const addEntryButton = document.getElementById('addEntryButton');
    const entriesContainer = document.querySelector('.entries-container');
    const dynamicIsland = document.getElementById('dynamicIsland');
    const closeIsland = document.getElementById('closeIsland');
    const islandTitle = document.getElementById('islandTitle');
    const islandContent = document.getElementById('islandContent');
    const islandImages = document.getElementById('islandImages');
    const noteTypeButtons = document.querySelectorAll('.note-type-button');

    let activeNoteType = 'notes'; // Default to 'notes'
    let isEditing = false;
    let editingEntryIndex = null;

    //keyboard access to close island
    closeIsland.setAttribute('tabindex', '0');
    //Project name and index of Project
    const urlParams = new URLSearchParams(window.location.search);
    projectIndex = urlParams.get('index'); 
    projectName = urlParams.get('name');

    // Load entries from localStorage and display them
    function loadEntries() {
        //parse through the stringin local storage
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        //adds entry from data from local storage
        entries.forEach((entry, index) => addEntryTile(entry.title, entry.content, entry.type, entry.images, index));
    }
    /**
     * loads the name of the project from local storage
     */
    function loadProjectName() {
        //get the name from local storage
        let name = localStorage.getItem('projectName');
        let title = document.querySelector('.title');
        let mainTitle = document.querySelector('.main-heading');
        mainTitle.textContent = name;
        title.textContent = name;
    }
    //listens for when the home button on projects page is pushed
    document.querySelector('.home-button').addEventListener('click', function () {
        window.location.href = 'home.html'; // go to home page
    });
    //listens for when the logout button is pushed
    document.querySelector('.logout-button').addEventListener('click', function () {
        window.location.href = 'index.html'; // go to login page
        //localeStorage.clear();
    });
    /**
     * loads milestones and tasks from local storage
     */
    function loadMilestonesAndTasks() {
        //parses through the string in local storage for milestone array
        const milestones = JSON.parse(localStorage.getItem('milestones')) || [];
        //adds each milestone 
        milestones.forEach(milestone => addMilestone(milestone));
        const milestoneList = getMilestoneArray(); //get the milestone list
        //parses through the string in local storage for milestone array
        const taskArray = JSON.parse(localStorage.getItem('tasks')) || [];
        //go through each milestone
        milestoneList.forEach((milestone, index) => {
            //get the addtask button
            const taskButton = milestone.querySelector('.add-task');
            const tasks = taskArray[index] || [];
            tasks.forEach(task => {
                //add the task with checkmark
                addTask(taskButton, index + 1, task.text, task.checked, task.dateCompleted);
                //updates the progress forthe milestone
                updateProgress(index + 1);
            });
        });
    }

    // Save a new entry to localStorage
    function saveEntry(title, content, type, images) {
        // get array for entries from local storage
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        // check if current status is not editing
        if (isEditing && editingEntryIndex !== null) {
            //set the index of entry with appropriate data
            entries[editingEntryIndex] = { title, content, type, images };
            updateEntryTile(editingEntryIndex, title, content, type);
            isEditing = false;
            editingEntryIndex = null;
            addEntryButton.textContent = 'Add Entry';
        } else {
            //make a new entry if not editing
            entries.push({ title, content, type, images });
            //add the entry
            addEntryTile(title, content, type, images, entries.length - 1);
        }
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    // Add a new entry tile to the left container
    function addEntryTile(title, content, type = 'notes', images = [], index) {
        //create an entry object
        const entryTile = document.createElement('div');
        entryTile.classList.add('entry-tile');
        entryTile.dataset.index = index;
        entryTile.dataset.type = type;
        const entryTitle = document.createElement('h3');
        entryTitle.textContent = title;
        const entryContent = document.createElement('p');
        entryContent.textContent = content.length > 100 ? content.substring(0, 100) + '...' : content;
        //create icon for edit
        const editIcon = document.createElement('img');
        editIcon.src = '/edit.png';
        editIcon.alt = 'Edit';
        editIcon.classList.add('edit-icon');
        //defines what happens on click of pen
        editIcon.onclick = (event) => {
            event.stopPropagation();
            //gets correct index
            index = editIcon.closest('.entry-tile').getAttribute('data-index');
            //load the entry
            loadEntryToEdit(index);
        };
        //create icon for  trash
        const trashIcon = document.createElement('img');
        trashIcon.src = '/trash.png';
        trashIcon.alt = 'Delete';
        trashIcon.classList.add('trash-icon');
        //defines what happens on click of trashcan
        trashIcon.onclick = (event) => {
            event.stopPropagation();
            //gets correct index
            index = editIcon.closest('.entry-tile').getAttribute('data-index');
            //delete entry
            deleteEntry(entryTile, index);
        };
        //shows the entry on click
        entryTile.onclick = () => {
            showDynamicIsland(title, content, type, images);
            document.getElementById('closeIsland').focus();
        };
        //appends data to entry tile
        entryTile.appendChild(entryTitle);
        entryTile.appendChild(entryContent);
        entryTile.appendChild(editIcon);
        entryTile.appendChild(trashIcon);
        //allows for tabbing throughout the pages
        entryTile.setAttribute('tabindex', '0');
        trashIcon.setAttribute('tabindex', '0');
        editIcon.setAttribute('tabindex', '0');

        // Add keydown event listeners for Enter key
        entryTile.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                this.click();
            }
        });
        // Add keydown event listeners for Enter key
        trashIcon.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.stopPropagation();
                trashIcon.click();
            }
        });
        // Add keydown event listeners for Enter key
        editIcon.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.stopPropagation();
                editIcon.click();
            }
        });
        //adds entry to the entries container
        entriesContainer.appendChild(entryTile);
    }

    // Update an existing entry tile with new content
    function updateEntryTile(index, title, content, type) {
        const entryTile = entriesContainer.querySelector(`.entry-tile[data-index="${index}"]`);
        const entryTitle = entryTile.querySelector('h3');
        const entryContent = entryTile.querySelector('p');
        entryTitle.textContent = title;
        entryContent.textContent = content.length > 100 ? content.substring(0, 100) + '...' : content;
        entryTile.dataset.type = type;
        entryTile.onclick = () => {
            showDynamicIsland(title, content, type, []);
            document.getElementById('closeIsland').focus();
        };
    }

    function loadEntryToEdit(index) {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        const entry = entries[index];
        if (entry.type === 'markdown') {
            markdown.value = entry.content;
            activeNoteType = 'markdown';
            markdown.style.display = 'block';
            notepad.style.display = 'none';
            document.getElementById('markdown').focus();
        } else {
            notepad.value = entry.content;
            activeNoteType = 'notes';
            notepad.style.display = 'block';
            markdown.style.display = 'none';
            document.getElementById('notepad').focus();
        }
        addEntryButton.textContent = 'Save Entry';
        isEditing = true;
        editingEntryIndex = index;

    }

    function deleteEntry(entryTile, index) {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        entries.splice(index, 1);
        entriesContainer.removeChild(entryTile);
        renumberEntries();
        // Close dynamic island if it's open and showing the deleted entry
        if (dynamicIsland.style.display === 'block' && islandTitle.textContent === entryTile.querySelector('h3').textContent) {
            dynamicIsland.style.display = 'none';
        }
    }

    /**
     * renumber the entries when one is deleted
     */
    function renumberEntries() {
        const entries = document.querySelectorAll('.entry-tile');
        const entriesArray = JSON.parse(localStorage.getItem('entries')) || [];
        entries.forEach((entry, index) => {
            entry.dataset.index = index;
            const entryTitle = entry.querySelector('h3');
            entryTitle.textContent = `Entry ${index + 1}`;
            let title = `Entry ${index + 1}`;
            entriesArray[index].title = title
            let content = entry.querySelector('p').innerText;
            let type = entry.getAttribute('data-type');
            updateEntryTile(index, title, content, type);
        });
        entriesArray.pop();
        localStorage.setItem('entries', JSON.stringify(entriesArray));
    }

    // Show the dynamic island with entry details
    function showDynamicIsland(title, content, type, images) {
        islandTitle.textContent = title;
        islandContent.innerHTML = '';

        if (type === 'markdown') {
            // Render Markdown
            const markdownView = document.createElement('div');
            markdownView.classList.add('markdown-view');
            markdownView.innerHTML = marked.parse(content); // Render Markdown
            islandContent.appendChild(markdownView);
        } else {
            // Render Notes
            const noteView = document.createElement('p');
            noteView.textContent = content;
            islandContent.appendChild(noteView);
        }

        islandImages.innerHTML = '';
        images.forEach(imageSrc => {
            const img = document.createElement('img');
            img.src = imageSrc;
            islandImages.appendChild(img);
        });

        dynamicIsland.style.display = 'block';
    }
    //adds enter clickability
    closeIsland.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            this.click();
        }
    });

    // Handle the close button for the dynamic island
    closeIsland.onclick = () => {
        dynamicIsland.classList.add('close');
        dynamicIsland.style.display = 'none';
        dynamicIsland.classList.remove('close');
    };

    // Handle the add entry button click
    addEntryButton.addEventListener('click', function () {
        const content = activeNoteType === 'markdown' ? markdown.value.trim() : notepad.value.trim();
        if (content) {
            let name = editingEntryIndex !== null ? +editingEntryIndex + 1 : +entriesContainer.children.length + 1;
            const title = `Entry ${name}`;
            const images = []; // Assuming images are not handled yet
            saveEntry(title, content, activeNoteType, images);
            if (activeNoteType === 'markdown') {
                markdown.value = '';
            } else {
                notepad.value = '';
            }
        }
    });

    // Handle note-type button clicks
    noteTypeButtons.forEach(button => {
        button.addEventListener('click', function () {
            noteTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            activeNoteType = this.getAttribute('data-type');
            if (activeNoteType === 'markdown') {
                markdown.style.display = 'block';
                notepad.style.display = 'none';
            } else {
                notepad.style.display = 'block';
                markdown.style.display = 'none';
            }
        });
    });

    function loadAllData(projectId) {
        const rawData = localStorage.getItem(`project_${projectId}`);
           
        const allData = JSON.parse(rawData);
        console.log("Parsed data:", allData);
        if(!allData) {
            return;
        }
        localStorage.setItem('milestones', JSON.stringify(allData.milestones));
        localStorage.setItem('tasks', JSON.stringify(allData.tasks));
        localStorage.setItem('entries', JSON.stringify(allData.entries));
        localStorage.setItem('projectName', allData.projectName);
    }
    
    loadAllData(projectIndex); // Load all data from local storage
    localStorage.setItem('projectName', projectName);
    loadMilestonesAndTasks(); //propagates milestone list from local storage
    loadEntries();
    loadProjectName(); //gets name from local storage
    resizeWidth(); // resizes width upon loading of page 
    updateTimeline(); //updates the timeline width based on milestone name
    // Add event listener to timeline items for when they are clicked
    document.getElementById('timeline-elements').addEventListener('click', function (event) {
        //get the closest li upon a click
        const target = event.target.closest('li');
        if (target && target.dataset.id) {
            //get milestone
            const milestoneId = target.dataset.id;
            const milestoneElement = document.querySelector(`#milestone-list [data-id="${milestoneId}"]`);
            //get the progress of the selected milestone
            let progress = getProgressPercentage(milestoneId.charAt(milestoneId.length - 1)) * 100;
            progress = progress.toFixed(1); // round to first decimal
            //checks for completed 
            if (milestoneElement.querySelector('.completed')) {
                progress = 100;
            }
            //show the milestone if it exists
            if (milestoneElement) {
                const milestoneName = milestoneElement.querySelector('.milestone-name').textContent + ': ' + progress + '%';
                const taskElements = milestoneElement.querySelectorAll('.task-item label');
                showMilestoneDetailsInIsland(milestoneName, taskElements);
            }
        }
    });
    /**
     * populates the island box with appropriate information
     * @param {string} milestoneName the name of the milestone
     * @param {HTMLElement} tasks array of tasks of the milestone
     */
    function showMilestoneDetailsInIsland(milestoneName, tasks) {
        //add the name of the milesetone
        islandTitle.textContent = milestoneName;
        islandContent.innerHTML = '';
        tasks.forEach(task => {
            //go through each task and create p element based on attributes
            const taskItem = document.createElement('p');
            let date = task.parentElement.querySelector('.date').innerText;
            //check if date has been marked
            if (date == '') {
                taskItem.textContent = `${task.innerText}: In Progress `;
            }
            else {
                taskItem.textContent = `${task.innerText}: Completed On  ${date}`;
            }
            islandContent.appendChild(taskItem);
        });
        dynamicIsland.style.display = 'block';
    }
});



// Initialize highlight.js
document.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
});

// Function to render Markdown
function renderMarkdown(markdownText) {
    // Set up marked to use highlight.js
    marked.setOptions({
        highlight: function (code, language) {
            // Use 'plaintext' as fallback language
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            return hljs.highlight(validLanguage, code).value;
        },
        breaks: true, // This option is important for recognizing line breaks
    });

    // Parse Markdown to HTML
    const htmlContent = marked(markdownText);
    // Insert HTML into the dynamic island content area
    document.getElementById('islandContent').innerHTML = htmlContent;
}

// Adjust the notepad size based on the screen width
function adjustNotepadSize() {
    const notepad = document.getElementById('notepad');
    const markdown = document.getElementById('markdown');
    const screenWidth = window.innerWidth;

    if (screenWidth <= 475) {
        notepad.style.fontSize = '12px';
        markdown.style.fontSize = '12px';
        notepad.style.padding = '10px 5px 10px 30px';
        markdown.style.padding = '10px 5px 10px 30px';
    } else if (screenWidth <= 640) {
        notepad.style.fontSize = '14px';
        markdown.style.fontSize = '14px';
        notepad.style.padding = '15px 5px 15px 40px';
        markdown.style.padding = '15px 5px 15px 40px';
    } else if (screenWidth <= 768) {
        notepad.style.fontSize = '16px';
        markdown.style.fontSize = '16px';
        notepad.style.padding = '20px 10px 20px 60px';
        markdown.style.padding = '20px 10px 20px 60px';
    } else {
        notepad.style.fontSize = '16px';
        markdown.style.fontSize = '16px';
        notepad.style.padding = '20px 15px 20px 80px';
        markdown.style.padding = '20px 15px 20px 80px';
    }
}


// Adjust the notepad size on page load and when the window is resized
window.addEventListener('load', adjustNotepadSize);
window.addEventListener('resize', adjustNotepadSize);


//when  certain width is reached resizes the width
mediaQuery.addEventListener('change', function () {
    resizeWidth();
});
//when  certain width is reached resizes the width
mediaQuery2.addEventListener('change', function () {
    resizeWidth();
});

function saveAllData(projectId) {
    const allData = {
        milestones: JSON.parse(localStorage.getItem('milestones')) || [],
        tasks: JSON.parse(localStorage.getItem('tasks')) || [],
        entries: JSON.parse(localStorage.getItem('entries')) || [],
        projectName: localStorage.getItem('projectName') || ''
    };

    localStorage.setItem(`project_${projectId}`, JSON.stringify(allData));
}

function clearOldData() {
    localStorage.removeItem('milestones');
    localStorage.removeItem('tasks');
    localStorage.removeItem('entries');
    localStorage.removeItem('projectName');
}
async function saveAllDataAndClear(projectIndex) {
    try {
        await saveMilestoneToStorage();
        await saveTasksArrayToStorage();
        await saveAllData(projectIndex);
        await clearOldData();
        console.log('All data operations completed successfully.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
//saves the milestoneList into local storage
window.addEventListener('beforeunload', function () {
    saveMilestoneToStorage();
    saveTasksArrayToStorage();
    saveAllData(projectIndex);
});

window.addEventListener('unload', function () {
    saveMilestoneToStorage();
    saveTasksArrayToStorage();
    saveAllData(projectIndex);
});

