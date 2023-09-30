const socket = io()

const $name_input = document.querySelector('.name-input')
const $role = document.querySelector('.role')
const $next_button = document.querySelector('.continue')
const $log_sect = document.querySelector('.login')
const $chat_sect = document.querySelector('.chats')
const $chat_display = document.querySelector('.chat-display')
const $message_input = document.querySelector('.message-input')
const $send_btn = document.querySelector('.send-button')
const $messages_cont = document.querySelector('.messages-cont')
const $img_input = document.querySelector('.img_input')

let uname, $chats
let role = $role.value
let room_name
let inChat = false
const $chats_container = document.querySelector('.chats')

let canWrite = false

let user_chats = [
    {
        'id': 0,
        'name': '10mo A',
        'room': 'course_10',
        'write': false
    },
    {
        'id': 1,
        'name': 'Comunicados',
        'room': 'broadcasts',
        'write': false
    }
]

let teacher_chats = [
    {
        'id': 0,
        'name': '10mo A',
        'room': 'course_10',
        'write': true
    },
    {
        'id': 1,
        'name': 'Comunicados',
        'room': 'broadcasts',
        'write': true
    },
    {
        'id': 2,
        'name': 'Teachers',
        'room': 'teachers',
        'write': true
    }
]

function checkWrite(id){
    if(role=='parent'){
        canWrite = user_chats[id].write
    }else{
        canWrite = teacher_chats[id].write
    }
}

function getRoom(id){
    if(role=='parent'){
        room_name = user_chats[id].room
    }else{
        room_name = teacher_chats[id].room
    }
}

function addMessage(message, from) {
    const messageItem = document.createElement('p');
    const div = document.createElement('div')
    messageItem.textContent = message;
    if(!from){
        div.classList.add('server-message')
    }else if(from==uname){
        div.classList.add('delivered')
    }else if(from!=uname){
        div.classList.add('received')
    }
    div.appendChild(messageItem)
    $messages_cont.appendChild(div);
    $messages_cont.scrollTop = $messages_cont.scrollHeight;
}
function addImg(url, from){
    const img = document.createElement('img')
    const div = document.createElement('div')
    img.src = url
    img.classList.add('img')
    if(!from){
        div.classList.add('server-message')
    }else if(from==uname){
        div.classList.add('delivered')
    }else if(from!=uname){
        div.classList.add('received')
    }
    div.appendChild(img)
    $messages_cont.appendChild(div);
    $messages_cont.scrollTop = $messages_cont.scrollHeight;
}

function sendImg(){
    let image = $img_input.files[0]
    let blob = new Blob([image], { type: image.type })
    let url = URL.createObjectURL(blob)
    socket.emit('broadcastImageToRoom', room_name, url, uname)
    $img_input.value = ""
}

socket.on('message', (message, from) => {
    addMessage(message, from);
});

socket.on('sendImage', (from, url)=>{
    addImg(url, from)
})

$role.addEventListener('change', ()=>{
    role = $role.value
})

$name_input.addEventListener('change', ()=>{
    uname = $name_input.value
})

$next_button.addEventListener('click', ()=>{
    if(!!uname){
        if(role=='teacher'){
            $chats_container.innerHTML = ''
            teacher_chats.forEach((chat)=>{
                let button = document.createElement('button')
                button.textContent = chat.name
                button.id = chat.id
                button.classList.add('chat')
                button.classList.add(chat.room)
                $chats_container.appendChild(button)
            })
        }else{
            $chats_container.innerHTML = ''
            user_chats.forEach((chat)=>{
                let button = document.createElement('button')
                button.textContent = chat.name
                button.id = chat.id
                button.classList.add('chat')
                button.classList.add(chat.room)
                $chats_container.appendChild(button)
            })
        }

        $chats = document.querySelectorAll('.chat')

        $chats.forEach((chat)=>{
            chat.addEventListener('click', ()=>{
                checkWrite(chat.id)
                getRoom(chat.id)

                socket.emit('joinRoom', chat.classList[1], uname)

                $messages_cont.innerHTML = ''

                inChat = true
        
                if(!canWrite){
                    $message_input.setAttribute('placeholder', 'You can not talk in this conversation')
                    $message_input.setAttribute('disabled', true)
                    $img_input.setAttribute('hidden', true)
                    $send_btn.setAttribute('disabled', true)
                }else{
                    $send_btn.removeAttribute('disabled')
                    $message_input.removeAttribute('disabled')
                    $message_input.removeAttribute('placeholder')
                    $img_input.removeAttribute('hidden')
                }
        
                $chat_sect.style.display = "none"
                $chat_display.style.display = "flex"
            })
        })

        $log_sect.style.display = "none"
        $chat_sect.style.display = "block"

    }else{
        alert('Please enter a valid name')
    }
})

$send_btn.addEventListener('click', ()=>{
    if(room_name){
        const message = $message_input.value;
        if (message.trim() !== '') {
            socket.emit('broadcastToRoom', room_name, message, uname);
            $message_input.value = '';
            if($img_input){
                sendImg()
            }
        }else{
            if($img_input){
                sendImg()
            }
        }
    }
})



document.addEventListener('keydown', (e)=>{
    if(e.key=='Enter'){
        if(inChat){
            $send_btn.click()
        }
    }
})

