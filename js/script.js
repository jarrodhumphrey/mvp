document.addEventListener("DOMContentLoaded", () => {
    // Initialize synthetic scores for percentile calculations
    initializeSimulatedScores();

    // Retrieve DOM elements
    const startButton = document.getElementById("startButton");
    const introSection = document.getElementById("introSection");
    const caseSection = document.getElementById("caseSection");
    const questionSection = document.getElementById("questionSection");
    const questionNumberHeader = document.getElementById("questionNumber");
    const questionProgressBar = document.getElementById("questionProgressBar");
    const resultsSection = document.getElementById("resultsSection");
    
    // State variables
    let currentCase = null;
    let currentQuestionNumber = 0;
    let userAnswers = [];
    let questionTimer = 30; // Represents the timer in seconds
    let timerId; // Variable to store the timer ID
    let questionTransitionTimerId; // Variable to store the question transition timer ID
    let caseStartTime = Date.now(); // When the case study starts
    let questionStartTimes = []; // To store the start time for each question
    let totalAccuracyPoints = 0; // To track total accuracy points
    let totalSpeedPoints = 0; // To track total speed points

  
    function createButton(text, clickHandler, className = 'caseRaceButton') {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add(className);
        button.addEventListener('click', clickHandler);
        return button;
        }
    
    
    function playCase(caseData) {
        clearTimeout(caseTimerId); // Clear any existing case timers
        
        // Reset game state
        currentQuestionNumber = 0;
        userAnswers = [];
        questionStartTimes = []; // Reset the start times for each question
        totalAccuracyPoints = 0; // Reset accuracy points
        totalSpeedPoints = 0; // Reset speed points
    
        // Set the current case to the selected one
        currentCase = caseData;
    
        // Initialize the game with the new case
        initializeCase();
        
        // Start the game
        startGame();
    }

    // This function should handle starting the game both for new and old cases
    function startGame() {
        // Reset UI for both new and old cases
        introSection.style.display = "none";
        caseSection.style.display = "block";
        questionSection.style.display = "none"; // Hide question section initially
        resultsSection.style.display = "none";
        resetProgressBar(); // Reset progress bar for the case timer
        
        // Show 'proceed to questions' button after a delay for both new and old cases
        setTimeout(function() {
            proceedToQuestions.style.display = "block";
        }, 500);

        // Start the case timer and progress bar animation
        startProgressBarAnimation(90);
        caseTimerId = setTimeout(() => {
            transitionToQuestions();
        }, 90000);
    }

    // This function transitions to the questions view
    function transitionToQuestions() {
        caseSection.style.display = "none";
        resetTimer();
        questionSection.style.display = "block";
        currentQuestionNumber = 0;
        updateQuestionAndAnswers(currentCase.questions[currentQuestionNumber]);
        startQuestionTimer();
    }

    function displayPriorCases(cases) {
        // Create the modal container
        const modal = document.createElement('div');
        modal.id = 'caseModal';
        // Apply styles as needed or assign a class and define styles in your CSS
    
        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        // Position the close button, e.g., absolute position in the top right corner
    
        // Add click handler to close the modal
        closeButton.onclick = () => modal.style.display = 'none';
    
        // Append the close button to the modal
        modal.appendChild(closeButton);
    
        // Create the table headings
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headings = ['CaseRace #', 'Date', 'Topic', 'Score']; // Add 'Topic' to headings
        headings.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        // Create the table body
        const tbody = document.createElement('tbody');
        cases.forEach((caseItem, index) => {
            const tr = document.createElement('tr');
    
            // Caserace # Column
            const tdCaseNumber = document.createElement('td');
            tdCaseNumber.textContent = caseItem["caserace #"]; // Use the caserace # from the JSON
    
            // Date Column
            const tdDate = document.createElement('td');
            const dateParts = caseItem.date.split("-");
            const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
            tdDate.textContent = date.toLocaleDateString(undefined, { timeZone: 'UTC' });
    
            // Topic Column
            const tdTopic = document.createElement('td');
            tdTopic.textContent = caseItem.topic; // Get the topic from the caseItem
            
           // Score/Play Now Column
            const tdScore = document.createElement('td');
            const score = localStorage.getItem('score_' + caseItem["caserace #"]);
            if (score !== null) {
                tdScore.textContent = score;
            } else {
                // Only append the Play Now button if the score doesn't exist
                const playButton = document.createElement('button');
                playButton.textContent = 'Play Now';
                playButton.onclick = (event) => {
                    event.stopPropagation(); // Stop the click event from propagating to the parent elements
                    modal.style.display = 'none'; // Hide the modal before starting the game
                    playCase(caseItem); // Start the game with the selected case
                };
                tdScore.appendChild(playButton);
            }
    
            // Append all the td elements to the row
            tr.appendChild(tdCaseNumber);
            tr.appendChild(tdDate);
            tr.appendChild(tdTopic);
            tr.appendChild(tdScore);
    
            // Append the row to the table body
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    
        modal.appendChild(table);
    
        // Show the modal
        modal.style.display = 'block';
    
        // Append the modal to the document body
        document.body.appendChild(modal);
    }
    
    

   // You can call this function to start the progress bar animation when a new case is selected
        function startProgressBarAnimation() {
            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = '0%'; // Reset the progress bar

            // Use a very short delay before starting the animation to ensure the transition is triggered
            setTimeout(() => {
                progressBar.style.width = '100%'; // Start the progress bar animation
            }, 10); // The delay needs to be long enough to ensure the 'width' change is recognized
        }

    // Fetch the cases from the JSON file
    fetch('data/cases.json')
        .then(response => response.json())
        .then(data => {
            // Assume the data is an array of cases; pick the first one for now
            currentCase = data[0]; // This should be replaced with case selection logic
            initializeCase();
        })
        .catch(error => console.error('Error loading cases:', error));

        function initializeCase() {
            if (!currentCase) {
                console.error('No case is selected or available.');
                return;
            }
            
            // Update the UI with the case title
            document.getElementById("caseTitle").textContent = currentCase.title;

            // Load the snippet into the same box as "Today's CaseRace!"
            const caseSnippetElement = document.getElementById("caseSnippet");
            caseSnippetElement.textContent = currentCase.snippet;

            // Hide the proceed button initially
            const proceedButton = document.getElementById("proceedToQuestions");
            proceedButton.style.display = "none";

            // Prepare the case content to be shown after clicking the start button
            const caseContentDiv = document.getElementById("caseContent");
            caseContentDiv.innerHTML = ''; // Clear out any existing content
            currentCase.content.forEach((paragraph) => {
                const p = document.createElement("p");
                p.textContent = paragraph;
                caseContentDiv.appendChild(p);
            });
        
            // Initialize the progress bar
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = "0%";
        
        }
        
    startButton.addEventListener("click", function() {
        // Hide intro and show case study section
        introSection.style.display = "none";
        caseSection.style.display = "block";
        // Start timer for the case study section
        progressBar.style.width = "0%";
    
        setTimeout(() => {
            progressBar.style.width = "100%";
        }, 10);
    
        // Show 'proceed to questions' button after a delay
        setTimeout(function() {
            proceedToQuestions.style.display = "block";
        }, 500);
    
        // After 90 seconds, or when the user decides to proceed, show the first question
        caseTimerId = setTimeout(() => {
            caseSection.style.display = "none";
            resetTimer();  
            questionSection.style.display = "block";
            currentQuestionNumber = 0;
            // This function will need to be updated to handle dynamic questions
            updateQuestionAndAnswers(currentCase.questions[currentQuestionNumber]);
            startQuestionTimer();
        }, 90000);
    });
    
    
    proceedToQuestions.addEventListener("click", function() {
        clearTimeout(caseTimerId); // Clear the caseTimerId when manually proceeding to questions
        caseSection.style.display = "none";
        resetTimer(); 
        questionSection.style.display = "block";
        // Ensure the function uses the current case and question data
        updateQuestionAndAnswers(currentCase.questions[currentQuestionNumber]);
        startQuestionTimer();
    });
    
    function startQuestionTimer() {
        resetTimer(); 
        questionProgressBar.style.width = "0%";
        // Adjust the timeout to smoothly transition the progress bar based on questionTimer
        setTimeout(() => {
            questionProgressBar.style.width = "100%";
        }, questionTimer * 10); // Adjusted to use questionTimer for smooth transition
    
        console.log("questionTimer set to:", questionTimer);
        clearTimeout(questionTransitionTimerId); // Clear any existing question transition timer
        questionTransitionTimerId = setTimeout(goToNextQuestion, questionTimer * 1000); // Set a new timer
    }
    
    
    function resetTimer() {
        clearTimeout(timerId); // Clear the existing timer
        questionTimer = 30; // Reset the timer to 30 seconds (or any other value based on your quiz design)
        console.log("Timer reset to:", questionTimer);
    }
    

    function goToNextQuestion() {
        // Check if the current question was skipped (no answer was selected)
        if (userAnswers.length === currentQuestionNumber) {
            const skippedLapTime = "30.00"; // Default lap time for skipped questions as a string
            userAnswers.push({
                question: currentCase.questions[currentQuestionNumber].text,
                selected: "", // Indicate no answer was selected
                correct: false, // Skipped questions are not correct
                correctAnswer: currentCase.questions[currentQuestionNumber].options[currentCase.questions[currentQuestionNumber].correctAnswer],
                accuracyPoints: 0, // No points for skipped questions
                speedPoints: 0, // No speed points for skipped questions
                lapTime: skippedLapTime // Set the default lap time for skipped questions
            });
        }
    
        if (currentQuestionNumber < currentCase.questions.length - 1) {
            currentQuestionNumber++;
            updateQuestionAndAnswers(currentCase.questions[currentQuestionNumber]);
            resetProgressBar();
            startQuestionTimer();
        } else {
            showResults();
        }
    }
    

    function updateQuestionAndAnswers(currentQuestion) {
        // Record the start time for this question
        questionStartTimes[currentQuestionNumber] = Date.now();
        // Update UI elements with the current question data
        questionNumberHeader.textContent = `Question ${currentQuestionNumber + 1}`;
        document.getElementById("questionText").textContent = currentQuestion.text;
        const answerOptionsDiv = document.getElementById("answerOptions");
        answerOptionsDiv.innerHTML = ""; // Clear previous options
    
        // Dynamically create answer buttons based on the current question's options
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.classList.add("answerButton");
            button.textContent = option;
            // Adjust the click handler to check against the current question's correct answer
            button.onclick = () => handleAnswerSelection(index, currentQuestion.correctAnswer);
            answerOptionsDiv.appendChild(button);
        });
    }
    

    function handleAnswerSelection(selectedIndex, correctIndex) {
        const endTime = Date.now();
        // Calculate lap time in milliseconds, then convert to seconds with two decimal places
        const lapTime = ((endTime - questionStartTimes[currentQuestionNumber]) / 1000).toFixed(2); 
        const isCorrect = selectedIndex === correctIndex;
    
        const accuracyPoints = isCorrect ? [100, 125, 150][currentQuestionNumber] : 0;
        // Ensure calculateSpeedPoints function is adapted to handle precise timing
        const speedPoints = isCorrect ? calculateSpeedPoints(parseFloat(lapTime), currentQuestionNumber) : 0;
    
        userAnswers.push({
            question: currentCase.questions[currentQuestionNumber].text,
            selected: currentCase.questions[currentQuestionNumber].options[selectedIndex],
            correct: isCorrect,
            correctAnswer: currentCase.questions[currentQuestionNumber].options[correctIndex],
            accuracyPoints: accuracyPoints,
            speedPoints: speedPoints,
            lapTime: lapTime // Store precise lap time as a string
        });
    
        goToNextQuestion();
    }
    
    
    function calculateSpeedPoints(questionTime, questionNumber) {
        const baseTimes = [30, 30, 30]; // Consider adjusting these values based on your precision needs
        const multipliers = [1, 1.25, 1.5];
        let points = (baseTimes[questionNumber] - questionTime) * multipliers[questionNumber];
        return points > 0 ? points : 0;
    }
    

    function resetProgressBar() {
        questionProgressBar.classList.remove('active');
        void questionProgressBar.offsetWidth; // Trigger reflow to reset animation
        questionProgressBar.classList.add('active');
    }

// Function to initialize simulated scores once or as needed
function initializeSimulatedScores() {
    let simulatedScores = JSON.parse(localStorage.getItem('allScores'));
    if (!simulatedScores) {
        simulatedScores = [];
        // Generate 100 random scores between a plausible range, e.g., 100 to 487.5
        for (let i = 0; i < 100; i++) {
            simulatedScores.push(Math.floor(Math.random() * (487.5 - 100 + 1) + 100));
        }
        // Save these scores to local storage
        localStorage.setItem('allScores', JSON.stringify(simulatedScores));
    }
}


// Function to save a new score into the local storage
function saveScore(score) {
    // Retrieve the existing scores array, or initialize a new one if it doesn't exist
    let scores = JSON.parse(localStorage.getItem('allScores'));
    if (!scores) {
        scores = [];
    }
    // Append the new score
    scores.push(score);
    // Save the updated array back to local storage
    localStorage.setItem('allScores', JSON.stringify(scores));
}

// Function to retrieve scores ensures it always returns an array
function getScores() {
    const scores = JSON.parse(localStorage.getItem('allScores'));
    return scores || []; // Ensure this always returns an array, even if empty
}

// Function to calculate percentile based on current score and array of scores
function calculatePercentile(currentScore, scores) {
    if (!scores.length) return 0;
    const numberOfScoresBelow = scores.filter(score => score < currentScore).length;
    const percentile = (numberOfScoresBelow / scores.length) * 100;
    return percentile.toFixed(2); // Return the percentile rounded to two decimal places
}
   // Function to display percentile results
//   function displayPercentileResults(score) {
 //   const scores = getScores();
 //   const percentile = calculatePercentile(score, scores);
 //   const percentileDisplay = document.createElement("p");
 //   percentileDisplay.textContent = `Your score is in the ${percentile} percentile of all scores.`;
 //   percentileDisplay.classList.add('pixel-font-text');  // Add this line
 //   resultsSection.insertBefore(percentileDisplay, resultsSection.firstChild);
//}

function calculateTotalCompositeScore() {
    return userAnswers.reduce((total, answer, index) => {
        const accuracyPoints = answer.correct ? [100, 125, 150][index] : 0;
        return total + accuracyPoints + answer.speedPoints;
    }, 0);
}

function showResults() {
    // Clear any active timers
    clearTimeout(caseTimerId);
    clearTimeout(questionTransitionTimerId);

    // Hide the question section and clear previous results
    questionSection.style.display = "none";
    resultsSection.innerHTML = "";

    // Create and append the leaderboard title
    const leaderboardTitle = document.createElement("h1");
    leaderboardTitle.textContent = "PERFORMANCE";
    leaderboardTitle.classList.add("leaderboard-title");
    resultsSection.appendChild(leaderboardTitle);

    // Calculate the total composite score
    const totalCompositeScore = calculateTotalCompositeScore();

    // Save the total score
    saveScore(currentCase["caserace #"], totalCompositeScore.toFixed(2));

    // Calculate percentile ranking
    const scores = JSON.parse(localStorage.getItem('allScores'));
    const percentile = calculatePercentile(totalCompositeScore, scores);

    // Display composite score and percentile
    const compositeScoreDisplay = document.createElement("p");
    // Generate a random number of fellow racers between 5,000 and 20,000
const fellowRacers = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;

compositeScoreDisplay.innerHTML = `CASERACE <span id="compositeScoreLink" style="color: green; text-decoration: underline; cursor: pointer;"> Score: ${totalCompositeScore.toFixed(2)}</span> is in the ${parseInt(percentile)}th percentile of ${fellowRacers.toLocaleString()} fellow racers!`;
    compositeScoreDisplay.classList.add('pixel-font-text');  // Add this line
    resultsSection.appendChild(compositeScoreDisplay);

    // Create and populate the results table
    const resultsTable = createResultsTable();
    resultsSection.appendChild(resultsTable);

    // Call displayAiScores with the AI scores from the current case
    displayAiScores(currentCase.aiScores, totalCompositeScore); // Ensure aiScores are properly structured in your case data

    // Add the click listener for the score info button
    addCompositeScoreClickListener();

    // Create and append the 'Play Prior CaseRaces' button
    const showPriorCasesBtn = createButton("Play Prior CaseRaces", () => {
    fetch('data/cases.json')
        .then(response => response.json())
        .then(data => {
            const sortedCases = data.sort((a, b) => b.date.localeCompare(a.date));
            displayPriorCases(sortedCases);
        })
        .catch(error => console.error('Error loading cases:', error));
    }, "caseRaceButton");
    showPriorCasesBtn.id = "showPriorCasesBtn";
    resultsSection.appendChild(showPriorCasesBtn);

    // Create and append the 'Show Answers and Explanations' button
    const showAnswersBtn = createButton("Show Answers and Explanations", () => showAnswersPopup(userAnswers, currentCase));
    showAnswersBtn.id = "showAnswersBtn";  // Add this line
    resultsSection.appendChild(showAnswersBtn);

    // Finally, make the results section visible
    resultsSection.style.display = "block";
}

function displayAiScores(aiScores, totalCompositeScore) {
    const scores = {...aiScores, "User": totalCompositeScore.toFixed(2)};
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const scoreTable = document.createElement('table');
    Object.assign(scoreTable.style, {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '2px',
        border: '1px solid #4CAF50',
        borderRadius: '4px',
        overflow: 'hidden',
        margin: '20px 0',
        fontFamily: "'Press Start 2P', cursive",
        backgroundColor: 'black',
    });

    // Add table header
    const headerRow = scoreTable.insertRow();
    ['Participant', 'Score'].forEach((text, index) => {
        const th = document.createElement('th');
        th.textContent = text;
        Object.assign(th.style, {
            padding: '10px',
            backgroundColor: 'black',
            borderBottom: '1px solid #4CAF50',
            borderRight: index === 0 ? '1px solid #4CAF50' : 'none',
            color: '#4CAF50',
            textDecoration: 'underline',
            fontWeight: 'normal',
        });
        headerRow.appendChild(th);
    });

    // Add data rows
    sortedScores.forEach(([name, score], rowIndex) => {
        const row = scoreTable.insertRow();
        
        [name, parseFloat(score).toFixed(2)].forEach((text, cellIndex) => {
            const cell = row.insertCell();
            cell.textContent = text;
            const isUser = name === "User";
            Object.assign(cell.style, {
                padding: '10px',
                backgroundColor: 'black',
                borderBottom: rowIndex < sortedScores.length - 1 ? '1px solid #4CAF50' : 'none',
                borderRight: cellIndex === 0 ? '1px solid #4CAF50' : 'none',
                color: isUser ? '#4CAF50' : '#ddd',
            });
        });
    });

    const resultsContainer = document.getElementById('resultsSection');
    const header = document.createElement('h1');
    header.textContent = "You vs. the Machines";
    header.classList.add('leaderboard-title');
    Object.assign(header.style, {
        marginTop: '20px',
        color: '#4CAF50',
        fontFamily: "'Press Start 2P', cursive",
    });
    
    resultsContainer.appendChild(header);
    resultsContainer.appendChild(scoreTable);
}

function createResultsTable() {
    const table = document.createElement('table');
    Object.assign(table.style, {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '2px',
        border: '1px solid #4CAF50',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: "'Press Start 2P', cursive",
        backgroundColor: 'black',
    });

    // Add table header
    const headerRow = table.insertRow();
    ['Question', 'Accuracy', 'Lap Time', 'Speed Bonus', 'Score'].forEach((text, index) => {
        const th = document.createElement('th');
        th.textContent = text;
        Object.assign(th.style, {
            padding: '10px',
            backgroundColor: 'black',
            borderBottom: '1px solid #4CAF50',
            borderRight: index < 4 ? '1px solid #4CAF50' : 'none',
            color: '#4CAF50',
            textDecoration: 'underline',
            fontWeight: 'normal',
        });
        headerRow.appendChild(th);
    });

    // Add data rows
    const questionTypes = ['Easy', 'Medium', 'Hard'];
    let totalAccuracy = 0;
    let totalLapTime = 0;
    let totalSpeedBonus = 0;
    let totalScore = 0;

    userAnswers.forEach((answer, rowIndex) => {
        const row = table.insertRow();
        
        const cellData = [
            questionTypes[rowIndex],
            `${answer.correct ? [100, 125, 150][rowIndex] : 0} of ${[100, 125, 150][rowIndex]} points`,
            `${answer.lapTime} seconds`,
            answer.speedPoints.toFixed(2),
            (answer.correct ? [100, 125, 150][rowIndex] : 0) + answer.speedPoints
        ];

        cellData.forEach((text, cellIndex) => {
            const cell = row.insertCell();
            cell.textContent = cellIndex === 4 ? text.toFixed(2) : text;
            Object.assign(cell.style, {
                padding: '10px',
                backgroundColor: 'black',
                borderBottom: '1px solid #4CAF50',
                borderRight: cellIndex < 4 ? '1px solid #4CAF50' : 'none',
                color: cellIndex === 1 ? (answer.correct ? '#00FF00' : 'red') : '#ddd',
            });
        });

        totalAccuracy += answer.correct ? [100, 125, 150][rowIndex] : 0;
        totalLapTime += parseFloat(answer.lapTime);
        totalSpeedBonus += answer.speedPoints;
        totalScore += cellData[4];
    });

    // Add total row
    const totalRow = table.insertRow();
    ['TOTAL', `${totalAccuracy} points`, `${totalLapTime.toFixed(2)} seconds`, totalSpeedBonus.toFixed(2), totalScore.toFixed(2)]
        .forEach((text, index) => {
            const cell = totalRow.insertCell();
            cell.textContent = text;
            Object.assign(cell.style, {
                padding: '10px',
                backgroundColor: 'black',
                borderRight: index < 4 ? '1px solid #4CAF50' : 'none',
                color: '#4CAF50',
                fontWeight: index === 0 ? 'bold' : 'normal',
            });
        });

    return table;
}
 
    function showAnswersPopup(userAnswers, currentCase) {
        const popup = document.createElement("div");
        popup.id = "answersPopup";
        // Style the popup
        Object.assign(popup.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            border: '2px solid black',
            zIndex: 1000,
            maxHeight: '80%',
            overflowY: 'auto',
            width: '80%',
            maxWidth: '600px'
        });
    
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => document.body.removeChild(popup));
    
        // Append the close button to the popup
        popup.appendChild(closeButton);
    
        // Generate content based on user answers and append to the popup
        userAnswers.forEach((answer, index) => {
            const questionText = document.createElement("p");
            questionText.textContent = `Q${index + 1}: ${currentCase.questions[index].text}`;
            popup.appendChild(questionText);
    
            // Determine if the answer was correct and display the appropriate message
            if (answer.correct) {
                const correctAnswerText = document.createElement("p");
                correctAnswerText.textContent = `Your correct answer: ${answer.selected}`;
                correctAnswerText.style.color = "#4CAF50"; // Green color for correct answers
                correctAnswerText.style.fontWeight = "bold"; // Make text bold
                popup.appendChild(correctAnswerText);
            } else {
                const incorrectAnswerText = document.createElement("p");
                incorrectAnswerText.textContent = `Your incorrect answer: ${answer.selected}`;
                incorrectAnswerText.style.color = "red"; // Red color for incorrect answers
                incorrectAnswerText.style.fontWeight = "bold"; // Make text bold
                popup.appendChild(incorrectAnswerText);
    
                const correctAnswerText = document.createElement("p");
                correctAnswerText.textContent = `Correct answer: ${currentCase.questions[index].options[currentCase.questions[index].correctAnswer]}`;
                correctAnswerText.style.color = "#4CAF50"; // Green color for the correct answer, even if the user was incorrect
                correctAnswerText.style.fontWeight = "bold"; // Make text bold
                popup.appendChild(correctAnswerText);
            }
    
            const explanationText = document.createElement("p");
            explanationText.textContent = `Explanation: ${currentCase.questions[index].explanation}`;
            popup.appendChild(explanationText);
    
            const separator = document.createElement("hr");
            popup.appendChild(separator);
        });
    
    
        document.body.appendChild(popup);
    }
    
    function addCompositeScoreClickListener() {
        const compositeScoreLink = document.getElementById('compositeScoreLink');
        compositeScoreLink.addEventListener('click', function() {
            const popup = document.createElement('div');
            popup.id = 'scoreInfoPopup';
            // Style the popup as necessary
            popup.style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); \
            background-color: white; padding: 20px; border: 2px solid black; z-index: 1000; \
            max-height: 80%; overflow-y: auto; width: 80%; max-width: 600px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); \
            font-family: Arial, sans-serif;";
    
            // Explanation header
            const explanationHeader = document.createElement('h2');
            explanationHeader.textContent = "Composite Score Calculation";
            explanationHeader.style = "text-align: center; margin-bottom: 20px;";
            popup.appendChild(explanationHeader);
    
            // Keep the header for Accuracy Points
            const accuracyPointsHeader = document.createElement('h3');
            accuracyPointsHeader.textContent = "Accuracy Points: Earn Points for Correct Answers";
            popup.appendChild(accuracyPointsHeader);

            // The bulleted list 'accuracyDescriptions' and its appending to the popup is removed

            // Calculate total accuracy points
            const totalAccuracyPoints = userAnswers.reduce((acc, answer, index) => {
                return acc + (answer.correct ? [100, 125, 150][index] : 0);
            }, 0);

            // Calculate total speed points
            const totalSpeedPoints = userAnswers.reduce((acc, answer, index) => {
                return acc + (answer.correct ? calculateSpeedPoints(answer.lapTime, index) : 0);
            }, 0);

            // Add user's accuracy points details
            const userAccuracyDetails = document.createElement('p');
            userAccuracyDetails.innerHTML = `<strong>Your Accuracy Scores: ${totalAccuracyPoints}</strong><br>` +
            'Question 1: ' + (userAnswers[0].correct ? 'Correct (100 out of 100 points)' : 'Incorrect (0 out of 100 points)') + '<br>' +
            'Question 2: ' + (userAnswers[1].correct ? 'Correct (125 out of 125 points)' : 'Incorrect (0 out of 125 points)') + '<br>' +
            'Question 3: ' + (userAnswers[2].correct ? 'Correct (150 out of 150 points)' : 'Incorrect (0 out of 150 points)');
            popup.appendChild(userAccuracyDetails);

            // Speed Points list
            const speedPointsList = document.createElement('ul');
            const speedPointsHeader = document.createElement('h3');
            speedPointsHeader.textContent = "Speed Bonus: Bonus Points for Fast Answers";
            speedPointsList.appendChild(speedPointsHeader);
    
            const speedDescriptions = [
          //      "The Speed Bonus is calculated based on how quickly the player answers each question. The faster the answer, the higher the Speed Bonus. The bonus is calculated using the time taken to answer the question and the level of question difficulty.",
                 ];
    
            speedDescriptions.forEach(text => {
                const li = document.createElement('li');
                li.textContent = text;
                speedPointsList.appendChild(li);
            });
            popup.appendChild(speedPointsList);
            
           // Add user's speed points details including the calculation
            const userSpeedDetails = document.createElement('p');
            userSpeedDetails.innerHTML = `<strong>Your Speed Bonus: ${totalSpeedPoints.toFixed(2)}</strong><br>` +
            'Question 1: ' + (userAnswers[0].correct ? `(30 - ${userAnswers[0].lapTime}) * 1 = ${calculateSpeedPoints(userAnswers[0].lapTime, 0).toFixed(2)}` : '0') + ' points<br>' +
            'Question 2: ' + (userAnswers[1].correct ? `(30 - ${userAnswers[1].lapTime}) * 1.25 = ${calculateSpeedPoints(userAnswers[1].lapTime, 1).toFixed(2)}` : '0') + ' points<br>' +
            'Question 3: ' + (userAnswers[2].correct ? `(30 - ${userAnswers[2].lapTime}) * 1.5 = ${calculateSpeedPoints(userAnswers[2].lapTime, 2).toFixed(2)}` : '0') + ' points';
            popup.appendChild(userSpeedDetails);

      // Calculate total composite score based on user answers
            let totalCompositeScore = userAnswers.reduce((acc, answer, index) => {
                const accuracyPoints = answer.correct ? [100, 125, 150][index] : 0; // Adjust these values as necessary
                const speedPoints = answer.correct ? calculateSpeedPoints(answer.lapTime, index) : 0;
                return acc + accuracyPoints + speedPoints;
            }, 0);

            // Add user's Composite Scoring calculation
            const userTotalScoringDetails = document.createElement('p');
            userTotalScoringDetails.innerHTML = '<strong>Your Total Composite Score: ' + totalCompositeScore.toFixed(2) + '</strong><br>' +
            'Question 1: ' + (userAnswers[0].correct ? '100 Accuracy Points + ' : '0 Accuracy Points + ') +
            (userAnswers[0].correct ? calculateSpeedPoints(userAnswers[0].lapTime, 0).toFixed(2) : '0') + ' Speed Bonus = ' +
            (userAnswers[0].correct ? (100 + calculateSpeedPoints(userAnswers[0].lapTime, 0)).toFixed(2) : '0') + ' Total Points<br>' +
            'Question 2: ' + (userAnswers[1].correct ? '125 Accuracy Points + ' : '0 Accuracy Points + ') +
            (userAnswers[1].correct ? calculateSpeedPoints(userAnswers[1].lapTime, 1).toFixed(2) : '0') + ' Speed Bonus = ' +
            (userAnswers[1].correct ? (125 + calculateSpeedPoints(userAnswers[1].lapTime, 1)).toFixed(2) : '0') + ' Total Points<br>' +
            'Question 3: ' + (userAnswers[2].correct ? '150 Accuracy Points + ' : '0 Accuracy Points + ') +
            (userAnswers[2].correct ? calculateSpeedPoints(userAnswers[2].lapTime, 2).toFixed(2) : '0') + ' Speed Bonus = ' +
            (userAnswers[2].correct ? (150 + calculateSpeedPoints(userAnswers[2].lapTime, 2)).toFixed(2) : '0') + ' Total Points';
            popup.appendChild(userTotalScoringDetails);

            // Assuming userAnswers is an array with user's answers and calculateSpeedPoints is a function
            // that calculates speed points based on lap time and question index

            // The rest of the popup content (userAccuracyDetails and userSpeedDetails) remains unchanged




            // Close button for the popup
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style = "margin-top: 20px; padding: 10px 20px; font-size: 16px;";
            closeButton.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeButton);
    
            // Append the popup to the body
            document.body.appendChild(popup);
        });
    }
    
    
    function saveScore(caseId, score) {
        localStorage.setItem('score_' + caseId, score);
    }
    
    function loadScore(caseId) {
        return localStorage.getItem('score_' + caseId);
    }
    
    
      

      // updateQuestionAndAnswers(0);
});