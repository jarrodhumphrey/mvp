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
        leaderboardTitle.textContent = "LEADERBOARD";
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
    
        // Horizontal bar separator
       // const separatorAfterScore = document.createElement("hr");
        //resultsSection.appendChild(separatorAfterScore);
    
        // 'Show Prior Cases' button
        const showPriorCasesBtn = document.createElement("button");
        showPriorCasesBtn.id = "showPriorCasesBtn";
        showPriorCasesBtn.classList.add("caseRaceButton"); // Apply the shared style class
        showPriorCasesBtn.textContent = "Access Prior CaseRaces";
        resultsSection.appendChild(showPriorCasesBtn);
    
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