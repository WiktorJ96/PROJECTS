describe('TODO List', () => {
  beforeEach(() => {

    document.body.innerHTML = `
      <input class="todo-input" type="text">
      <button class="add-btn"></button>
      <p class="alert-info"></p>
      <ul class="todo-list"></ul>
    `;
    main(); 
  });

  it('should add a new task', () => {
    $todoInput.value = 'New Task';
    $addBtn.click();
    expect($ulList.children.length).toBe(1);
    expect($ulList.firstChild.firstChild.textContent).toContain('New Task');
  });

  it('should not add an empty task', () => {
    $todoInput.value = '';
    $addBtn.click();
    expect($ulList.children.length).toBe(0);
    expect($alertInfo.textContent).toBe(translations[language].emptyTask);
  });

  it('should not add a duplicate task', () => {
    $todoInput.value = 'Task';
    $addBtn.click();
    $todoInput.value = 'Task';
    $addBtn.click();
    expect($ulList.children.length).toBe(1);
    expect($alertInfo.textContent).toBe(translations[language].duplicateTask);
  });

  it('should delete a task', () => {
    $todoInput.value = 'Task to delete';
    $addBtn.click();
    const deleteBtn = $ulList.querySelector('.delete');
    deleteBtn.click();
    expect($ulList.children.length).toBe(0);
  });

  it('should mark a task as completed', () => {
    $todoInput.value = 'Task to complete';
    $addBtn.click();
    const completeBtn = $ulList.querySelector('.complete');
    completeBtn.click();
    expect($ulList.firstChild.classList.contains('completed')).toBe(true);
  });
});