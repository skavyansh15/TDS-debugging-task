const taskInput = document.getElementById("taskInput")
const addBtn = document.getElementById("addBtn")
const taskList = document.getElementById("taskList")
const emptylistmsg = document.getElementById("emptylistmsg")
const counter = document.getElementById("counter");
const clrBtn = document.getElementById("clrbtn")
function noTaskMsg(){
    if(taskList.children.length === 0){
        emptylistmsg.style.display = "block";
    }else{
        emptylistmsg.style.display = "none";
    }
}
function updateCounter(){
    const allTasks = taskList.querySelectorAll("li");
    let notDoneCount = 0;

    for (let i = 0; i < allTasks.length; i++){
        if (!allTasks[i].classList.contains("done")){
            notDoneCount = notDoneCount + 1;
        }
    }
    counter.textContent = "Your have " + notDoneCount + " tasks left";
}


function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText == ""){
        alert("Being lazy is fine, but we still need a task to add : ) ");
        return;
    }

    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = taskText;

    span.addEventListener("click", function() {
        li.classList.toggle("done");
        updateCounter();
    });

    const deletebtn = document.createElement("button");
    deletebtn.textContent = "Delete";
    deletebtn.classList.add("deletebtn");

    deletebtn.addEventListener("click", function(){
        li.remove();
        noTaskMsg();
        updateCounter();
    });

    li.appendChild(span);
    li.appendChild(deletebtn);

    taskList.appendChild(li);

    taskInput.value = "";
    noTaskMsg();
    updateCounter();
}
function clearCompleted(){
    const allTasks = taskList.querySelectorAll("li");
    for(let i = 0; i< allTasks.length; i++){
        if(allTasks[i].classList.contains("done")) {
            allTasks[i].remove();
        }
    }

    updateEmptyMessage();
    updateCounter();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown",function(event){
    if (event.key === "Enter"){
        addTask();
    }
});
 clrBtn.addEventListener("click",clearCompleted);
noTaskMsg();
updateCounter();