document.addEventListener("DOMContentLoaded", () => {
    const questions = [
        {
            text: "Netflix’s minimum viable product was designed to be a...",
            options: ["…comprehensive version of a new product with all intended features.", "…basic version of a product with enough features to attract early adopters.", "…prototype used exclusively for internal testing before national product launch."],
            correctAnswer: 1
        },
        {
            text: "MVPs like the Netflix kiosk emerged in the early 2010s as a part of which famous approach to innovation?",
            options: ["Lean Startup Methodology", "Design Thinking", "Intrapreneurship"],
            correctAnswer: 0
        },
        {
            text: "In the context of the Netflix case, validated learning can be best described as:",
            options: ["The process of verifying market demand through extensive surveys and research before product development.", "A technique for learning about customers' needs and preferences through the launch and adjustment of a rudimentary prototype.", "The confirmation of a product's final design through customer feedback and pre-launch marketing strategies."],
            correctAnswer: 1
        }
    ];

    const startButton = document.getElementById("startButton");
    const introSection = document.getElementById("introSection");
    const caseSection = document.getElementById("caseSection");
    const questionSection = document.getElementById("questionSection");
    const questionNumberHeader = document.getElementById("questionNumber");
    const questionProgressBar = document.getElementById("questionProgressBar");
    const resultsSection = document.getElementById("resultsSection"); 
    let currentQuestionNumber = 0;
    let userAnswers = [];
    let questionTimer = 30; // Represents the timer in seconds
    let timerId; // Declare a variable to store the timer ID at the top of your script
    let questionTransitionTimerId; // Add this at the top with other variable declarations
    let caseTimerId; // Declare this variable at the top with your other variables
    let caseStartTime = Date.now(); // When the case study starts
    let questionStartTimes = []; // To store the start time for each question
    let totalAccuracyPoints = 0; // To track total accuracy points
    let totalSpeedPoints = 0; // To track total speed points
    

    // Inside the startButton click event listener
    startButton.addEventListener("click", function() {
        introSection.style.display = "none";
        caseSection.style.display = "block";
        caseStartTime = Date.now(); // Capture case start time
        progressBar.style.width = "0%";

        setTimeout(() => {
            progressBar.style.width = "100%";
        }, 10);

        setTimeout(function() {
            proceedToQuestions.style.display = "block";
        }, 5000);

        // Assign the setTimeout to caseTimerId to manage the 90-second transition
        caseTimerId = setTimeout(() => {
            caseSection.style.display = "none";
            resetTimer();  
            questionSection.style.display = "block";
            currentQuestionNumber = 0;
            updateQuestionAndAnswers(currentQuestionNumber);
            startQuestionTimer();
        }, 90000);
    });
    
    // Inside the proceedToQuestions click event listener
    proceedToQuestions.addEventListener("click", function() {
        clearTimeout(caseTimerId); // Clear the caseTimerId when manually proceeding to questions
        caseSection.style.display = "none";
        resetTimer(); 
        questionSection.style.display = "block";
        updateQuestionAndAnswers(currentQuestionNumber);
        startQuestionTimer();
    });

    function startQuestionTimer() {
        resetTimer(); 
        questionProgressBar.style.width = "0%";
        setTimeout(() => {
            questionProgressBar.style.width = "100%";
        }, 100); 
    
        console.log("questionTimer set to:", questionTimer);
        clearTimeout(questionTransitionTimerId); // Clear any existing question transition timer
        questionTransitionTimerId = setTimeout(goToNextQuestion, questionTimer * 1000); // Set a new timer
    }
    
    

    function resetTimer() {
        clearTimeout(timerId); // Clear the existing timer
        questionTimer = 30; // Reset the timer to 30 seconds
        console.log("Timer reset to:", questionTimer);
    }
    
    

    function goToNextQuestion() {
        // Check if the current question was skipped (no answer was selected)
        if (userAnswers.length === currentQuestionNumber) {
            const skippedLapTime = "30.00"; // Default lap time for skipped questions as a string
            userAnswers.push({
                question: questions[currentQuestionNumber].text,
                selected: "", // Indicate no answer was selected
                correct: false, // Skipped questions are not correct
                correctAnswer: questions[currentQuestionNumber].options[questions[currentQuestionNumber].correctAnswer],
                accuracyPoints: 0, // No points for skipped questions
                speedPoints: 0, // No speed points for skipped questions
                lapTime: skippedLapTime // Set the default lap time for skipped questions
            });
        }
    
        if (currentQuestionNumber < questions.length - 1) {
            currentQuestionNumber++;
            updateQuestionAndAnswers(currentQuestionNumber);
            resetProgressBar();
            startQuestionTimer();
        } else {
            showResults();
        }
    }
    

    function updateQuestionAndAnswers(questionNumber) {
        questionStartTimes[questionNumber] = Date.now(); 
        const currentQuestion = questions[questionNumber];
        questionNumberHeader.textContent = `Question ${questionNumber + 1}`;
        document.getElementById("questionText").textContent = currentQuestion.text;
        const answerOptionsDiv = document.getElementById("answerOptions");
        answerOptionsDiv.innerHTML = "";
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.classList.add("answerButton");
            button.textContent = option;
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
            question: questions[currentQuestionNumber].text,
            selected: questions[currentQuestionNumber].options[selectedIndex],
            correct: isCorrect,
            correctAnswer: questions[currentQuestionNumber].options[correctIndex],
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
        const separatorAfterScore = document.createElement("hr");
        resultsSection.appendChild(separatorAfterScore);
    
         
        // New section for displaying questions, correct answers, and direct explanation text
        const answersSection = document.createElement("div");
        const explanations = [
            "The concept of a Minimum Viable Product (MVP) involves creating a product that, despite being in its earliest stage of development, has enough functionality to satisfy early adopters. The goal is to launch a basic but functional version of the product to the market quickly. This approach allows companies to gather valuable feedback from its initial users, which can then be used to refine and improve the product in a more targeted and efficient manner. In the case of Netflix, their MVP was not their online streaming platform but a simpler, more tangible product: a basic kiosk for DVD rentals. This allowed Netflix to test the viability of their distribution concept directly with customers without committing excessive resources to development.",
            "The Lean Startup Methodology is an approach to business development that emphasizes creating and managing startups in a more efficient way by building minimal versions of new products to measure customer reaction and make adjustments before making significant investments. This methodology encourages startups to launch products quickly, learn from customer feedback, and iterate or pivot as necessary. MVPs are a core component of this approach, as they represent the most stripped-down version of a product that is still viable. The Netflix kiosk experiment, conducted in the early stages of the company, aligns with this methodology by testing a basic version of their product concept in a real-world environment to gauge customer interest and gather insights.",
            "Validated learning is a key concept within the Lean Startup Methodology, focusing on the process of learning about customers' needs, preferences, and behaviors by developing and testing a basic product or service model. It involves a cycle of building, measuring, and learning with the aim of making data-driven decisions as quickly as possible. In Netflix's scenario, validated learning was achieved through their experiment with a manned DVD rental kiosk in a supermarket. By interacting directly with customers and observing their responses to the kiosk, Netflix was able to gather concrete evidence about the market's interest in DVD rentals and the practicality of their distribution model. This feedback loop is crucial for refining business models and ensuring that the product development process is aligned with actual customer needs and market demand."
        ];
        questions.forEach((question, index) => {
            if (index > 0) { // Add separator before new question starts, except before the first one
                const separator = document.createElement("hr");
                answersSection.appendChild(separator);
            }

            const questionElement = document.createElement("p");
            questionElement.textContent = `Q${index + 1} Question: ${question.text}`;
            answersSection.appendChild(questionElement);

            const correctAnswerElement = document.createElement("p");
            correctAnswerElement.textContent = `Q${index + 1} Correct Answer: ${question.options[question.correctAnswer]}`;
            answersSection.appendChild(correctAnswerElement);

            // Directly include the explanation text
            const explanationElement = document.createElement("p");
            explanationElement.textContent = explanations[index]; // Use the explanations array
            answersSection.appendChild(explanationElement);
        });
        resultsSection.appendChild(answersSection);

        resultsSection.style.display = "block";

    }
    
    
    
    
    

       updateQuestionAndAnswers(0);
});