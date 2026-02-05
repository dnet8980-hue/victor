// Состояние приложения
let currentUser = null;
let currentSubject = null;
let currentClass = null;
let currentQuestion = 0;
let score = 0;
let questions = [];
let questionsDatabase = {};

// Загрузить вопросы из JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questionsDatabase = await response.json();
        console.log('Вопросы загружены');
    } catch (error) {
        console.error('Ошибка при загрузке вопросов:', error);
        alert('Ошибка при загрузке вопросов');
    }
}

// Авторизация
function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        currentUser = email;
        document.getElementById('authScreen').classList.remove('active');
        document.getElementById('selectScreen').classList.add('active');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    } else {
        alert('Введите email и пароль');
    }
}

function logout() {
    currentUser = null;
    currentSubject = null;
    currentClass = null;
    currentQuestion = 0;
    score = 0;
    questions = [];
    
    document.getElementById('authScreen').classList.add('active');
    document.getElementById('selectScreen').classList.remove('active');
    document.getElementById('quizScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.remove('active');
}

function updateSelection() {
    const subject = document.getElementById('subject').value;
    const classNum = document.getElementById('class').value;
    const startBtn = document.getElementById('startBtn');
    
    startBtn.disabled = !subject || !classNum;
}

function startQuiz() {
    currentSubject = document.getElementById('subject').value;
    currentClass = document.getElementById('class').value;
    
    if (!currentSubject || !currentClass) {
        alert('Выберите предмет и класс');
        return;
    }
    
    // Получить вопросы для выбранного предмета и класса
    if (questionsDatabase[currentSubject] && questionsDatabase[currentSubject][currentClass]) {
        let availableQuestions = questionsDatabase[currentSubject][currentClass];
        
        // Если вопросов больше 20, выбираем 20 случайных
        if (availableQuestions.length > 20) {
            questions = availableQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
        } else {
            questions = availableQuestions;
        }
    } else {
        alert('Вопросы для этого класса не найдены');
        return;
    }
    
    currentQuestion = 0;
    score = 0;
    
    document.getElementById('selectScreen').classList.remove('active');
    document.getElementById('quizScreen').classList.add('active');
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }
    
    const question = questions[currentQuestion];
    document.getElementById('question').textContent = question.question;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.textContent = option;
        optionEl.onclick = () => selectOption(index);
        optionsDiv.appendChild(optionEl);
    });
    
    updateProgressBar();
}

function updateProgressBar() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('counter').textContent = `${currentQuestion + 1} из ${questions.length}`;
}

function selectOption(index) {
    const question = questions[currentQuestion];
    const options = document.querySelectorAll('.option');
    
    options.forEach((opt, i) => {
        if (i === question.correct) {
            opt.classList.add('correct');
        } else if (i === index && i !== question.correct) {
            opt.classList.add('incorrect');
        }
        opt.style.pointerEvents = 'none';
    });
    
    if (index === question.correct) {
        score++;
    }
    
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}

function showResults() {
    const subjects = {
        'russian': 'Русский язык',
        'history': 'История',
        'kazakh': 'Казахский язык',
        'geography': 'География',
        'music': 'Музыка',
        'math': 'Математика',
        'geometry': 'Геометрия'
    };
    
    const classes = {
        '1': '1 класс', '2': '2 класс', '3': '3 класс', '4': '4 класс', '5': '5 класс',
        '6': '6 класс', '7': '7 класс', '8': '8 класс', '9': '9 класс', '10': '10 класс', '11': '11 класс'
    };
    
    // Вычисляем баллы от 1 до 100
    const percent = (score / questions.length) * 100;
    const finalScore = Math.max(1, Math.round((percent / 100) * 99) + 1);
    
    document.getElementById('quizScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('active');
    
    const scoreCircle = document.getElementById('scoreCircle');
    scoreCircle.textContent = finalScore;
    
    let color = '#f44336';
    let message = 'Нужно повторить материал';
    
    if (percent >= 80) {
        color = '#4caf50';
        message = 'Отлично! Вы хорошо знаете материал!';
    } else if (percent >= 60) {
        color = '#ff9800';
        message = 'Неплохо! Но есть что улучшить.';
    }
    
    scoreCircle.style.color = color;
    document.getElementById('resultMessage').textContent = message;
    document.getElementById('resultSubject').textContent = `${subjects[currentSubject]} - ${classes[currentClass]}`;
    document.getElementById('correctCount').textContent = `Правильных ответов: ${score} из ${questions.length}`;
}

function exitQuiz() {
    if (confirm('Вы уверены? Прогресс будет потерян.')) {
        document.getElementById('quizScreen').classList.remove('active');
        document.getElementById('selectScreen').classList.add('active');
    }
}

function backToSelect() {
    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('selectScreen').classList.add('active');
    document.getElementById('subject').value = '';
    document.getElementById('class').value = '';
    document.getElementById('startBtn').disabled = true;
}

// Загрузить вопросы при загрузке страницы
window.addEventListener('load', loadQuestions);
