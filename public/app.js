document.addEventListener('DOMContentLoaded', () => {
    // API URL
    const API_URL = '/api/todos';

    // App State
    let todos = [];
    let currentFilter = 'all';
    let searchQuery = '';

    // DOM Elements
    const addTaskForm = document.getElementById('addTaskForm');
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskCategorySelect = document.getElementById('taskCategorySelect');
    const searchBar = document.getElementById('searchBar');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    
    // Stats Elements
    const completedRatio = document.getElementById('completedRatio');
    const completedPercentage = document.getElementById('completedPercentage');
    const progressBarFill = document.getElementById('progressBarFill');

    // Filter Elements
    const filterTabs = document.querySelectorAll('.filter-tab');

    // Modal Elements
    const editModal = document.getElementById('editModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskId = document.getElementById('editTaskId');
    const editTaskTitleInput = document.getElementById('editTaskTitleInput');
    const editTaskCategorySelect = document.getElementById('editTaskCategorySelect');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // Initial Fetch
    fetchTodos();

    // Event Listeners
    addTaskForm.addEventListener('submit', handleAddTask);
    searchBar.addEventListener('input', handleSearch);
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });

    // Modal Event Listeners
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
    editTaskForm.addEventListener('submit', handleSaveEdit);

    // API Calls & Event Handlers
    async function fetchTodos() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch todos');
            todos = await response.json();
            renderTodos();
        } catch (error) {
            console.error('Error fetching todos:', error);
            showNotification('Error loading tasks. Please try again.', 'error');
        }
    }

    async function handleAddTask(e) {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const category = taskCategorySelect.value;

        if (!title) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category })
            });

            if (!response.ok) throw new Error('Failed to create todo');
            
            const newTodo = await response.json();
            todos.push(newTodo);
            
            // Reset input and focus
            taskTitleInput.value = '';
            taskCategorySelect.value = 'General';
            taskTitleInput.focus();

            renderTodos();
            showNotification('Task added successfully!');
        } catch (error) {
            console.error('Error adding todo:', error);
            showNotification('Failed to add task.', 'error');
        }
    }

    async function handleToggleTodo(id, completed) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });

            if (!response.ok) throw new Error('Failed to update todo status');

            const updatedTodo = await response.json();
            
            // Update local state
            todos = todos.map(todo => todo.id === id ? updatedTodo : todo);
            
            // Re-render task item with a small delay for transitions if filtering
            if (currentFilter !== 'all') {
                setTimeout(renderTodos, 250);
            } else {
                renderTodos();
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
            showNotification('Failed to update status.', 'error');
            // Revert checkbox state
            fetchTodos();
        }
    }

    async function handleDeleteTodo(id, itemElement) {
        // Optimistic transition
        itemElement.classList.add('removing');
        
        // Wait for CSS transition (300ms) before deleting from DOM & API
        setTimeout(async () => {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Failed to delete todo');

                todos = todos.filter(todo => todo.id !== id);
                renderTodos();
                showNotification('Task deleted successfully.');
            } catch (error) {
                console.error('Error deleting todo:', error);
                showNotification('Failed to delete task.', 'error');
                fetchTodos(); // Restore original UI state
            }
        }, 300);
    }

    function handleSearch(e) {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTodos();
    }

    function openEditModal(todo) {
        editTaskId.value = todo.id;
        editTaskTitleInput.value = todo.title;
        editTaskCategorySelect.value = todo.category;
        editModal.classList.add('active');
        editTaskTitleInput.focus();
    }

    function closeEditModal() {
        editModal.classList.remove('active');
        editTaskForm.reset();
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        const id = editTaskId.value;
        const title = editTaskTitleInput.value.trim();
        const category = editTaskCategorySelect.value;

        if (!title) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category })
            });

            if (!response.ok) throw new Error('Failed to update todo');

            const updatedTodo = await response.json();
            todos = todos.map(todo => todo.id === id ? updatedTodo : todo);
            
            closeEditModal();
            renderTodos();
            showNotification('Task updated successfully.');
        } catch (error) {
            console.error('Error editing todo:', error);
            showNotification('Failed to update task.', 'error');
        }
    }

    // Render Logic
    function renderTodos() {
        // Clear current items
        taskList.innerHTML = '';

        // Filter and Search logic
        const filteredTodos = todos.filter(todo => {
            const matchesFilter = 
                currentFilter === 'all' || 
                (currentFilter === 'active' && !todo.completed) || 
                (currentFilter === 'completed' && todo.completed);
            
            const matchesSearch = 
                todo.title.toLowerCase().includes(searchQuery) ||
                todo.category.toLowerCase().includes(searchQuery);

            return matchesFilter && matchesSearch;
        });

        // Show/Hide Empty State
        if (filteredTodos.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }

        // Render sorted by creation date (newest first)
        const sortedTodos = [...filteredTodos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `task-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            // Generate category badge style class
            const badgeClass = `badge-${todo.category.toLowerCase()}`;

            li.innerHTML = `
                <div class="task-content">
                    <label class="checkbox-container">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <div class="task-details">
                        <span class="task-title">${escapeHTML(todo.title)}</span>
                        <span class="badge ${badgeClass}">${todo.category}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-icon-edit" title="Edit Task" id="edit-btn-${todo.id}">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon btn-icon-delete" title="Delete Task" id="delete-btn-${todo.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Checkbox event
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                handleToggleTodo(todo.id, e.target.checked);
            });

            // Edit button event
            const editBtn = li.querySelector('.btn-icon-edit');
            editBtn.addEventListener('click', () => {
                openEditModal(todo);
            });

            // Delete button event
            const deleteBtn = li.querySelector('.btn-icon-delete');
            deleteBtn.addEventListener('click', () => {
                handleDeleteTodo(todo.id, li);
            });

            taskList.appendChild(li);
        });

        // Update Statistics Panel
        updateStats();
    }

    function updateStats() {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        
        completedRatio.textContent = `${completed} of ${total} task${total !== 1 ? 's' : ''} completed`;
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        completedPercentage.textContent = `${percentage}%`;
        progressBarFill.style.width = `${percentage}%`;
    }

    // Helper functions
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showNotification(message, type = 'success') {
        // Clean up previous notification if exists
        const oldNotify = document.querySelector('.app-notification');
        if (oldNotify) oldNotify.remove();

        const notification = document.createElement('div');
        notification.className = `app-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            font-size: 0.9rem;
            font-weight: 550;
            z-index: 1100;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        `;
        
        notification.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="margin-right: 8px;"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Trigger show animation
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);

        // Hide and remove
        setTimeout(() => {
            notification.style.transform = 'translateY(20px)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
});
