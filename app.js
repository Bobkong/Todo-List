//Selectors
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');
const todoDate = document.querySelector('.todo-date');

//Variables
var currentFilter = 'all';

//Event Listeners
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', modifyTodo);
filterOption.addEventListener('change', filterTodo);

//Functions
initialTodoItem();

function addTodo(event) {
    // prevent form from submitting
    let todoText = todoInput.value;
    console.log(todoText);
    let todoDeadline = todoDate.value;
    
    const todoItem = {
        text: todoText,
        completed: false,
        deadline: todoDeadline,
        id: GenNonDuplicateID()
    }
    if (todoItem.text != '') {
        // add todo to layout
        addTodoLayout(todoItem);

        // add todo to localstorage
        saveToLocal(todoItem);

        todoInput.value = '';
    }
    
}

function addTodoLayout(todoItem) {
    if (todoItem.text != '') {
        console.log("add new item: " + todoItem.text);

        let newTodoItem = document.createElement('li');
        newTodoItem.classList.add('todo-item');
        newTodoItem.id = todoItem.id;

        // set display
        if(currentFilter == 'completed') {
            newTodoItem.style.display = 'none';
        }

        // set if complete
        if (todoItem.completed) {
            newTodoItem.classList.toggle('complete');
        }

        // create todo text
        let todoText = document.createElement('span');
        todoText.textContent = todoItem.text;
        todoText.classList.add('todo-text');
        newTodoItem.appendChild(todoText);

        let todoDate = document.createElement('span');
        todoDate.innerText = todoItem.deadline;
        todoDate.classList.add('todo-date-text');
        newTodoItem.appendChild(todoDate);

        // create edit button
        let editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-pen"></i>';
        editButton.classList.add('edit-button');
        newTodoItem.appendChild(editButton);

        // create check button
        let completeButton = document.createElement('button');
        completeButton.innerHTML = '<i class="fas fa-check"></i>';
        completeButton.classList.add('check-button');
        newTodoItem.appendChild(completeButton);

        // create delete button
        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.classList.add('delete-button');
        newTodoItem.appendChild(deleteButton);

        console.log("todolist append: " + newTodoItem);
        todoList.appendChild(newTodoItem);
    }
}


function modifyTodo(event) {
    let btnClass = event.target.classList[0];
    if(btnClass == 'check-button') {
        // click check button
        checkItem(event);
    } else if(btnClass == 'delete-button') {
        // click delete button
        deleteItem(event);
    } else if(btnClass == 'edit-button') {
        editItem(event);
    }
}

function checkItem(event) {
    let todoItem = event.target.parentNode;

    let todoText = todoItem.childNodes[0].value;
    console.log(todoText);
    let id = todoItem.id;
    if(todoItem.classList.contains('complete')) {
        updateComplete(false, id);
        todoItem.classList.remove('complete');
    } else {
        updateComplete(true, id);
        todoItem.classList.add('complete');
    }
}

function deleteItem(event) {
    let todoItem = event.target.parentNode;
    // animation
    todoItem.classList.add('fall');
    console.log(todoItem);
    todoItem.addEventListener('transitionend', () => {
        console.log("remove");
        todoItem.remove();
    });
    // remove the todo item from local storage
    deleteTodoFromLocal(todoItem.id)
}

var currentEditId = null;

function editItem(event) {
    console.log(event.target.parentNode);
    for(const node of event.target.parentNode.childNodes) {
        if(node.classList[0] === 'todo-text') {
            todoInput.value = node.textContent;
        } else if (node.classList[0] === 'todo-date-text') {
            todoDate.value = node.textContent;
        }
    }

    let todoIcon = document.querySelector('.todo-button i');
    todoIcon.classList.remove('fa-plus-square');
    todoIcon.classList.add('fa-edit');

    currentEditId = event.target.parentNode.id;
    todoButton.removeEventListener('click', addTodo);
    todoButton.addEventListener('click', editTodo);

}

function editTodo() {
    if (currentEditId != null) {
        updateTextToLocal(currentEditId);
        currentEditId = null;
    }

    let todoIcon = document.querySelector('.todo-button i');
    todoIcon.classList.remove('fa-edit');
    todoIcon.classList.add('fa-plus-square');

    todoButton.addEventListener('click', addTodo);
    todoButton.removeEventListener('click', editTodo);
    
}

// change to a new filter
function filterTodo(event) {
    const todos = todoList.childNodes;
    currentFilter = event.target.value;
    todos.forEach(function(todo) {
        console.log(event.target.value);
        
        switch(event.target.value) {
            case "all":
                todo.style.display = "flex";
                break;
            case "completed":
                if(todo.classList.contains("complete")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "uncompleted":
                if(todo.classList.contains("complete")) {
                    todo.style.display = "none";
                } else {
                    todo.style.display = "flex";
                }
                break;
        }
    })
}

// save a new todo to local storage
function saveToLocal(todo) {
    let todos = getTodos();

    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// get all todos from local storage
function getTodos() {
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    return todos;
}

// initial all todos when loading the page
function initialTodoItem() {
    let todos = getTodos();
    todos.forEach((todo) => {
        addTodoLayout(todo)
    })
}

// update the complete status of a todo item
function updateComplete(completeStatus, id) {
    let todos = getTodos();
    const newTodo = todos.map(todo => {
        if(todo.id == id) {
            return {
                text: todo.text,
                completed: completeStatus,
                deadline: todo.deadline,
                id: todo.id
            };;
        }
        return todo;
    })
    localStorage.setItem('todos', JSON.stringify(newTodo));
}

// remove a todo item
function deleteTodoFromLocal(id) {
    let todos = getTodos();
    let deleteItem = null;
    todos.forEach((todo) => {
        if (todo.id == id) {
            deleteItem = todo;
        }
    });
    todos.splice(deleteItem, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// update the todo item content
function updateTextToLocal(id) {
    let todos = getTodos();
    const newTodo = todos.map(todo => {
        if(todo.id == id) {
            return {
                text: todoInput.value,
                completed: todo.completed,
                deadline: todoDate.value,
                id: todo.id
            };
        }
        return todo;
    });
    localStorage.setItem('todos', JSON.stringify(newTodo));
}

// generate a unique id
function GenNonDuplicateID(){
    return new Date().getTime().toString();
}

// promise
new Promise(function(resolve, reject) {
    setTimeout(() => {
      console.log('111');
      reject('err');
  }, 1000);
  }).then(function() {
      setTimeout(() => {
        console.log('111');
      }, 1000);
  }).catch(function(err) {
    console.log(err);
  });