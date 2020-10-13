const ul = document.querySelector(".messageList");
ul.addEventListener("click", function(e) {
    const target = e.target;

    if(target.classList.contains("deleteMessage")) {
        const id = e.target.parentNode.dataset["id"];
        deleteMessage(id).then(data => {
            window.location.replace("/");
        });
    } else if(target.classList.contains("editMessage")) {
        let li = target.parentNode;

        li.innerHTML = "";
        li.appendChild(renderEditMessageForm(li));
    }
});

function renderEditMessageForm(parent) {
    const form = document.createElement("form");
    form.classList.add("editMessageForm");

    const input = document.createElement("input");
    input.value = parent.dataset.text;

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
    const li = e.target.parentElement.parentElement;

    const input = parent.querySelector("input");
    const msg = {
        "id": li.dataset.id,
        "text": li.dataset.text,
        "date": li.dataset.date,
    };

    li.replaceWith(renderMessage(msg));
}

function renderMessage(msg, parent) {
    const li = document.createElement("li");
    li.dataset["id"] = msg.id;
    li.dataset["text"] = msg.text;
    li.dataset["date"] = msg.date;

    const p_text = document.createElement("p");
    const p_date = document.createElement("p");

    const edit_btn = document.createElement("button");
    edit_btn.classList.add("editMessage");

    const delete_btn = document.createElement("button");
    delete_btn.classList.add("deleteMessage");

    p_text.innerText = msg.text;
    p_date.innerText = new Date(msg.date);
    edit_btn.innerText = "Редактировать";
    delete_btn.innerText = "Удалить";

    li.appendChild(p_text);
    li.appendChild(p_date);
    li.appendChild(edit_btn);
    li.appendChild(delete_btn);

    return li;
}

function onSaveEditMessageFormBtnClick(e) {
    e.preventDefault();

    const parent = e.target.parentElement;
    const input = parent.querySelector("input");
    const li = parent.parentElement;

    const msg = {
        id: li.dataset.id,
        text: input.value,
    };
    const old_text = li.dataset.text;

    if(old_text === msg.text) {
        onCloseEditMessageFormBtnClick(e);
    } else {
        updateMessage(msg).then(data => {
            li.replaceWith(renderMessage(data));
        });
    }
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

async function deleteMessage(id) {
    const res = await fetch("/messages/" + id, {
        method: "DELETE",
    });

    const data = await res.json();
    return data;
}