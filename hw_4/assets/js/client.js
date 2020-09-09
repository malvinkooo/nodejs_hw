const ul = document.getElementById("list");
    
async function getMessagesList(sort, skip, limit) {
    const res = await fetch("/messages?" + "sort=" + sort + "&skip=" + skip + "&limit=" + limit);
    const data = await res.json();

    return data;
}

async function addMessage(msg) {
    const res = await fetch("/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(msg),
    });

    const data = await res.json();

    return data;
}

async function deleteMessage(id) {
    const res = await fetch("/messages/" + id, {
        method: "DELETE",
    });

    const data = res.json();

    return data;
}

async function updateMessage(msg) {
    const res = await fetch("/messages/" + msg.id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({"text": msg.text})
    });

    const data = await res.json();

    return data;
}

function renderMessagesList(list) {
    ul.innerText = "";
    list.forEach(itm => {
        ul.appendChild(renderMessage(itm));
    });
}

function renderMessage(msg, parent) {
    const li = document.createElement("li");
    li.dataset["id"] = msg.id;
    li.dataset["text"] = msg.text;
    li.dataset["created"] = msg.createAt;

    const p_text = document.createElement("p");
    const p_date = document.createElement("p");

    const edit_btn = document.createElement("button");
    edit_btn.classList.add("editMessage");

    const delete_btn = document.createElement("button");
    delete_btn.classList.add("deleteMessage");

    p_text.innerText = msg.text;
    p_date.innerText = new Date(msg.createAt).toISOString();
    edit_btn.innerText = "Редактировать";
    delete_btn.innerText = "Удалить";

    li.appendChild(p_text);
    li.appendChild(p_date);
    li.appendChild(edit_btn);
    li.appendChild(delete_btn);

    return li;
}

function renderEditMessageForm(parent) {
    const form = document.createElement("form");
    form.classList.add("editMessageForm");

    const input = document.createElement("input");
    input.value = parent.dataset.text;
    input.dataset["id"] = parent.dataset.id;
    input.dataset["created"] = parent.dataset.created;
    input.dataset.text = parent.dataset.text;

    const save_btn = document.createElement("button");
    save_btn.innerText = "Сохранить";
    save_btn.type = "Submit";
    save_btn.addEventListener("click", onSaveEditMessageFormBtnClick);

    const cancel_btn = document.createElement("button");
    cancel_btn.innerText = "Отмена";
    cancel_btn.type = "Button";
    cancel_btn.classList.add("closeEditMessageFormBtn");
    cancel_btn.addEventListener("click", onCloseEditMessageFormBtnClick);

    form.appendChild(input);
    form.appendChild(save_btn);
    form.appendChild(cancel_btn);

    return form;
}

function onCloseEditMessageFormBtnClick(e) {
    const parent = e.target.parentElement;

    const input = parent.querySelector("input");
    const msg = {
        "id": input.dataset.id,
        "text": input.dataset.text,
        "createAt": input.dataset.created,
    };

    const li = input.parentElement.parentElement;
    li.replaceWith(renderMessage(msg));
}

function onSaveEditMessageFormBtnClick(e) {
    e.preventDefault();

    const parent = e.target.parentElement;
    const input = parent.querySelector("input");
    const msg = {
        id: input.dataset.id,
        text: input.value,
    };
    const old_text = input.dataset.text;

    if(old_text === msg.text) {
        onCloseEditMessageFormBtnClick(e);
    } else {
        updateMessage(msg).then(data => {
            const li = input.parentElement.parentElement;
            li.replaceWith(renderMessage(data));
        });
    }
}

/* ================== */

getMessagesList().then(data => {
    renderMessagesList(data);
});

const addMessageForm = document.getElementById("addMessageForm");
addMessageForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = document.getElementById("text").value;
    const message = {
        text: text,
    };

    const res = await addMessage(message);
    ul.appendChild(renderMessage(res));
});

ul.addEventListener("click", (e) => {
    const target = e.target;
    if(target.classList.contains("deleteMessage")) {
        let li = target.parentElement;
        const id = li.dataset.id;

        deleteMessage(id).then(res => {
            li.remove();
            li = null;
        });
    }

    if(target.classList.contains("editMessage")) {
        let li = target.parentElement;

        li.innerHTML = "";
        li.appendChild(renderEditMessageForm(li));
    }
}); 

const reloadMessagesBtn = document.getElementById("reloadMessages");
reloadMessagesBtn.addEventListener("click", (e) => {
    const sort = document.getElementById("sort").value;
    const skip = document.getElementById("skip").value;
    const limit = document.getElementById("limit").value;

    getMessagesList(sort, skip, limit).then(data => {
        renderMessagesList(data);
    });
});