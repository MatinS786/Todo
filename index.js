document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const tasksLeftSpan = document.getElementById('tasks-left');
    const dateDisplay = document.getElementById('date-display');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
  
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    let currentFilter = 'all';

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.unshift(newTask); 
            saveTasks();
            renderTasks();
            taskInput.value = '';
            taskInput.focus();
            
            addTaskBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => {
                addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
            }, 1500);
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    }

    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}% complete`;
        
        if (progress === 100) {
            progressFill.style.background = 'linear-gradient(90deg, var(--success-color), var(--primary-color))';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--primary-light), var(--primary-color))';
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks found</p>
            `;
            taskList.appendChild(emptyState);
        } else {
            filteredTasks.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                taskItem.dataset.id = task.id;
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <button class="delete-btn" aria-label="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                taskList.appendChild(taskItem);
            });
        }

        updateTaskCount();
        updateProgress();
    }
    
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeftSpan.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'}`;
    }

    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function deleteTask(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.style.transform = 'translateX(100%)';
            taskItem.style.opacity = '0';
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
            }, 300);
        }
    }

    function clearCompletedTasks() {
        if (tasks.some(task => task.completed)) {
            if (confirm('Are you sure you want to clear all completed tasks?')) {
                tasks = tasks.filter(task => !task.completed);
                saveTasks();
                renderTasks();
                
                clearCompletedBtn.innerHTML = '<i class="fas fa-check"></i> Cleared!';
                setTimeout(() => {
                    clearCompletedBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Completed';
                }, 1500);
            }
        }
    }

    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        renderTasks();
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    taskList.addEventListener('click', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.id);
        
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            deleteTask(taskId);
        } else if (e.target.classList.contains('task-checkbox')) {
            toggleTaskCompletion(taskId);
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    renderTasks();
    
    taskInput.focus();
});