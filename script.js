class PomodoroTodo {
    constructor() {
        this.timer = {
            isRunning: false,
            currentTime: 25 * 60, // 25 minutes in seconds
            sessionType: 'work', // 'work', 'shortBreak', 'longBreak'
            sessionCount: 0,
            interval: null,
            durations: {
                work: 25 * 60,
                shortBreak: 5 * 60,
                longBreak: 15 * 60
            }
        };

        this.todos = JSON.parse(localStorage.getItem('pomodoroTodos')) || [];
        
        this.init();
    }

    init() {
        this.initFeatherIcons();
        this.bindEvents();
        this.loadTheme();
        this.renderTodos();
        this.updateTimerDisplay();
        this.updateProgressRing();
    }

    initFeatherIcons() {
        feather.replace();
    }

    bindEvents() {
        // Feature card clicks
        document.getElementById('pomodoroCard').addEventListener('click', () => {
            this.openModal('pomodoroModal');
        });

        document.getElementById('todoCard').addEventListener('click', () => {
            this.openModal('todoModal');
        });

        // Modal close buttons
        document.getElementById('closePomodoroModal').addEventListener('click', () => {
            this.closeModal('pomodoroModal');
        });

        document.getElementById('closeTodoModal').addEventListener('click', () => {
            this.closeModal('todoModal');
        });

        // Click outside modal to close
        document.getElementById('pomodoroModal').addEventListener('click', (e) => {
            if (e.target.id === 'pomodoroModal') {
                this.closeModal('pomodoroModal');
            }
        });

        document.getElementById('todoModal').addEventListener('click', (e) => {
            if (e.target.id === 'todoModal') {
                this.closeModal('todoModal');
            }
        });

        // Timer controls
        document.getElementById('startPauseBtn').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetTimer();
        });

        // Timer settings
        document.getElementById('workDuration').addEventListener('change', (e) => {
            this.updateDuration('work', parseInt(e.target.value));
        });

        document.getElementById('shortBreak').addEventListener('change', (e) => {
            this.updateDuration('shortBreak', parseInt(e.target.value));
        });

        document.getElementById('longBreak').addEventListener('change', (e) => {
            this.updateDuration('longBreak', parseInt(e.target.value));
        });

        // Todo functionality
        document.getElementById('addTodoBtn').addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        document.getElementById('clearCompletedBtn').addEventListener('click', () => {
            this.clearCompleted();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Modal functionality
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // Timer functionality
    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timer.isRunning = true;
        document.getElementById('startPauseBtn').innerHTML = '<i data-feather="pause"></i>Pause';
        feather.replace();

        this.timer.interval = setInterval(() => {
            this.timer.currentTime--;
            this.updateTimerDisplay();
            this.updateProgressRing();

            if (this.timer.currentTime <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        document.getElementById('startPauseBtn').innerHTML = '<i data-feather="play"></i>Start';
        feather.replace();
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.currentTime = this.timer.durations[this.timer.sessionType];
        this.updateTimerDisplay();
        this.updateProgressRing();
    }

    completeSession() {
        this.pauseTimer();
        this.playNotificationSound();
        this.showNotification();
        this.nextSession();
    }

    nextSession() {
        this.timer.sessionCount++;
        
        if (this.timer.sessionType === 'work') {
            // After work session, take a break
            if (this.timer.sessionCount % 4 === 0) {
                this.timer.sessionType = 'longBreak';
            } else {
                this.timer.sessionType = 'shortBreak';
            }
        } else {
            // After break, back to work
            this.timer.sessionType = 'work';
        }

        this.timer.currentTime = this.timer.durations[this.timer.sessionType];
        this.updateTimerDisplay();
        this.updateProgressRing();
        this.updateSessionType();
    }

    updateDuration(type, minutes) {
        this.timer.durations[type] = minutes * 60;
        if (this.timer.sessionType === type) {
            this.timer.currentTime = this.timer.durations[type];
            this.updateTimerDisplay();
            this.updateProgressRing();
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.currentTime / 60);
        const seconds = this.timer.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }

    updateProgressRing() {
        const circle = document.querySelector('.progress-ring-progress');
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const totalTime = this.timer.durations[this.timer.sessionType];
        const progress = (totalTime - this.timer.currentTime) / totalTime;
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDashoffset = offset;
    }

    updateSessionType() {
        const sessionNames = {
            work: 'Work Session',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };
        document.getElementById('sessionType').textContent = sessionNames[this.timer.sessionType];
    }

    playNotificationSound() {
        const audio = document.getElementById('timerSound');
        audio.play().catch(e => console.log('Could not play notification sound:', e));
    }

    showNotification() {
        const sessionNames = {
            work: 'Work session complete! Time for a break.',
            shortBreak: 'Break complete! Ready to focus?',
            longBreak: 'Long break complete! Ready for the next work session?'
        };

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: sessionNames[this.timer.sessionType],
                icon: '/favicon.ico'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Pomodoro Timer', {
                        body: sessionNames[this.timer.sessionType],
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    }

    // Todo functionality
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text === '') return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.renderTodos();
        input.value = '';
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.renderTodos();
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const completedCount = this.todos.filter(t => t.completed).length;
        const totalCount = this.todos.length;
        const remainingCount = totalCount - completedCount;

        if (this.todos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i data-feather="inbox" style="width: 48px; height: 48px; margin-bottom: 1rem; color: hsl(var(--text-secondary));"></i>
                    <p>No tasks yet. Add one above to get started!</p>
                </div>
            `;
        } else {
            todoList.innerHTML = this.todos.map(todo => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-todo-id="${todo.id}">
                        ${todo.completed ? '<i data-feather="check" style="width: 14px; height: 14px;"></i>' : ''}
                    </div>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="todo-delete" data-todo-id="${todo.id}">
                        <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            `).join('');
        }

        // Add event listeners for todo items
        todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const todoId = parseInt(e.currentTarget.getAttribute('data-todo-id'));
                this.toggleTodo(todoId);
            });
        });

        todoList.querySelectorAll('.todo-delete').forEach(deleteBtn => {
            deleteBtn.addEventListener('click', (e) => {
                const todoId = parseInt(e.currentTarget.getAttribute('data-todo-id'));
                this.deleteTodo(todoId);
            });
        });

        // Update stats
        document.getElementById('todoStats').textContent = `${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} remaining`;

        // Update clear completed button visibility
        const clearBtn = document.getElementById('clearCompletedBtn');
        clearBtn.style.display = completedCount > 0 ? 'inline-flex' : 'none';

        feather.replace();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('pomodoroTodos', JSON.stringify(this.todos));
    }

    // Theme functionality
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const icon = document.querySelector('#themeToggle i');
        icon.setAttribute('data-feather', newTheme === 'dark' ? 'sun' : 'moon');
        feather.replace();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon
        const icon = document.querySelector('#themeToggle i');
        icon.setAttribute('data-feather', savedTheme === 'dark' ? 'sun' : 'moon');
        feather.replace();
    }
}

// Initialize the application
const app = new PomodoroTodo();

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
