document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
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
        tdCaseNumber.textContent = caseItem["caserace #"];  // Use the caserace # from the JSON

        
        // Date Column
        const tdDate = document.createElement('td');
        // Assuming the date is in 'YYYY-MM-DD' format
        // If it's in 'YYYYMMDD' format, you'll need to insert the dashes as previously described
        const dateParts = caseItem.date.split("-");
        // Date.UTC(year, monthIndex [, day [, hour [, minute [, second [, millisecond]]]]])
        // Month is 0-indexed (January is 0, February is 1, etc.), so subtract 1 from the month part
        const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
        tdDate.textContent = date.toLocaleDateString(undefined, { timeZone: 'UTC' });

        // Topic Column
        const tdTopic = document.createElement('td');
        tdTopic.textContent = caseItem.topic; // Get the topic from the caseItem
        
        // Score Column
        const tdScore = document.createElement('td');
        const playButton = document.createElement('button');
        playButton.textContent = 'Play Now';
        playButton.addEventListener('click', () => {
            modal.style.display = 'none'; // Hide the modal before starting the game
            playCase(caseItem); // Start the game with the selected case
        });
        tdScore.appendChild(playButton);


              
        // Append all the td elements to the row
        tr.appendChild(tdCaseNumber);
        tr.appendChild(tdDate);
        tr.appendChild(tdTopic);
        tr.appendChild(tdScore);
        
        // Clicking on a row should load the case
        tr.onclick = () => {
            clearTimeout(caseTimerId); // Clear the case timer before initializing a new case
            currentCase = caseItem;
            initializeCase();
            modal.style.display = 'none';
            caseSection.style.display = "block";
            questionSection.style.display = "none"; // Ensure questions are hidden until the case starts
            
            // Reset the case progress bar to start the animation
            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = '0%'; // Set the width to 0 to reset the progress bar
        
            // This will start the transition of filling up the progress bar over 90 seconds
            setTimeout(() => {
                progressBar.style.width = '100%'; // This will trigger the CSS transition to start
            }, 10); // Set a short timeout to ensure the transition starts after resetting the width to 0%
        
            // Start the case timer for the new case
            caseTimerId = setTimeout(() => {
                transitionToQuestions(); // This line replaces the placeholder comment
            }, 90000);
        };
        
        
        
    
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
    

            // Load the snippet into the intro section
            document.getElementById("caseSnippet").textContent = currentCase.snippet;
        
            // Assuming the first paragraph of the content array is the introduction or summary
            const introSection = document.getElementById("introSection");
                    
            // Hide the proceed button initially
            const proceedButton = document.getElementById("proceedToQuestions");
            proceedButton.style.display = "none";
        
            // Prepare the case content to be shown after clicking the start button
            const caseContentDiv = document.getElementById("caseContent");
            caseContentDiv.innerHTML = ''; // Clear out any existing content
             currentCase.content.forEach((paragraph, index) => {
                const p = document.createElement("p");
                p.textContent = paragraph;
                caseContentDiv.appendChild(p);
             
            });
        
            // Initialize the progress bar
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = "0%";
        
            // Other initialization as needed...
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

    function showResults() {
        // Clear timers
        clearTimeout(caseTimerId);
        clearTimeout(questionTransitionTimerId);
        questionSection.style.display = "none";
        resultsSection.innerHTML = "";
    
        // Leaderboard title
        const leaderboardTitle = document.createElement("h1");
        leaderboardTitle.textContent = "TIME TRIAL RESULTS";
        resultsSection.appendChild(leaderboardTitle);
    
        let totalCompositeScore = 0;
        let totalTime = 0; // Initialize total time
    
        userAnswers.forEach((answer, index) => {
            const validAccuracyPoints = Number.isFinite(answer.accuracyPoints) ? answer.accuracyPoints : 0;
            const validSpeedPoints = Number.isFinite(answer.speedPoints) ? answer.speedPoints : 0;
    
            const lapTimeInSeconds = parseFloat(answer.lapTime);
            totalTime += lapTimeInSeconds; // Sum lap times
    
            const questionResult = document.createElement("p");
            questionResult.innerHTML = `Q${index + 1}:<br>Lap Time: ${answer.lapTime} seconds<br>Accuracy: ${validAccuracyPoints},<br>Speed Bonus: ${validSpeedPoints.toFixed(2)}.`;
            resultsSection.appendChild(questionResult);
    
            totalCompositeScore += validAccuracyPoints + validSpeedPoints;
        });
    
        const totalScoreElement = document.createElement("p");
        totalScoreElement.textContent = `CaseRace Composite Score: ${totalCompositeScore.toFixed(2)}`;
        resultsSection.appendChild(totalScoreElement);
    
        const totalTimeElement = document.createElement("p");
        totalTimeElement.textContent = `Total Time: ${totalTime.toFixed(2)} seconds`;
        resultsSection.appendChild(totalTimeElement);
    
          

        // 'Show Prior Cases' button
        const showPriorCasesBtn = document.createElement("button");
        showPriorCasesBtn.id = "showPriorCasesBtn";
        showPriorCasesBtn.classList.add("caseRaceButton"); // Apply the shared style class
        showPriorCasesBtn.textContent = "Access Prior CaseRaces";
        resultsSection.appendChild(showPriorCasesBtn);
    
        showPriorCasesBtn.addEventListener('click', () => {
            fetch('data/cases.json')
                .then(response => response.json())
                .then(data => {
                    const sortedCases = data.sort((a, b) => b.date.localeCompare(a.date));
                    displayPriorCases(sortedCases);
                })
                .catch(error => console.error('Error loading cases:', error));
        });
        

        // 'Show Answers and Explanations' button
        const showAnswersBtn = document.createElement("button");
        showAnswersBtn.id = "showAnswersBtn"; // You can keep the ID if you need it for other specific purposes
        showAnswersBtn.classList.add("caseRaceButton"); // Apply the shared style class
        showAnswersBtn.textContent = "Show Answers and Explanations";
        resultsSection.appendChild(showAnswersBtn);
        showAnswersBtn.addEventListener("click", () => showAnswersPopup(userAnswers, currentCase));
            
        resultsSection.style.display = "block";
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
    
  
    
    
      

      // updateQuestionAndAnswers(0);
});